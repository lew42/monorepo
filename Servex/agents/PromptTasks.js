import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { place } from "../home.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AI = path.resolve(HERE, "..", "..", "public", "framework", "ai");

/* OWNER PROMPTS BECOME TASKS (the owner, 2026-10-22: "owner prompts become tasks on the session page in real time").
 * prompt-relay.mjs writes each owner prompt as a `Prompt` item on the session's page.jsonl (the old card folder,
 * ai/YYYY/MM/DD/<slug>/); page_add calls `hooks.prompted` (page_tools.js). Here, one at a time:
 *   1. the prompt's record is started in the session's prompts.jsonl, the `live` process of Server/PromptRecords.mjs: raw, numbered
 *      sentences, then ONE Haiku call that splits it into parts, every ask the prompt holds, with their details nested, rules kept apart
 *      (PromptRecords.PARTS_BRIEF; 2026-10-23: brief v3 filed one flat task per sentence, directions included);
 *   2. each top-level ask is filed as an idle task (its details in the description) in the session's own record,
 *      ai/sessions/YYYY/MM/DD/<slug>/session.jsonl, through the item tool, so the session page shows it live; nothing waits on the owner.
 * ONLY THE OWNER'S OWN VS CODE TABS (the owner, 2026-10-22): the page_add caller must be "owner" (prompt-relay.mjs, which skips
 * Servex-started sessions) and the record's line 1 must say kind "vscode-tab" (session-page.mjs, which also skips them). An SDK
 * agent's prompt is never refined here.
 * ONLY TURNS A PERSON TYPED (vscode-mastermind, 2026-10-22: 13 tasks were filed from a tab's CronCreate check-ins, "Mastermind check: …"):
 * the transcript stamps every user turn with `turnOrigin` ("human", "scheduled", "task_notification"); `human()` finds the prompt's
 * line there and refines it only when it says "human". No transcript line found (an older Claude Code, a test) = refined as before.
 * ON/OFF: `node Servex/agents/PromptTasks.js off` (or `on`, `status`) writes or removes prompt-tasks.off in the Servex home,
 * read on every prompt, so it switches without a restart. SERVEX_NO_PROMPT_TASKS=1 turns it off for a whole Servex run.
 * Doc: core/Session/doc/prompt-tasks.md. */
export default class PromptTasks {

	static MIN_CHARS = 30;   // the same floor RefineQueue uses
	static OFF_FILE = () => place("prompt-tasks.off");   // the runtime switch: present = off

	static off(){ return fs.existsSync(PromptTasks.OFF_FILE()); }
	/** Accepted: approved (approve() leaves it idle with an approve verdict) or already started. A waiting proposal is not. */
	static accepted(t){ return ["running", "paused", "complete"].includes(t.state) || (t.state === "idle" && t.get_one("verdict")?.is === "approve"); }
	/** The module that holds a file: the deepest folder under public/framework with a readme.md, as "ext/Refine". null when none. */
	static module_of(file){
		if (!file) return null;
		const fw = path.resolve(AI, ".."), segs = String(file).replace(/^\/?(public\/)?framework\//, "").split(/[\\/]/).filter(Boolean);
		for (let n = segs.length; n > 0; n--){ const rel = segs.slice(0, n).join("/"); if (fs.existsSync(path.join(fw, rel, "readme.md"))) return rel; }
		return null;
	}
	static set(on){ const f = PromptTasks.OFF_FILE(); if (on) fs.rmSync(f, { force: true }); else fs.writeFileSync(f, new Date().toISOString() + "\n"); return !PromptTasks.off(); }

	constructor(...args){ Object.assign(this, ...args); this.chain = Promise.resolve(); this.seen = new Set(); this.ai ??= AI; }

	// hooks.prompted: queue it; prompts are refined one at a time, in the order they were written.
	prompted(p){
		const key = `${p?.file}:${p?.line}`;
		if (!p?.text || this.seen.has(key) || p.text.trim().length < PromptTasks.MIN_CHARS || /^\s*\//.test(p.text)) return this.chain;   // "try again?" and /commands hold no task
		if (p.by !== "owner" || (this.off ?? PromptTasks.off)()) return this.chain;   // only the owner's own prompts, and only while switched on
		this.seen.add(key);
		return this.chain = this.chain.then(async () => {
			const rec = this.record_for(p.file);
			if (rec && await this.human(rec.uuid, p.text) === false) return { ok: true, skipped: "not typed by a person (turnOrigin)" };
			return this.run(p);
		})
			.then(r => { if (r?.ok === false) this.say?.(`prompt-tasks: ${p.file}:${p.line} not filed: ${r.why ?? r.error ?? "refine failed"}`); return r; })   // never quiet (a renamed card folder, a failed refine)
			.catch(e => this.say?.(`prompt-tasks: ${e.message || e}`));
	}

	static TRANSCRIPTS = () => path.join(os.homedir(), ".claude", "projects");
	/* Was this prompt typed by a person? The tab's transcript line for it carries `turnOrigin`. true / false, or null when no line
	 * with that text is found. The hook fires before Claude Code writes the line, so it looks again for up to ~3 s. A test passes `transcript`. */
	async human(uuid, text, { tries = 4, wait = 750 } = {}){
		const file = this.transcript?.(uuid) ?? (() => { try { for (const d of fs.readdirSync(PromptTasks.TRANSCRIPTS())){ const f = path.join(PromptTasks.TRANSCRIPTS(), d, uuid + ".jsonl"); if (fs.existsSync(f)) return f; } } catch {} return null; })();
		if (!file) return null;
		const want = String(text).trim();
		for (let i = 0; i < tries; i++){
			let lines = []; try { lines = fs.readFileSync(file, "utf8").split("\n"); } catch {}
			for (let j = lines.length - 1; j >= 0; j--){
				if (!lines[j].includes('"type":"user"')) continue;
				let l; try { l = JSON.parse(lines[j]); } catch { continue; }
				const c = l.message?.content, said = typeof c === "string" ? c : Array.isArray(c) ? c.filter(x => x.type === "text").map(x => x.text).join("\n") : "";
				if (said.trim() !== want) continue;
				return l.turnOrigin ? l.turnOrigin === "human" : null;
			}
			if (i < tries - 1) await new Promise(r => setTimeout(r, wait));
		}
		return null;
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

	/* ON APPROVAL, HOME (OFF by default, MODULE_HOMES; the TaskLoop tick, every 5 minutes): an accepted prompt task moves to <module>/tasks/<slug>/ (move_nested_home,
	 * page_tools.js). Accepted = approved (idle with an approve verdict) or already started. Its module is `module_hint` (the parts model's
	 * guess), else the module that holds its `file_hint` (PromptTasks.module_of). THE DEFAULT HOME (crack 2, core/Task/doc/cracks.md): a task
	 * with neither, or a module that is not a folder, stays a task in its own session's record, where the session page lists it and the
	 * session's completion counts it; it is not tried again until Servex restarts. */
	// Off since 2026-10-26 (the owner): a task stays in the session that filed it; a module home only when asked. Set true to bring the sweep back.
	static MODULE_HOMES = false;
	async sweep({ days = 14, now = Date.now() } = {}){
		if (!PromptTasks.MODULE_HOMES) return [];
		const { move_nested_home } = await import("./page_tools.js");
		const { default: Session } = await import("../../public/framework/core/Session/Session.js");
		this.refused ??= new Set();
		const moved = [];
		for (const file of this.records(days, now)){
			let s; try { s = Session.replay(fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l ? [JSON.parse(l)] : []; } catch { return []; } })); } catch { continue; }
			for (const t of s._tasks ?? []){
				const key = `${file}#${t.id}`, hint = t.get_one("module_hint") || PromptTasks.module_of(t.get_one("file_hint"));
				if (this.refused.has(key) || t.data.path || !hint || !(typeof t.get_one("source") === "object" ? t.get_one("source")?.prompt : String(t.get_one("source") ?? "").startsWith("prompt:"))) continue;
				if (!PromptTasks.accepted(t)) continue;   // waiting = still a proposal; stopped = Reject
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
				try { const t = fs.readFileSync(f, "utf8"); if (t.includes('"source":"prompt:') || t.includes('"source":{"session"')) out.push(f); } catch {}
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
