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
	/* A field never replaces a method: `{"assign":{"agent": "…"}}` once overwrote the `agent()`
	 * verb and every later `agent` line threw "this[verb] is not a function" (2026-09-28). Such a
	 * field is kept in `this.fields` instead. */
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
		this.warned = new Set();
		delete this.loaded;
		return this;
	}

	/**
	 * A line with no verb of its own — `{"at", "task", "msg"}` in a day log, or
	 * the `{"type": "launch", …}` / `{"type": "decision", …}` shape old task
	 * logs wrote before every line had a verb. Still a real record, not noise:
	 * it carries something to read (`msg`, `text` or `title`) alongside a
	 * `type` or `at` that marks it as a genuine line rather than a stray key.
	 * Returns a value shaped like a `log` line's own (`{..., msg}`), or `null`
	 * when there is nothing to show as one line — `apply()` then tries treating
	 * the whole thing as `assign` before it ever gives up and warns.
	 */
	static flat(entry){
		const text = entry.msg ?? entry.text ?? entry.title;
		return (entry.type || entry.at) && text ? { ...entry, msg: text } : null;
	}

	/* Every key splits into a known VERB (dispatches to its handler) or a STRAY
	   (anything else) — then three old, still-live shapes get a real line
	   instead of one `skip()` warning per stray key:

	     1. NO verb at all — `{"at", "task", "msg"}` in a day log, or the
	        `{"type": "launch", …}` old task logs wrote before every line had a
	        verb. `flat()` turns it into a `log` line when there's something to
	        read (`msg`/`text`/`title`); failing that, a real `at` makes it a
	        pre-wrapper `{"assign": {...}}` line — written the way `session.json`
	        always was, a bare object of fields (`now`, `step`, `steps`,
	        `worktree`, `branch`, …) — and it merges onto the instance exactly as
	        `assign` would (the module's own history: `assign` lines replaced
	        whole-object `session.json` writes verb-for-verb).

	     2. EXACTLY ONE verb, plus keys that belong INSIDE its value —
	        `{"log": "built…", "at": "…"}` instead of `{"log": {"at": "…", "msg":
	        "built…"}}` — fold straight into that verb's own value (the value's
	        own fields win a clash) rather than dispatch and then warn on the
	        rest.

	     3. Two or more real verbs on one line, still carrying stray progress
	        fields — `{"log": "…", "decision": {...}, "step": 5, "now": "…"}`,
	        live in several 2026-09-30 task logs — every verb still dispatches,
	        and a stray's `at` says "this is a real assign", not junk.

	   A stray with no `at` to vouch for it, on a line with no verb to fold into,
	   is the one case nothing here can make sense of — it still warns, same as
	   always. */
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

	/* A verb normally dispatches to `this[verb]()`, its own method of the same
	   name. One verb can't: `TaskJSONL`'s `shots` would call a method of that
	   name, but a FIELD of that name already exists on the instance (the plain
	   `shot` verb's own array, read by `shot_wall()`) — a field always wins
	   over a method, so `this.shots` IS the array, not a function, and calling
	   it throws. `static lines`, set only where that collision is real, renders
	   such a verb straight onto `logs` instead; every other verb dispatches
	   exactly as it always has. */
	dispatch(verb, value){
		const line = this.constructor.lines?.[verb];
		line ? this.log(line(value)) : this[verb](value);
	}

	log(value){ this.logs.push(value); }
	action(value){ this.actions.push(value); }

	/* One bad habit (a stray key, an old verb a subclass dropped) is one line in
	   the console per file, not one per line of the log — `this.warned` tracks
	   which verbs already spoke up for THIS instance. */
	skip(verb, entry){
		this.skipped.push(entry);
		this.warned ??= new Set();
		if (this.warned.has(verb)) return;
		this.warned.add(verb);
		console.warn(`JSONL: unknown verb "${verb}" in ${this.url} (further lines with this verb stay silent)`, entry);
	}
}

/**
 * The task manifest as a log — the fields session.json held, arriving as
 * `assign` lines. `agent` appends at dispatch and merges by `task` when the
 * same agent lands with its outcome; `ask` and `decision` do the same by `id`.
 *
 * `decision` and `verdict` are a pair: the worker writes down the choice it
 * made and the options it made it over, the owner presses Approve or Improve
 * on the Decisions tab, and the press is a `verdict` line in this same log.
 *
 * Progress is two assigned fields, never a verb: `steps` (the outline, declared
 * once) and `step` (the 1-based index underway). See `stats.js`'s `progress()`.
 */
export class TaskJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "agent", "chat", "shot", "ask", "decision", "verdict", "rank", "note", "experiment", "review", "shots", "bands"];

	/* `shots` (plural) is `Server/review.mjs`'s own line — a page-shot batch,
	   naming pages/dir — and it collides with the `shots` ARRAY field below
	   (the plain `shot` verb's list). `dispatch()` renders anything listed
	   here onto `logs` by calling the function instead of `this[verb]()`. */
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

	/**
	 * One thing the owner asked for, in their own words: `{id, at, summary,
	 * quote, prompt, status, tasks, links}`. `prompt` is the `uuid` of the
	 * message they typed it in, so the card can link back to the real sentence.
	 *
	 * Merged by `id`, exactly as `agent` merges by `task`: the ask is appended
	 * once when it is heard and again whenever its status moves, and an
	 * append-only file therefore never holds two disagreeing copies of it.
	 */
	ask(value){
		const known = this.asks.find(a => a.id === value.id);
		known ? Object.assign(known, value) : this.asks.push(value);
	}

	/**
	 * ONE CHOICE, WITH THE ALTERNATIVES IT WAS CHOSEN OVER — a claim tree:
	 * `{id, at, about, options: [{id, say, why}], chose, because, rule, status,
	 * note}`. `about` is the question in one line, `options` are the candidates
	 * that were really considered, `chose` names the winner by its option id,
	 * `because` is one sentence, and `rule` is the skill section that produced
	 * it (`layout#spacing`), so an Improve is traceable back to the rule.
	 *
	 * Merged by `id`, the way `agent` merges by `task` — a decision is appended
	 * when it is made and again whenever it is revised.
	 */
	decision(value){
		// A hand-written `{"decision": "some text"}` line is a string, not an object: without an
		// id it "matched" the previous one and `Object.assign` onto a string threw, killing every
		// AI 2 card page (page-audit, 2026-09-30). Keep it as text; merge only real ids.
		if (!value || typeof value !== "object") value = { say: String(value) };
		const known = value.id != null && this.decisions.find(d => d.id === value.id);
		known ? Object.assign(known, value) : this.decisions.push(value);
		this.judged(value.id);
	}

	/**
	 * THE OWNER'S ANSWER TO ONE DECISION: `{id, at, decision, say:
	 * "approve"|"improve", note, filed}`. Written by a press on the Decisions
	 * tab (through the dev socket's `rpc:append`) and merged by `id`, so the CLI
	 * can come back later and stamp `filed` onto the same row.
	 *
	 * ⚠ The verdict is its OWN line, never an edit of the decision: the log is
	 *   the record of what was thought over time. `judged()` is what makes the
	 *   decision object agree with it, so every reader has one place to look.
	 */
	verdict(value){
		const known = this.verdicts.find(v => v.id === value.id);
		known ? Object.assign(known, value) : this.verdicts.push(value);
		this.judged(value.decision);
	}

	/* The newest verdict on one decision, assigned onto that decision's `status`
	   and `note`. Called from BOTH verbs, because a replayed file can carry them
	   in either order — a verdict read before its decision line would otherwise
	   land nowhere and the row would show as still open. */
	judged(id){
		const decision = this.decisions.find(d => d.id === id);
		const verdict = this.verdicts.filter(v => v.decision === id).at(-1);
		// `say` is the BUTTON's word (approve / improve); `status` is the
		// decision's state (open / approved / improve). One letter apart, and
		// the tab counted zero approvals until they were reconciled here.
		if (decision && verdict)
			Object.assign(decision, {
				status: verdict.say === "approve" ? "approved" : verdict.say,
				note: verdict.note ?? "",
			});
	}

	/**
	 * THE OWNER'S ORDER FOR ONE LIST: `{list, at, order: ["<id>", …]}`.
	 *
	 * `list` names which list of this task's own log is being ordered — `asks`,
	 * `decisions` or `tasks` — and `order` is every id in that list, best first.
	 * Written by the owner's drag on the Asks or Decisions tab, through the dev
	 * socket's `rpc:append`, into this same file.
	 *
	 * ⚠ THE LAST LINE WINS OUTRIGHT — the whole order is replaced, never merged.
	 *   `ask` and `decision` merge by id because each line describes ONE thing
	 *   that keeps changing; a rank line describes the WHOLE list at one moment,
	 *   and half of an order is not an order. The history is still every line in
	 *   the file, the way `verdict` keeps every press.
	 *
	 * A rank line may also carry `fold`: how many items of the list a reader sees
	 * before the rest tucks under an "N more" they open — the `asks` list's bands
	 * use it to keep a topic to one screen. `list: "topics"` is the same verb,
	 * ordering the BANDS themselves rather than the cards inside one; see
	 * `ext/AITask/doc/ranking.md`.
	 */
	rank(value){
		this.ranks[value.list] = value.order ?? [];
		this.folds[value.list] = value.fold;
	}

	/** The order the file says for one list, or `[]` when nobody has ranked it. */
	order(list){ return this.ranks[list] ?? []; }

	/** How many of one list a band shows before the rest folds, or `undefined` for no fold. */
	fold(list){ return this.folds[list]; }

	// One browser turn: {at, role, text}. Written by Server/plugins/Ask.js.
	chat(value){ this.chats.push(value); }

	// One screenshot taken outside the repo: {at, path, url, width, label}. See ext/JSONL/readme.md.
	shot(value){ this.shots.push(value); }

	/**
	 * A message FROM the orchestrator TO whoever reads this task's board:
	 * `{id, at, msg, links: [{url, label}]}`. Merged by `id`, the way `ask` and
	 * `agent` are — a note can be corrected by a later line carrying the same id
	 * rather than living on as two disagreeing copies.
	 */
	note(value){
		const known = value.id && this.notes.find(n => n.id === value.id);
		known ? Object.assign(known, value) : this.notes.push(value);
	}

	/**
	 * ONE THING TRIED, in three parts: `{"experiment": {"try", "measure", "result"}}`
	 * — what was done, how it was checked, what came of it (some write `name`
	 * instead of `try`; both read). No array of its own: it joins `logs`, the
	 * same plain line every other reader of this file already draws, as
	 * `"<try> → <measure> → <result>"` with any missing part left out.
	 */
	experiment(value){
		const msg = value.msg ?? [value.try ?? value.name, value.measure, value.result].filter(Boolean).join(" → ");
		this.logs.push({ ...value, msg });
	}

	/**
	 * A REVIEW PASS, in one of two shapes the skills already write: the
	 * SUMMARY, once per pass — `{"review": {"found", "real", "fixed"}}` — or
	 * one ANSWER to a single finding — `{"review": {"answer": {"n", "reply"}}}`.
	 * Like `experiment`, it joins `logs` rather than growing its own array:
	 * `"review: found N, real M, fixed K"` for the summary, `"review: #N — <reply>"`
	 * for one answer.
	 */
	review(value){
		const a = value.answer;
		const msg = value.msg ?? (a ? `review: #${a.n} — ${a.reply}`
			: value.found != null ? `review: found ${value.found}, real ${value.real}, fixed ${value.fixed}`
			: JSON.stringify(value));
		this.logs.push({ ...value, msg });
	}

	/**
	 * ONE AUDIT ROUND'S READING, written by `Server/review.mjs --bands`:
	 * `{"bands": {"round", "read": [...]}}` — `round` is the pass number (the
	 * first line omits it, meaning round 1), `read` is what that pass actually
	 * checked. Joins `logs`, same family as `experiment`/`review`/`shots`:
	 * `"bands: round N, M read"`.
	 */
	bands(value){
		const msg = value.msg ?? `bands: round ${value.round ?? 1}, ${value.read?.length ?? 0} read`;
		this.logs.push({ ...value, msg });
	}

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

/**
 * Put a list in the order a `rank` line asked for.
 *
 * Anything the order does not name keeps its place BEHIND everything it does —
 * a new ask written after the last drag appears at the end of its band rather
 * than jumping to the top, and two unranked items stay in the order the log
 * wrote them. `id` says how to read an item's id; the default reads `.id`,
 * which is what `ask`, `decision` and `agent` all carry.
 *
 * ⚠ Unranked items are numbered `order.length + i`, never `Infinity`:
 *   `Infinity - Infinity` is `NaN`, and a comparator that answers NaN leaves
 *   the array in whatever order the engine's sort happened to reach.
 */
export function ranked(items, order = [], id = item => item.id){
	const at = new Map(order.map((key, i) => [key, i]));

	return items
		.map((item, i) => ({ item, i, rank: at.has(id(item)) ? at.get(id(item)) : order.length + i }))
		.sort((a, b) => a.rank - b.rank || a.i - b.i)
		.map(row => row.item);
}

export default JSONL;
