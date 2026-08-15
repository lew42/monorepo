/**
 * An append-only .jsonl log, assembled back into object state.
 *
 * One JSON object per line, one verb per key, the value self-contained:
 *
 *   {"assign": {"title": "jsonl", "now": "building"}}
 *   {"log": {"at": "2026-08-14T11:01-05:00", "msg": "started"}}
 *   {"action": {"at": "…", "did": "edit", "file": "…"}}
 *
 * `assign` replays onto the instance — the same Object.assign the constructor
 * runs — so the assembled log quacks like the POJO it replaces. `log` and
 * `action` append. Reading is tolerant: a torn line or an unknown verb loses
 * that line, never the log.
 */
export class JSONL {
	static verbs = ["assign", "log", "action"];

	logs = [];
	actions = [];
	skipped = [];

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	static parse(text){
		const entries = [];
		for (const line of text.split("\n")){
			if (!line.trim()) continue;
			try { entries.push(JSON.parse(line)); }
			catch { console.warn("JSONL: bad line skipped —", line); }
		}
		return entries;
	}

	// ⚠ The SPA fallback answers a miss with index.html — content-type is the 404.
	async load(){
		const res = await fetch(this.url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return this;
		this.loaded = true;
		return this.read(JSONL.parse(await res.text()));
	}

	read(entries){
		entries.forEach(entry => this.apply(entry));
		return this;
	}

	apply(entry){
		for (const verb of Object.keys(entry))
			this.constructor.verbs.includes(verb) ? this[verb](entry[verb]) : this.skip(verb, entry);
		return this;
	}

	log(value){ this.logs.push(value); }
	action(value){ this.actions.push(value); }
	skip(verb, entry){ this.skipped.push(entry); console.warn(`JSONL: unknown verb "${verb}"`, entry); }
}

/**
 * The task manifest as a log — the fields session.json held, arriving as
 * `assign` lines. `agent` appends at dispatch and merges by `task` when the
 * same agent lands with its outcome.
 *
 * Progress is two assigned fields, never a verb: `steps` (the outline, declared
 * once) and `step` (the 1-based index underway). See `stats.js`'s `progress()`.
 */
export class TaskJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "agent", "chat"];

	agents = [];
	chats = [];

	agent(value){
		const known = this.agents.find(a => a.task === value.task);
		known ? Object.assign(known, value) : this.agents.push(value);
	}

	// One browser turn: {at, role, text}. Written by Server/plugins/Ask.js.
	chat(value){ this.chats.push(value); }
}

export default JSONL;
