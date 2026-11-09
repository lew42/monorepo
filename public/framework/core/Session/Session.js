// Session.js — a time-based record that lives in its own dated folder: <root>/YYYY/MM/DD/<slug>/, with a page.jsonl inside.
//
// The generic part of what AISession always did. A subclass names its root folder (override root_url) and declares its OWN
// `days`, `slugs` and `scanned` (statics inherit by reference, so a shared map would mix two kinds of session). Everything here
// reads `this`, never a class name. See core/Page/doc/architecture.md ("Session") and ai/sessions/doc/data/layout.md.

import Item from "../Item/Item.js";
import Day from "./Day.js";
import Task from "../Task/Task.js";
import "../Task/Project.js";   // registers "Project": a proposal can be made one (decide is "project")
import "../Task/Prompt.js";    // registers "Prompt": a dictation, its paragraphs, replies and the asks made from it
import "../Task/Question.js";  // registers "Question": open, answered, complete
import "../Task/Process.js";   // registers "Process": a task added with {type: "Process"} replays as one
import List from "../List/List.js";
import Chat from "./Chat/Chat.js";
import Sentence from "./Chat/Sentence.js";
import { Settings } from "../Settings/Settings.js";

/* A Session IS a Task (the owner, 2026-10-24, session-is-a-task): Task's states, completion, `tasks` list (strings, objects, typed
   children: Task, Process, Project, Session), queries and cost. What a session adds: its dated folder, its record's line shape (replay_line
   below), its menu and settings. Its own state lines are {"start"}/{"stop"} on the record, kept as they were. */
export default class Session extends Task {
	static days = new Map();     // id -> "2026/10/03"
	static slugs = new Map();    // id -> folder name; a session with no slug is in an old uuid-named folder
	static scanned = false;

	// super() with no args: Item assigns its args onto itself, and a string id would spread into characters.
	// An object is Item's own constructor args ({id, data}, what Item.hydrate passes for a {type:"Session"} member); before, it became
	// the id itself (the persistence matrix found it).
	constructor(id){ if (id && typeof id === "object") super(id); else { super(); if (id !== undefined) this.id = id; } }

	// Its tasks are Task's own list (made on first use); its progress is counted from them on read, never stored.

	/* THE CHAT (Chat/readme.md): `messages` is the conversation in order (a Chat of Prompt, Reply and Message), `sentences` the owner's
	   raw words that a Prompt holds by id. Both are made on first use and written as list deltas ({"messages":{"add":…}}). Not `chat`:
	   that key is V1's own line ({"chat":{at,from,text}}), which about twenty readers draw as a bubble. */
	get messages(){
		if (!this._messages){ this._messages = new Chat({ owner: this, name: "messages" }); this.watch(this._messages); }
		return this._messages;
	}
	set messages(_plain){ void this.messages; }   // Item.hydrate hands over a plain List; the typed one stays
	get sentences(){
		if (!this._sentences){ this._sentences = new List({ owner: this, name: "sentences" }); this._sentences.of = Sentence; this.watch(this._sentences); }
		return this._sentences;
	}
	set sentences(_plain){ void this.sentences; }
	lists(){
		const { _messages, _sentences, ...rest } = super.lists();
		return { ...rest, ...(_sentences?.length ? { sentences: _sentences } : {}), ...(_messages?.length ? { messages: _messages } : {}) };
	}

	/* THE SESSION MENU (the owner, 2026-10-22; doc/menu.md): a session DECLARES what its menu holds, as a template a subclass
	   extends (`static MENU = [...Session.MENU, {…}]`). An entry is a sub-page (`page: true`, routed at <session url>/<name>/)
	   or an action (`action: "<method name>"`, called on the page that draws the menu). Settings come first. */
	static MENU = [
		{ name: "settings", title: "Settings", icon: "settings", page: true },
		{ name: "log", title: "Open the log", icon: "description", action: "open_log" },
		{ name: "copy-link", title: "Copy link", icon: "link", action: "copy_link" },
	];
	// The settings a session has, drawn by SessionSettings as a form. Saved as {"settings":{<key>:<value>}} lines in session.jsonl.
	static SETTINGS = [
		{ key: "name", label: "Name", type: "text" },
		{ key: "model", label: "Model", type: "select", options: ["", "claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5"] },
		{ key: "effort", label: "Effort", type: "select", options: ["", "low", "medium", "high"] },
		{ key: "notify", label: "Tell me when it finishes", type: "checkbox" },
	];
	// The menu with each page's url filled in; `url` is the session page's own url.
	menu(url){ return this.constructor.MENU.map(e => e.page ? { ...e, url: url + e.name + "/" } : { ...e }); }
	/* The settings now: a core/Settings with the groups `dictate` and `recite` (named after the classes; VoiceChat's plugin
	 * overrides, split by each plugin's `static group`), plus the flat fields of SETTINGS (name, model, effort, notify) at the
	 * top level — read with `.get(key)`, not a bare property (SessionSettings.js). Never persisted here: replay only loads it. */
	get settings(){ return this._settings ??= new Settings({ fields: this.constructor.SETTINGS, groups: { dictate: {}, recite: {} } }); }
	/* Every {"settings":{…}} line merges shallow onto the raw object first (a later line replaces only the top-level key —
	 * a whole group, or one flat field — it names; everything else stays), then the WHOLE accumulated object is loaded into
	 * `settings` (core/Settings.load replaces everything it is given, so a partial `delta` alone would wipe the other group). */
	_merge_settings(obj){ this.settings.load(Object.assign(this._settings_raw ??= {}, obj)); }

	progress(){ return Task.progress_of(this._tasks); }   // no tasks is 0 of 0, not Task's 0 of 1
	/* The agent sessions that ran under this session's folder: dir -> [{id, role, state, session_id, cost, started_at}]. Node wires it
	 * from Servex's registry (Servex/agents/Agents.js), so a child is found by where its task lives, never by a link someone had to write. */
	static agents_resolver = null;
	// The agents whose task is exactly this folder, [{id, cost}] (Agents.agents_at): a Session entry's own cost, and the ids the registry fallback skips.
	static agents_at_resolver = null;

	// Item.replay does the loop; a session only needs its id from line 1 and its own line shape.
	static replay_new(lines){
		if (lines[0]?.assign) return new this(lines[0].assign.slug ?? lines[0].assign.task ?? "task")._as("task");   // a spawned agent's record: Task's id rule (the folder name stands in, Task.from_ref)
		const s = lines.find(l => l?.session)?.session;   // a VS Code tab's line 1 is {session:{id,kind,cwd,at}} (the SessionStart hook)
		const own = new this((s && typeof s === "object" ? s.id : s) ?? lines.find(l => l?.id)?.id);
		// A task folder (line 1 is the task's own {id, path, title}) that a spawn later wrote its {assign} into is a task log too.
		return own._as(!lines[0]?.session && lines.some(Task.spawned) ? "task" : "record");
	}
	_as(shape){ this._shape = shape; return this; }
	get is_session(){ return true; }
	/* TWO RECORD SHAPES, set by replay_new from the lines. A tab's or a voice call's record ({session:…} first) is read by apply_line
	   below. A spawned agent's record ({assign:…} first, open_task, or a task folder a spawn later wrote into) is a task log: it replays
	   through Task.replay_line whole, so the same lines give the same state, completion and fields they gave as a Task, and the Session
	   adds only its class (children, cost). A Session built some other way (new Session(id), then lines) reads as the record shape. */
	replay_line(line){
		line = Item.unmark(Item.dots(line));   // D13 marks read as the bare names below
		this._shape ??= line?.assign ? "task" : "record";
		if (this._shape === "task"){
			const when = line.at ?? line.ts ?? line.assign?.requested_at ?? null;
			if (when){ this._first_at ??= when; this._last_at = when; }
			if (line.settings && typeof line.settings === "object") this._merge_settings(line.settings);
			Task.clock = when;
			try { return super.replay_line(line); } finally { Task.clock = null; }
		}
		const { by, ts, at, session: _s, ...delta } = line;
		const when = at ?? ts ?? (typeof _s === "object" ? _s?.at : null) ?? null;
		if (when){ this._first_at ??= when; this._last_at = when; }
		if (_s && typeof _s === "object" && typeof _s.kind === "string" && this.data.kind === undefined) this.put("kind", _s.kind);   // "vscode-tab": the cost line says "this tab"
		Task.clock = when;   // nested tasks stamp this line's time, not the read's
		try { return this.apply_line(delta, by); } finally { Task.clock = null; }
	}
	// When the session's log began and last changed (from its lines), and the span between: never stored.
	get first_at(){ return this._first_at ?? null; }
	get last_at(){ return this._last_at ?? null; }
	// The record has no legacy fields to infer a state from (Task.replay_end would read it as running): its state is its own lines'.
	replay_end(){ if (this._shape === "task") return super.replay_end(); this._at = null; return this; }
	get span_ms(){ return this._first_at && this._last_at ? Date.parse(this._last_at) - Date.parse(this._first_at) : 0; }
	apply_line(delta, by){
		/* THE SESSION'S OWN STATE: {"stop":{why}} closes it (StaleClose writes one for an abandoned tab); {"start":{}} reopens it and
		 * clears the old why, so a session that came back is not still read as "abandoned" (2026-10-23). */
		if (delta.stop && typeof delta.stop === "object"){ this.put("state", "stopped"); this.put("why", delta.stop.why ?? null); this.put("stopped_at", delta.stop.at ?? Task.clock); delete delta.stop; }
		if (delta.start && typeof delta.start === "object"){ this.put("state", "running"); this.put("why", null); this.put("stopped_at", null); delete delta.start; }
		/* {"complete":{outcome, evidence}} closes the record as done, the way stop closes it as stopped (ProcessRunner.settle_sessions writes it into a step's own session). A bare number stays an old score field. */
		if (delta.complete && typeof delta.complete === "object" && !Array.isArray(delta.complete)){ const { outcome, evidence } = delta.complete; this.put("state", "complete"); this.put("why", null); this.put("completed_at", Task.clock); if (outcome !== undefined) this.put("outcome", outcome); if (evidence !== undefined) this.put("evidence", [].concat(evidence)); delete delta.complete; }
		// The owner's turn and its sentences/sections: {"refined":{at,re,sentences,sections,via}} (Session.refine_turn).
		if (delta.refined && typeof delta.refined === "object" && delta.refined.re){ this.refine_turn(delta.refined); delete delta.refined; }
		if (typeof delta.task === "string"){   // a reference line: the live child; one with the same id as a nested child replaces it (it moved home)
			const kid = Task.from_ref(delta.task, delta.as, delta), had = this._tasks?.find(kid.id);   // a Session entry's type and spawn ride on the same line
			kid._created_at ??= Task.clock;
			if (had) this.tasks.replace(had, kid); else this.tasks.insert(kid);
			delete delta.task; delete delta.as; delete delta.moved_from; delete delta.type; delete delta.spawn;
		}
		if (delta.tasks && typeof delta.tasks === "object"){
			const had = new Set([...(this._tasks ?? [])]);
			this.tasks.set(delta.tasks);
			for (const kid of this._tasks) if (!had.has(kid)) kid._created_at ??= Task.clock;   // the line's time, in memory only (never data: a move compares data): Task.created_at
		}
		delete delta.tasks;
		// The owner's prompts and page cards: the same `content` list a Task has, so a Prompt written with `counted: true` is part of the score (Task.score_parts).
		if (delta.content && typeof delta.content === "object"){ this.content.set(delta.content); delete delta.content; }
		// The chat: sentences first, so a Prompt added on the same line finds the sentence it names (one act, one line).
		if (delta.sentences && typeof delta.sentences === "object") this.sentences.set(delta.sentences);
		if (delta.messages && typeof delta.messages === "object") this.messages.set(delta.messages);
		delete delta.sentences; delete delta.messages;
		if (delta.settings && typeof delta.settings === "object"){ this._merge_settings(delta.settings); delete delta.settings; }   // merged, never replaced
		// The browser Store's own change line for a field on the session ({"set":{"title":…}}), read as Task.replay_line reads it.
		// Before, it was kept as one field named "set" (the persistence matrix found it).
		if (delta.set && typeof delta.set === "object" && !Array.isArray(delta.set)){ for (const [k, v] of Object.entries(delta.set)) this.take(k, v); delete delta.set; }
		// The owner's answer to a proposed task, from the session page: {"decide":{"task":id,"is":"approve"|"improve"|"reject","note"}}.
		// One known verb that names its task, so the browser's append passes the schema (a bare {"<id>":{…}} line would not).
		if (delta.decide && typeof delta.decide === "object"){
			const { task, is, note } = delta.decide, kid = this._tasks?.find(task);
			if (kid && ["approve", "improve", "reject"].includes(is) && kid.state === "waiting") kid[is]({ by: delta.decide.by ?? by ?? "owner", note });
			else if (kid && is === "project" && !(kid instanceof (Item.types.get("Project") ?? Task))){   // made a project: same id, data and place
				const p = Item.hydrate({ type: "Project", id: kid.id, ...kid.data, stage: "requirements" });
				if (kid._tasks) p.tasks = kid._tasks;
				this.tasks.replace(kid, p);
			}
			delete delta.decide;
		}
		for (const k of Object.keys(delta)){   // a nested task changed: {"<task id>":{…}} goes to that task
			const kid = delta[k] && typeof delta[k] === "object" ? (this._tasks ? this.find(k) : undefined) ?? this._content?.find(k) : undefined;   // at any depth: a bare id may name a grandchild; or a Prompt in `content` ({"<prompt id>":{"no_action":"why"}})
			if (kid?.replay_line) { kid.replay_line(delta[k]); delete delta[k]; }
		}
		// DEPRECATED (2026-10-28): use list deltas (`chat.add`, `place.add`, …); an unknown key falls through to `put` and loses its history. Guide: /framework/core/Session/doc/one-replay-plan.md. Remove when: the one-replay plan is built and the history is replayed through a named shim.
		for (const [k, v] of Object.entries(delta)) if (k !== "class") this.take(k, v);
		return this;
	}

	/* THE OWNER'S TURN AS TASKS (the owner, 2026-11-06). A `refined` line, {"refined":{at,re,sentences:[{n,text}],sections,via}}, names its turn by
	   `re` (the chat line's `at`; for a VS Code prompt, the `at` the hook gave its counted Prompt). The turn is ONE Prompt task, id Session.turn_id(re)
	   (the hook's content Prompt when it is there, else made here in `tasks`), open until something is filed under it; each section item is a child task
	   citing sentences (`a<n>`, the paragraph "a" below). A later refined line for the same turn replaces the sentences and adds the items it lacks. Code
	   writes the first line (Server/Ask.mjs, sentences only), the refiner the sections. A refined line WITHOUT `v: 2` (every line written before 2026-11-06) never makes a turn; it only fills one that already exists. */
	static turn_id(at){ let h = 5381; for (const c of String(at)) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return "t" + h.toString(36); }
	static turn_title(text){ const t = String(text).replace(/\s+/g, " ").trim(); return t.length > 70 ? t.slice(0, 69).trimEnd() + "…" : t; }
	refine_turn(r){
		if (!r.re) return this;
		const id = Session.turn_id(r.re), texts = (r.sentences ?? []).map(s => typeof s === "string" ? s : s?.text).filter(t => typeof t === "string" && t.trim());
		let turn = this._tasks?.find(id) ?? this._content?.find(id);
		if (!turn){
			if (r.v !== 2 || !texts.length) return this;   // only a line the new writer stamped (Server/Ask.mjs) makes a turn: older lines replay untasked
			const text = texts.join(" ");
			this.tasks.add({ type: "Prompt", id, text, via: r.via ?? "unknown", title: Session.turn_title(text), requested_at: r.re });
			turn = this._tasks.find(id);
		}
		if (texts.length) turn.paragraphs.replace({ id: "a", text: texts.join(" "), sentences: texts });
		for (const sec of r.sections ?? []) for (const it of sec.items ?? []){
			const kid = `${id}-${it.id}`;
			if (!it.id || !it.text || turn.tasks.find(kid)) continue;
			turn.tasks.add({ id: kid, title: it.text, cites: (it.cites ?? []).map(n => "a" + n).join(" "), ...(sec.heading ? { section: sec.heading } : {}) });
		}
		return this;
	}

	/* COVERAGE (one-refiner step 3): how many of the owner's sentences in this session's prompts some task cites. A prompt's sentences are its
	   stored paragraphs (or the shared splitter over its raw words); a sentence is cited by a `parts` entry (PromptRecords) or by the `cites`
	   of a task below the prompt (refine_turn writes "a1 a2"). Returns {sentences, cited, ratio, uncited: [{prompt, n, text}]}, or null when the
	   session has no prompt with words (unknown, never 0 or 1). Computed on read, never stored. */
	coverage(){
		const prompts = new Set(), Prompt = Item.types.get("Prompt");
		const walk = list => { for (const t of list ?? []){ if (t instanceof Prompt) prompts.add(t); walk(t._tasks); } };
		walk(this._tasks); for (const c of this._content ?? []) if (c instanceof Prompt && c.counts_toward_score) prompts.add(c);   // an old content Prompt (no `counted` flag) counts nowhere
		const uncited = []; let sentences = 0;
		const ids = new Set([...prompts].map(p => p.id)), filed = m => ids.has(m.prompt) || ids.has(Session.turn_id(m.at));   // the chat message's own Prompt task, already counted above
		for (const p of prompts){
			const own = p.sentences, all = own.length ? own : Prompt.split(p.get_one("text") ?? "").map((text, i) => ({ id: "a" + (i + 1), text }));   // a hook-made Prompt has only its text: the shared splitter
			if (!all.length) continue;
			const cited = new Set(), parts = ps => (ps ?? []).forEach(q => { (q.cites ?? []).forEach(n => cited.add(String(n))); parts(q.parts); });
			parts(p.parts);
			const below = list => { for (const t of list ?? []){ String(t.get_one?.("cites") ?? "").split(/\s+/).filter(Boolean).forEach(n => cited.add(n)); below(t._tasks); } };
			below(p._tasks);
			all.forEach((s, i) => { sentences++; if (!cited.has(s.id)) uncited.push({ prompt: p.id, n: i + 1, text: s.text }); });
		}
		// A chat Prompt (the owner's dictation, session.messages) whose turn was never refined into a Prompt task: all its sentences are uncited.
		for (const m of this._messages ?? []){
			if (!m.sentence_items || m.get_one("by") !== "owner" || !m.at || filed(m)) continue;
			m.sentence_items.forEach((x, i) => { sentences++; uncited.push({ prompt: m.id, n: i + 1, text: x.text }); });
		}
		return sentences ? { sentences, cited: sentences - uncited.length, ratio: (sentences - uncited.length) / sentences, uncited } : null;
	}
	static queries = [...Task.queries, "coverage"];
	summary(){ return { ...super.summary(), coverage: this.coverage() }; }

	// The folder every session of this kind lives under. Override in the subclass.
	static root_url(){ return new URL("../../ai/sessions/", import.meta.url); }

	static day(first_at){ return (first_at && Day.path(first_at)) || null; }   // the owner's local day (Day.js), "YYYY/MM/DD"

	// Sync: the dated folder when the day is known, else the old flat one.
	static dir_url(id, day = this.days.get(id)){ return new URL(day ? `./${day}/${this.slugs.get(id) ?? id}/` : `./${id}/`, this.root_url()); }

	// Node, async: the store's finder (core/Session/SessionFolders.mjs, the only one: which folder holds which session, read from disk).
	static async folders(){
		const [{ default: SessionFolders }, { fileURLToPath }] = await Promise.all([import("./SessionFolders.mjs"), import("node:url")]);
		return SessionFolders.at(fileURLToPath(this.root_url()));
	}
	// Node, async: fill `days` and `slugs` with every session's home, so dir_url() answers without a read. A filler only: locate() never trusts
	// it, because a map read before a folder moved would send a write to a folder that is gone (the 2026-10-09 twins).
	static async scan(){
		if (Object.hasOwn(this, "scanned") ? this.scanned : false) return;
		this.scanned = true;
		const store = await this.folders();
		for (const { id, dir } of store.homes()) this.remember(id, dir, store.root);
	}
	static remember(id, dir, root){
		const rel = dir.slice(root.length + 1).split(/[\\/]/), name = rel.pop();
		if (rel.length !== 3) return;
		this.days.set(id, rel.join("/"));
		if (name !== id) this.slugs.set(id, name); else this.slugs.delete(id);
	}

	// Node, async: MAKE the session's folder, the one creator (SessionFolders#create, which says what each option means): its home, made,
	// with `first` as line 1 when it has no record yet. Returns the folder's absolute path. Session.create({id, name, parent, first}).
	static async create({ id, ...opts } = {}){
		const store = await this.folders(), at = store.create(id, opts);
		this.remember(id, at, store.root);
		return at;
	}

	// Node, async: the folder to WRITE into. Where the session lives now (SessionFolders, checked on disk every call), else an old flat
	// uuid folder (moved into its day), else a new folder named `slug` (default session-<id8>) under the day of first_at, else today.
	static async locate(id, first_at, slug){
		const fs = await import("node:fs/promises"), root = this.root_url(), store = await this.folders();
		const found = store.of(id);
		if (found){ this.remember(id, found, store.root); return this.dir_url(id); }
		const flat = new URL(`./${id}/`, root), exists = u => fs.stat(u).then(() => true, () => false);
		let day = this.day(first_at);
		if (!day && await exists(flat)){      // an old flat folder: its own cache knows the day
			try { for (const l of (await fs.readFile(new URL("cache.jsonl", flat), "utf8")).split("\n")) if (l.startsWith('{"summary"')) day = this.day(JSON.parse(l).summary?.first_at) ?? day; } catch {}
			// No first_at: a session whose transcript has no message never gets one (a56900e3, 2026-10-25, stayed flat forever), so the folder's own date files it.
			if (!day) try { day = this.day((await fs.stat(flat)).birthtime); } catch {}
			if (!day) return flat;
		}
		day ??= this.day(new Date());
		if (await exists(flat)){ await fs.mkdir(new URL(`./${day}/`, root), { recursive: true }); await fs.rename(flat, new URL(`./${day}/${id}/`, root)); this.days.set(id, day); this.slugs.delete(id); return this.dir_url(id); }
		// Two ids can share their first 8 hex (hand-picked test ids did, 2026-09-19): home() gives the second one its full uuid.
		this.remember(id, store.home(id, day, slug), store.root);
		return this.dir_url(id);
	}
}

Item.register(Session, "Session");
