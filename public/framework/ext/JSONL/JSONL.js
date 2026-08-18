import { stream, drop } from "./live.js";

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
 *
 * `load()` fetches it once; `live()` streams it from the dev server instead.
 */
export class JSONL {
	static verbs = ["assign", "log", "action"];

	logs = [];
	actions = [];
	skipped = [];
	unparsed = 0;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/** Text in, entries out. Anything that isn't JSON lands in `bad`, never in the log. */
	static parse(text, bad = []){
		const entries = [];
		for (const line of text.split("\n")){
			if (!line.trim()) continue;
			try { entries.push(JSON.parse(line)); }
			catch { bad.push(line); }
		}
		return entries;
	}

	/* ⚠ A dropped line is silent otherwise: one illegal escape in a landing line
	   read as "still running" for a day. Counted here, warned once per file. */
	parse(text){
		const bad = [];
		const entries = this.constructor.parse(text, bad);
		if (bad.length && !this.unparsed) console.warn(`JSONL: unparsed line in ${this.url} —`, bad[0]);
		this.unparsed += bad.length;
		return entries;
	}

	// ⚠ The SPA fallback answers a miss with index.html — content-type is the 404.
	async load(){
		const res = await fetch(this.url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return this;
		this.loaded = true;
		return this.read(this.parse(await res.text()));
	}

	/**
	 * Stream the file over the dev socket instead of fetching it — explicit
	 * opt-in, resolving exactly as `load()` does, then calling `changed(this)`
	 * once per appended batch. Off localhost there is no socket and this IS
	 * `load()`, so nothing on the site depends on the server. See live.js.
	 */
	live(changed){ return stream(this, changed); }

	/** Stop streaming — this reader is done, or the file is never going to exist. */
	unsubscribe(){ drop(this); return this; }

	read(entries){
		entries.forEach(entry => this.apply(entry));
		return this;
	}

	/** Forget everything replayed — the file was rewritten, not appended to. */
	reset(){
		this.logs = [];
		this.actions = [];
		this.skipped = [];
		this.unparsed = 0;
		delete this.loaded;
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
	static verbs = [...JSONL.verbs, "agent", "chat", "shot"];

	agents = [];
	chats = [];
	shots = [];

	agent(value){
		const known = this.agents.find(a => a.task === value.task);
		known ? Object.assign(known, value) : this.agents.push(value);
	}

	// One browser turn: {at, role, text}. Written by Server/plugins/Ask.js.
	chat(value){ this.chats.push(value); }

	// One screenshot taken outside the repo: {at, path, url, width, label}. See ext/JSONL/readme.md.
	shot(value){ this.shots.push(value); }

	reset(){
		this.agents = [];
		this.chats = [];
		this.shots = [];
		return super.reset();
	}
}

export default JSONL;
