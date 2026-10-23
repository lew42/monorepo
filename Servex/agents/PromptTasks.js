import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { place } from "../home.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AI = path.resolve(HERE, "..", "..", "public", "framework", "ai");

/* OWNER PROMPTS BECOME TASKS (the owner, 2026-10-22: "owner prompts become tasks on the session page in real time").
 * prompt-relay.mjs writes each owner prompt as a `Prompt` item on the session's page.jsonl (the old card folder,
 * ai/YYYY/MM/DD/<slug>/); page_add calls `hooks.prompted` (page_tools.js). Here, one at a time:
 *   1. the prompt's record is started in the session's prompts.jsonl, the `live` process of Server/PromptRecords.mjs: raw, numbered
 *      sentences, then ONE Haiku call that splits it into parts, 1 to 3 main asks with their details nested, rules kept apart
 *      (PromptRecords.PARTS_BRIEF; 2026-10-23: brief v3 filed one flat task per sentence, directions included);
 *   2. each top-level ask is filed as a PROPOSED task (state waiting, on the owner; its details in the description) in the session's own record,
 *      ai/sessions/YYYY/MM/DD/<slug>/session.jsonl, through the item tool, so the session page shows it live and the
 *      owner approves or rejects it there (a `decide` line, core/Session/Session.js).
 * ONLY THE OWNER'S OWN VS CODE TABS (the owner, 2026-10-22): the page_add caller must be "owner" (prompt-relay.mjs, which skips
 * Servex-started sessions) and the record's line 1 must say kind "vscode-tab" (session-page.mjs, which also skips them). An SDK
 * agent's prompt is never refined here.
 * ON/OFF: `node Servex/agents/PromptTasks.js off` (or `on`, `status`) writes or removes prompt-tasks.off in the Servex home,
 * read on every prompt, so it switches without a restart. SERVEX_NO_PROMPT_TASKS=1 turns it off for a whole Servex run.
 * Doc: core/Session/doc/prompt-tasks.md. */
export default class PromptTasks {

	static MIN_CHARS = 30;   // the same floor RefineQueue uses
	static OFF_FILE = () => place("prompt-tasks.off");   // the runtime switch: present = off

	static off(){ return fs.existsSync(PromptTasks.OFF_FILE()); }
	static set(on){ const f = PromptTasks.OFF_FILE(); if (on) fs.rmSync(f, { force: true }); else fs.writeFileSync(f, new Date().toISOString() + "\n"); return !PromptTasks.off(); }

	constructor(...args){ Object.assign(this, ...args); this.chain = Promise.resolve(); this.seen = new Set(); this.ai ??= AI; }

	// hooks.prompted: queue it; prompts are refined one at a time, in the order they were written.
	prompted(p){
		const key = `${p?.file}:${p?.line}`;
		if (!p?.text || this.seen.has(key) || p.text.trim().length < PromptTasks.MIN_CHARS || /^\s*\//.test(p.text)) return this.chain;   // "try again?" and /commands hold no task
		if (p.by !== "owner" || (this.off ?? PromptTasks.off)()) return this.chain;   // only the owner's own prompts, and only while switched on
		this.seen.add(key);
		return this.chain = this.chain.then(() => this.run(p))
			.then(r => { if (r?.ok === false) this.say?.(`prompt-tasks: ${p.file}:${p.line} not filed: ${r.why ?? r.error ?? "refine failed"}`); return r; })   // never quiet (a renamed card folder, a failed refine)
			.catch(e => this.say?.(`prompt-tasks: ${e.message || e}`));
	}

	// The session's record for a prompt page: ai/YYYY/MM/DD/<slug>/page.jsonl -> ai/sessions/YYYY/MM/DD/<slug>/session.jsonl.
	record_for(page_file){
		const rel = path.relative(this.ai, path.dirname(page_file)).split(path.sep).join("/");
		if (!/^\d{4}\/\d{2}\/\d{2}\/[^/]+$/.test(rel)) return null;   // only a dated card folder
		const file = path.join(this.ai, "sessions", ...rel.split("/"), "session.jsonl");
		if (!fs.existsSync(file)) return null;   // made by the SessionStart hook; never made here
		let first = null; try { first = JSON.parse(fs.readFileSync(file, "utf8").split("\n")[0]).session; } catch {}
		if (first?.kind !== "vscode-tab" || !first.id) return null;   // only an owner's VS Code tab (session-page.mjs); never an SDK agent's session
		return { file, rel, uuid: first.id, page_url: `/framework/ai/${rel}/`, record_url: `/framework/ai/sessions/${rel}/session.jsonl` };
	}

	// The live process (Server/PromptRecords.mjs), one per session, loaded on first use. A test passes its own `records`.
	async live(rec){
		this.lives ??= new Map();
		if (!this.lives.has(rec.uuid)){ const { default: PromptRecords } = await import("../../Server/PromptRecords.mjs");
			this.lives.set(rec.uuid, new PromptRecords(rec.uuid, { process: "live", folder: path.dirname(rec.file), by: "prompt-tasks" })); }
		return this.lives.get(rec.uuid);
	}

	/* ON APPROVAL, HOME (the TaskLoop tick, every 5 minutes): a proposal the owner approved on the session page that names a module
	 * (`module_hint`, the splitter's guess) moves to <module>/tasks/<slug>/ (move_nested_home, page_tools.js). One with no module, or a
	 * module that is not a folder under public/framework, stays in its session; it is not tried again until Servex restarts. */
	async sweep({ days = 14, now = Date.now() } = {}){
		const { move_nested_home } = await import("./page_tools.js");
		const { default: Session } = await import("../../public/framework/core/Session/Session.js");
		this.refused ??= new Set();
		const moved = [];
		for (const file of this.records(days, now)){
			let s; try { s = Session.replay(fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l ? [JSON.parse(l)] : []; } catch { return []; } })); } catch { continue; }
			for (const t of s._tasks ?? []){
				const key = `${file}#${t.id}`, hint = t.get_one("module_hint");
				if (this.refused.has(key) || t.data.path || !hint || !(typeof t.get_one("source") === "object" ? t.get_one("source")?.prompt : String(t.get_one("source") ?? "").startsWith("prompt:"))) continue;
				if (!["running", "paused", "complete"].includes(t.state)) continue;   // approved (waiting = still a proposal; stopped = Reject)
				const r = await move_nested_home(file, t.id, String(hint).replace(/^\/?(public\/)?framework\//, ""), "PromptTasks");
				if (r.why) this.refused.add(key); else moved.push(r);
			}
		}
		return moved;
	}

	// The session records PromptTasks may have filed into: session.jsonl files of the last `days` days that hold a prompt-made task.
	records(days, now){
		const out = [];
		for (let d = 0; d < days; d++){
			const day = new Date(now - d * 864e5), dir = path.join(this.ai, "sessions", String(day.getFullYear()), String(day.getMonth() + 1).padStart(2, "0"), String(day.getDate()).padStart(2, "0"));
			let names = []; try { names = fs.readdirSync(dir); } catch { continue; }
			for (const n of names){
				const f = path.join(dir, n, "session.jsonl");
				try { { const t = fs.readFileSync(f, "utf8"); if (t.includes('"source":"prompt:') || t.includes('"source":{"session"')) out.push(f); } } catch {}
			}
		}
		return out;
	}

	async run(p){
		const rec = this.record_for(p.file);
		if (!rec) return { ok: false, why: "no VS Code tab session record for this prompt page" };
		const R = await this.live(rec), prompt = { uuid: p.id ?? `relay-${p.line}`, line: p.line, at: p.at, text: p.text };
		await R.sentences([prompt]);
		const parts = await R.parts_one(prompt), filed = await R.file([prompt]);   // only top-level asks; rules and questions stay on the record
		return { ok: true, parts: parts.length, filed };
	}
}

// The switch: node Servex/agents/PromptTasks.js on | off | status
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const verb = process.argv[2] ?? "status";
	if (verb === "on" || verb === "off") PromptTasks.set(verb === "on");
	console.log(`prompt tasks: ${PromptTasks.off() ? "off" : "on"} (${PromptTasks.OFF_FILE()} ${PromptTasks.off() ? "present" : "absent"})`);
}
