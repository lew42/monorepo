import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AI = path.resolve(HERE, "..", "..", "public", "framework", "ai");

/* OWNER PROMPTS BECOME TASKS (the owner, 2026-10-22: "owner prompts become tasks on the session page in real time").
 * prompt-relay.mjs writes each owner prompt as a `Prompt` item on the session's page.jsonl (the old card folder,
 * ai/YYYY/MM/DD/<slug>/); page_add calls `hooks.prompted` (page_tools.js). Here, one at a time:
 *   1. one Haiku call splits the prompt into asks (RefineQueue.one, brief v3; the refined card lands beside the prompt,
 *      which is what the session page's Coverage tab already reads);
 *   2. each ask of kind `task` is filed as a PROPOSED task (state waiting, on the owner) in the session's own record,
 *      ai/sessions/YYYY/MM/DD/<slug>/session.jsonl, through the item tool, so the session page shows it live and the
 *      owner approves or rejects it there (a `decide` line, core/Session/Session.js).
 * Off: SERVEX_NO_PROMPT_TASKS=1. Doc: core/Session/doc/prompt-tasks.md. */
export default class PromptTasks {

	static KINDS = ["task"];
	static MIN_CHARS = 30;   // the same floor RefineQueue uses   // questions and statements stay on the refined card; only work becomes a task

	constructor(...args){ Object.assign(this, ...args); this.chain = Promise.resolve(); this.seen = new Set(); this.ai ??= AI; }

	// hooks.prompted: queue it; prompts are refined one at a time, in the order they were written.
	prompted(p){
		const key = `${p?.file}:${p?.line}`;
		if (!p?.text || this.seen.has(key) || p.text.trim().length < PromptTasks.MIN_CHARS || /^\s*\//.test(p.text)) return this.chain;   // "try again?" and /commands hold no task
		this.seen.add(key);
		return this.chain = this.chain.then(() => this.run(p)).catch(e => this.say?.(`prompt-tasks: ${e.message || e}`));
	}

	// The session's record for a prompt page: ai/YYYY/MM/DD/<slug>/page.jsonl -> ai/sessions/YYYY/MM/DD/<slug>/session.jsonl.
	record_for(page_file){
		const rel = path.relative(this.ai, path.dirname(page_file)).split(path.sep).join("/");
		if (!/^\d{4}\/\d{2}\/\d{2}\/[^/]+$/.test(rel)) return null;   // only a dated card folder
		const file = path.join(this.ai, "sessions", ...rel.split("/"), "session.jsonl");
		if (!fs.existsSync(file)) return null;   // made by the SessionStart hook; never made here
		let uuid = null;
		try { const first = JSON.parse(fs.readFileSync(file, "utf8").split("\n")[0]); uuid = typeof first.session === "string" ? first.session : first.session?.id ?? null; } catch {}
		return { file, rel, uuid, page_url: `/framework/ai/${rel}/`, record_url: `/framework/ai/sessions/${rel}/session.jsonl` };
	}

	// The splitter: RefineQueue's one call (Server/RefineQueue.mjs), loaded on first use. A test passes its own.
	async refine(p){
		this.queue ??= new (await import("../../Server/RefineQueue.mjs")).default({ brief: "v3", parallel: 1 });
		return this.queue.one(p);
	}

	async run(p){
		const rec = this.record_for(p.file);
		if (!rec) return { ok: false, why: "no session record for this prompt page" };
		const run = await this.refine({ session: rec.uuid ?? rec.rel, page: rec.page_url, line: p.line, at: p.at, uuid: p.id, text: p.text });
		if (!run?.ok) return run;
		const filed = [];
		for (const ask of (run.items ?? []).filter(a => PromptTasks.KINDS.includes(a.kind))){
			const add = { title: String(ask.text).slice(0, 200), state: "waiting", waiting_on: "owner", from: "owner", source: `prompt:${p.id ?? p.line}`,
				...(ask.details ? { description: String(ask.details).slice(0, 600) } : {}), ...(ask.module ? { module_hint: ask.module } : {}) };
			const r = await run_item({ path: rec.record_url, delta: { tasks: { add } } }, { caller: "owner", source: "prompt-tasks" });
			filed.push(r?.ok ? (r.ids?.[0] ?? add.title) : { refused: r?.why });
		}
		return { ...run, filed };
	}
}
