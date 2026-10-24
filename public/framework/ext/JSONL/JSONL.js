import { stream, drop } from "./live.js";
import { Store } from "../../core/Item/Store.js";

// History and reasons: doc/JSONL-notes.md
export class JSONL {
	static verbs = ["assign", "log", "action"];

	// Keys real logs carry that this reader has no use for, kept in .skipped but never warned about:
	// the stamps the log writer adds beside every verb.
	static quiet = ["by", "ts", "origin", "as", "moved_from"];

	logs = [];
	actions = [];
	skipped = [];
	unparsed = 0;

	constructor(...args){ this.assign(...args); }
	// See doc/JSONL-notes.md (field collision with methods).
	assign(...args){
		for (const arg of args) for (const [key, value] of Object.entries(arg ?? {}))
			typeof this[key] === "function" ? ((this.fields ??= {})[key] = value) : (this[key] = value);
		return this;
	}

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

	// ⚠ Dropped lines are silent; counted and warned once per file (see doc/JSONL-notes.md).
	parse(text){
		const bad = [];
		const entries = this.constructor.parse(text, bad);
		if (bad.length && !this.unparsed) console.warn(`JSONL: unparsed line in ${this.url} —`, bad[0]);
		this.unparsed += bad.length;
		return entries;
	}

	// ⚠ SPA fallback: check content-type to detect 404 (see doc/JSONL-notes.md).
	async load(){
		const res = await fetch(this.url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return this;
		this.loaded = true;
		return this.read(this.parse(await res.text()));
	}

	// Streams over dev socket; falls back to load() off localhost (see live.js).
	// A moved session record is followed first: core/Item/Store.js record_url().
	live(changed){ return Store.record_url(this.url).then(url => { this.url = url; return stream(this, changed); }); }

	// Stop streaming (reader done or file will not exist).
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
		this.warned = new Set();
		delete this.loaded;
		return this;
	}

	// See doc/JSONL-notes.md (flat() handles old verb-less log formats).
	static flat(entry){
		const text = entry.msg ?? entry.text ?? entry.title;
		return (entry.type || entry.at) && text ? { ...entry, msg: text } : null;
	}

	// See doc/JSONL-notes.md (apply() handles verb/stray/legacy line formats).
	apply(entry){
		const keys = Object.keys(entry ?? {});
		if (!keys.length) return this;
		const verbs = keys.filter(k => this.constructor.verbs.includes(k));
		const strayKeys = keys.filter(k => !verbs.includes(k));
		const stray = Object.fromEntries(strayKeys.map(k => [k, entry[k]]));

		if (!verbs.length){
			const flat = this.constructor.flat(entry);
			if (flat){ this.log(flat); return this; }
			if (entry.at){ this.assign(entry); return this; }
			strayKeys.forEach(k => this.skip(k, entry));
			return this;
		}

		if (verbs.length === 1 && strayKeys.length){
			const [verb] = verbs, value = entry[verb];
			const isDict = value && typeof value === "object" && !Array.isArray(value);
			this.dispatch(verb, isDict ? { ...stray, ...value } : { ...stray, msg: value });
			return this;
		}

		verbs.forEach(verb => this.dispatch(verb, entry[verb]));
		if (strayKeys.length){
			if (stray.at) this.assign(stray);
			else strayKeys.forEach(k => this.skip(k, entry));
		}
		return this;
	}

	// See doc/JSONL-notes.md (dispatch avoids field/method collisions via static lines).
	dispatch(verb, value){
		const line = this.constructor.lines?.[verb];
		line ? this.log(line(value)) : this[verb](value);
	}

	log(value){ this.logs.push(value); }
	action(value){ this.actions.push(value); }

	// One warning per verb per file (see doc/JSONL-notes.md).
	skip(verb, entry){
		this.skipped.push(entry);
		if (this.constructor.quiet.includes(verb)) return;
		this.warned ??= new Set();
		if (this.warned.has(verb)) return;
		this.warned.add(verb);
		console.warn(`JSONL: unknown verb "${verb}" in ${this.url} (further lines with this verb stay silent)`, entry);
	}
}

// History and reasons: doc/JSONL-notes.md (TaskJSONL schema and semantics).
export class TaskJSONL extends JSONL {
	// The verbs core/Task's replay reads from the same file (session.jsonl): not drawn here, so not warned about.
	static quiet = [...JSONL.quiet, "session", "sessions", "task", "tasks", "start", "stop", "pause", "resume", "finish", "wait", "approve", "commit", "tag", "group", "settings", "decide", "priority", "snooze", "kill", "follow_up"];

	static verbs = [...JSONL.verbs, "agent", "chat", "shot", "ask", "decision", "verdict", "rank", "note", "experiment", "review", "shots", "bands", "home"];

	// `shots` verb uses static lines to avoid field/array collision (see doc/JSONL-notes.md).
	static lines = {
		shots: value => ({ ...value, msg: value.msg ?? `shots: ${value.pages?.length ?? 0} pages at 4 widths → ${value.dir ?? ""}` }),
	};

	agents = [];
	chats = [];
	shots = [];
	asks = [];
	decisions = [];
	verdicts = [];
	ranks = {};
	folds = {};
	notes = [];

	agent(value){
		const known = this.agents.find(a => a.task === value.task);
		known ? Object.assign(known, value) : this.agents.push(value);
	}

	// See doc/JSONL-notes.md (ask merged by id, like agent by task).
	ask(value){
		const known = this.asks.find(a => a.id === value.id);
		known ? Object.assign(known, value) : this.asks.push(value);
	}

	// See doc/JSONL-notes.md (decision merged by id; handle legacy string format).
	decision(value){
		// Handle legacy string format (don't Object.assign onto string).
		if (!value || typeof value !== "object") value = { say: String(value) };
		const known = value.id != null && this.decisions.find(d => d.id === value.id);
		known ? Object.assign(known, value) : this.decisions.push(value);
		this.judged(value.id);
	}

	// ⚠ Verdict is separate line (never edits decision); judged() reconciles (see doc/JSONL-notes.md).
	verdict(value){
		const known = this.verdicts.find(v => v.id === value.id);
		known ? Object.assign(known, value) : this.verdicts.push(value);
		this.judged(value.decision);
	}

	// Called from both verdict and decision; handles out-of-order replay (see doc/JSONL-notes.md).
	judged(id){
		const decision = this.decisions.find(d => d.id === id);
		const verdict = this.verdicts.filter(v => v.decision === id).at(-1);
		// Map button word (approve/improve) to decision status.
		if (decision && verdict)
			Object.assign(decision, {
				status: verdict.say === "approve" ? "approved" : verdict.say,
				note: verdict.note ?? "",
			});
	}

	// ⚠ Rank replaces entire order (not merged); fold sets band collapse threshold (see doc/JSONL-notes.md).
	rank(value){
		this.ranks[value.list] = value.order ?? [];
		this.folds[value.list] = value.fold;
	}

	/** The order the file says for one list, or `[]` when nobody has ranked it. */
	order(list){ return this.ranks[list] ?? []; }

	/** How many of one list a band shows before the rest folds, or `undefined` for no fold. */
	fold(list){ return this.folds[list]; }

	// One browser turn {at, role, text} (from Server/plugins/Ask.js).
	chat(value){ this.chats.push(value); }

	// One screenshot {at, path, url, width, label} (see ext/JSONL/readme.md).
	shot(value){ this.shots.push(value); }

	// Message from orchestrator {id, at, msg, links}; merged by id (see doc/JSONL-notes.md).
	note(value){
		const known = value.id && this.notes.find(n => n.id === value.id);
		known ? Object.assign(known, value) : this.notes.push(value);
	}

	// One thing tried: {try, measure, result}; joins logs as "<try> → <measure> → <result>" (see doc/JSONL-notes.md).
	experiment(value){
		const msg = value.msg ?? [value.try ?? value.name, value.measure, value.result].filter(Boolean).join(" → ");
		this.logs.push({ ...value, msg });
	}

	// Review pass (two shapes): summary {found, real, fixed} or answer {answer: {n, reply}} (see doc/JSONL-notes.md).
	review(value){
		const a = value.answer;
		const msg = value.msg ?? (a ? `review: #${a.n} — ${a.reply}`
			: value.found != null ? `review: found ${value.found}, real ${value.real}, fixed ${value.fixed}`
			: JSON.stringify(value));
		this.logs.push({ ...value, msg });
	}

	// Audit round {round, read} from Server/review.mjs --bands; joins logs (see doc/JSONL-notes.md).
	bands(value){
		const msg = value.msg ?? `bands: round ${value.round ?? 1}, ${value.read?.length ?? 0} read`;
		this.logs.push({ ...value, msg });
	}

	// {"home":"<module task url>"}: this old folder's task now lives in a module home (Server/TaskMigrate.mjs).
	home(value){ this.logs.push({ msg: `this task's home is now ${value}`, home: value }); }

	reset(){
		this.agents = [];
		this.chats = [];
		this.shots = [];
		this.asks = [];
		this.decisions = [];
		this.verdicts = [];
		this.ranks = {};
		this.folds = {};
		this.notes = [];
		return super.reset();
	}
}

// ⚠ Unranked items numbered order.length + i (not Infinity) to avoid NaN sort (see doc/JSONL-notes.md).
export function ranked(items, order = [], id = item => item.id){
	const at = new Map(order.map((key, i) => [key, i]));

	return items
		.map((item, i) => ({ item, i, rank: at.has(id(item)) ? at.get(id(item)) : order.length + i }))
		.sort((a, b) => a.rank - b.rank || a.i - b.i)
		.map(row => row.item);
}

export default JSONL;
