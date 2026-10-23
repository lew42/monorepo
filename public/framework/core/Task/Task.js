// A DOM-free unit of work: id, title, a STATE, timestamps, a computed duration,
// and a List of subtasks. Runs in node (no `core/View` import) the same way
// `core/Item/Item.js` does — `AITask extends Task` (a later pass) adds the brief,
// agents, cost and review on top.
import Item from "../Item/Item.js";
import List from "../List/List.js";

const CONFIDENCE = ["high", "medium", "low"];
const STATES = ["idle", "running", "paused", "waiting", "stopped", "complete"];
const OPEN = new Set(["idle", "running", "paused", "waiting"]);   // a child in one of these keeps its parent from reading complete

// Which states each verb may start FROM — named by the verb, so the rule next to
// the verb is the rule that uses it.
const CAN = {
	start: new Set(["idle", "stopped"]),
	pause: new Set(["running"]),
	resume: new Set(["paused"]),
	stop: new Set(["idle", "running", "paused", "waiting"]),
	complete: new Set(["idle", "running", "paused", "waiting", "stopped"]),
	wait: new Set(["idle", "running", "paused"]),
	approve: new Set(["waiting"]),
	improve: new Set(["waiting"]),
	reject: new Set(["waiting"]),
};

// The state verbs a `task.jsonl` line may name: `{"stop":{"why":"…"}}`.
// Plain fields a top-level line may set (the item tool's {"expected":"…"}); legacy lines keep them under `assign`.
// `sessions` [{id, task}] and `home` (an old folder's pointer to its module home): Server/TaskMigrate.mjs writes them.
const FIELDS = ["title", "expected", "module", "mode", "now", "description", "waiting_on", "checked_by", "source", "tags", "priority", "path", "parent", "sessions", "home", "template", "agent", "outcome", "brief", "from"];

// Keys replay_line reads itself; any other object-valued key may name a nested subtask.
const LINE_KEYS = new Set(["assign", "tasks", "content", "priority", "verdict", "set", "file", "task", "start", "pause", "resume", "stop", "complete", "finish", "wait", "approve", "improve", "reject", "now", "tags", "reinforce"]);
const VERBS = ["start", "pause", "resume", "stop", "complete", "finish", "wait", "approve", "improve", "reject"];

export class Task extends Item {

	constructor(...args){
		super(...args);
		// Running-time bookkeeping: `_ran_ms` is time already banked (from past
		// running spans, replayed from `data.ran_ms`); `_ran_since` is a plain
		// Date.now() marking a CURRENTLY open span, kept in memory only — it is not
		// itself a saved fact, just "is the clock running right now", reset to null
		// on load. A reload mid-run loses only the open span's few seconds, never
		// the banked total; fixing that fully means persisting `_ran_since` too,
		// left for later (Law 1: fastest working version first).
		this._ran_ms = this.data.ran_ms ?? 0;
		this._ran_since = null;
	}

	// Made on first use (a replayed log rarely has subtasks). `_tasks` is hidden from
	// `lists()` below so the saved key is still "tasks", which `hydrate()` assigns back.
	get tasks(){
		if (!this._tasks){ this._tasks = new List({ owner: this, name: "tasks" }); this.watch(this._tasks); }
		return this._tasks;
	}
	set tasks(list){ this._tasks = list; this.watch(list); }
	// Item.get() skips a prototype getter, so a fresh Task answered undefined for "tasks" and {tasks:{add}} was stored as data (2026-10-22; child-verb.test.mjs).
	get(key){ return key === "tasks" ? this.tasks : super.get(key); }

	// Like `tasks`, made on first use: notes, decisions and log lines, the same `{"content":{"add":{...}}}` grammar as Page.content.
	get content(){ return this._content ??= new List({ owner: this, name: "content" }); }
	set content(list){ this._content = list; }
	lists(){
		const { _tasks, _content, ...rest } = super.lists();
		return { ...rest, ...(_tasks ? { tasks: _tasks } : {}), ...(_content?.length ? { content: _content } : {}) };
	}

	get mode(){ return this.get_one("mode") === "series" ? "series" : "parallel"; }

	// Node drives every step: each child's state change reaches the parent here, no polling.
	watch(list){
		list.on("add", ({ add } = {}) => { const kid = list.find(add?.id); if (kid) this.adopt_child(kid); });
		for (const kid of list) this.adopt_child(kid);
	}
	adopt_child(kid){
		if (!kid || kid._watched_by === this || typeof kid.on !== "function") return;
		kid._watched_by = this;
		kid.on("change", function(key){ if (key === "state" && this === kid) kid._watched_by?.child_changed(kid); });
	}
	child_changed(kid){
		if (kid.state !== "complete" || this.state !== "running") return;
		if (this.mode === "series") this.start_children();
		if ([...this._tasks].every(t => t.state === "complete")) this.complete({ auto: true });
	}
	start_children(){
		const kids = [...(this._tasks ?? [])];
		if (this.mode === "series"){ const next = kids.find(t => t.state !== "complete"); if (next?.state === "idle") next.start(); }
		else for (const t of kids) if (t.state === "idle") t.start();
	}

	// Resolves with the task once it is complete or stopped (at once if it already is).
	settled(){
		const done = () => this.state === "complete" || this.state === "stopped";
		if (done()) return Promise.resolve(this);
		return new Promise(resolve => {
			const on = (key) => { if (key === "state" && done()){ this.off("change", on); resolve(this); } };
			this.on("change", on);
		});
	}

	// The task's own clock: a replay pins it to each line's time, so replaying the
	// same file twice gives the same task and never reads the wall clock.
	stamp(){ return this._at ?? new Date().toISOString(); }
	ms(){ return this._at ? Date.parse(this._at) : Date.now(); }

	// The view is wired in by TaskView.js (browser only), like Item.view; a subclass overrides render() to draw itself.
	render(){
		if (!this.constructor.View){ Item.warned.has("task-render") || (Item.warned.add("task-render"), console.warn("Task — render(): no View wired in (no DOM here)")); return undefined; }
		return new this.constructor.View({ task: this });
	}

	// `get_one`, not `get` (2026-10-03): `get("state")`'s own first step checks
	// `this["state"]` for a real instance property — which THIS GETTER IS,
	// so calling it from inside itself recurses forever. `get_one` is the
	// plain data seam underneath, exactly what a bare field lookup needs.
	// A complete task that has been given a new open child reads `running` again until that child is done (a request added to a
	// landed task: review finding 2, 2026-10-22). Computed on read, never written, so it reads complete again by itself.
	get state(){
		const s = this.get_one("state") ?? "idle", st = s === "finished" ? "complete" : s;
		return st === "complete" && this.reopened() ? "running" : st;
	}
	reopened(){ for (const t of this._tasks ?? []) if (OPEN.has(t.state)) return true; return false; }

	// Warn like `Item`'s own `locate()`/`hydrate()` do: once per distinct message,
	// never a throw, and the call site still gets `this` back so a no-op chains.
	warn(message){
		this.constructor.warned ??= new Set();
		if (!this.constructor.warned.has(message)){
			this.constructor.warned.add(message);
			console.warn(`Task — ${message}`);
		}
		return this;
	}

	// Running time SO FAR, counting the open span if one is open. Pausing (or
	// stopping, or finishing) stops the clock, so paused time is never duration.
	duration(){
		return this._ran_ms + (this._ran_since != null ? this.ms() - this._ran_since : 0);
	}

	// `{done, total}` from the subtasks' own states — never a stored number
	// (CLAUDE.md law 7: compute, don't recall). No subtasks yet is reported as
	// 0/1 (or 1/1 once complete), so a progress bar still means something before
	// the first subtask exists.
	progress(){
		const p = Task.progress_of(this._tasks);
		return p.total ? p : { done: this.state === "complete" ? 1 : 0, total: 1 };
	}

	// `{done, total}` over any List of tasks: the one counting code (Session calls it too).
	static progress_of(list){
		const tasks = [...(list ?? [])];
		return { done: tasks.filter(t => t.state === "complete").length, total: tasks.length };
	}

	// Fields: plain data, read where they are written (readme: Fields).
	// string | string[]; the yes/no check of each string at complete() is a later step (plan.md, Amendments 2 item 3).
	get expected(){ return this.get_one("expected"); }
	// [module, ...own tags, ...the parent's tags]: no duplicates, no empties.
	get tags(){
		const own = this.get_one("tags");
		const all = [this.module, ...(Array.isArray(own) ? own : [own]), ...(this.parent?.tags ?? [])];
		return [...new Set(all.filter(t => typeof t === "string" && t.trim()))];
	}
	get module(){ return this.get_one("module"); }
	// Every session that created or worked on the task, [{id, task}]: node appends it (page_tools.js), an agent never types it.
	get sessions(){ const s = this.get_one("sessions"); return Array.isArray(s) ? [...s] : []; }
	// Who asked: voice-app | vscode | dictate | servex:<agent id>. Old lines kept a doc path here: that is `doc`, and `source` is then undefined.
	get source(){ const s = this.get_one("source"); return typeof s === "string" && !s.startsWith("/") ? s : undefined; }
	get doc(){ const s = this.get_one("source"); return typeof s === "string" && s.startsWith("/") ? s : undefined; }
	// USD, computed and never stored: the turn_cost of the agents whose task this is. Node wires `Task.cost_resolver` (Servex/agents/Agents.js).
	static cost_resolver = null;
	get cost(){ return this.constructor.cost_resolver?.(this.get_one("path")) ?? 0; }
	get session(){ return this.get_one("session") ?? this.get_one("session_id"); }
	get priority(){ return this.get_one("priority") ?? null; }
	get commits(){ return [...(this.data.commits ?? [])]; }
	commit(hash){
		const h = String(hash ?? "").trim();
		if (!h || (this.data.commits ?? []).includes(h)) return this;
		this.put("commits", [...(this.data.commits ?? []), h]);
		return this;
	}

	// The same thing asked or proposed again adds weight instead of a duplicate (an improvement, readme-system.md). Weight = 1 + reinforcements.
	get weight(){ return 1 + (this.data.reinforced ?? []).length; }
	reinforce({ why, by } = {}){
		this.put("reinforced", [...(this.data.reinforced ?? []), { ...(why ? { why } : {}), ...(by ? { by } : {}) }]);
		return this;
	}

	// The owner checking the task off is final.
	check({ by } = {}){
		this.put("checked_by", by ?? "owner");
		return this;
	}

	// 0..1. Order: owner check, subtasks (the one computed form), old `steps`, agent's value.
	get completion(){
		if (this.data.checked_by) return 1;
		const { done, total } = Task.progress_of(this._tasks);
		if (total) return done / total;
		const steps = this.data.steps;
		if (Array.isArray(steps) && steps.length){
			const step = Math.max(1, Math.min(Number(this.data.step) || 1, steps.length));
			return (this.state === "complete" ? steps.length : step - 1) / steps.length;
		}
		const c = this.data.completion ?? this.data.complete;
		if (typeof c === "number") return Math.max(0, Math.min(1, c));
		return this.state === "complete" ? 1 : 0;
	}

	// May this verb run from the task's state now? The same CAN map the verbs check; a button uses it to show only what works.
	can(verb){ return Task.can(this.state, verb); }
	// The same check from a state alone, for a row that has the state but not the loaded task (ai/sessions/v/mobile/MobileRun.js).
	static can(state, verb){ return !!CAN[verb]?.has(state); }

	start(){
		if (!CAN.start.has(this.state)) return this.warn(`start(): can't start from "${this.state}"`);
		this._ran_since = this.ms();
		this.set({ state: "running", started_at: this.data.started_at ?? this.stamp() });
		this.start_children();
		return this;
	}

	pause(){
		if (!CAN.pause.has(this.state)) return this.warn(`pause(): can't pause from "${this.state}"`);
		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		this.set({ state: "paused", ran_ms });
		return this;
	}

	resume(){
		if (!CAN.resume.has(this.state)) return this.warn(`resume(): can't resume from "${this.state}"`);
		this._ran_since = this.ms();
		this.set({ state: "running" });
		return this;
	}

	stop(why){
		if (!CAN.stop.has(this.state)) return this.warn(`stop(): can't stop from "${this.state}"`);
		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		this.set({ state: "stopped", stopped_at: this.stamp(), ran_ms, why: why ?? null });
		return this;
	}

	// Waiting on someone (`on`: "owner" or an agent id) for `what`. Banks running time like pause().
	wait({ on, what } = {}){
		if (!CAN.wait.has(this.state)) return this.warn(`wait(): can't wait from "${this.state}"`);
		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		this.set({ state: "waiting", waiting_on: on ?? null, waiting_what: what ?? null, waiting_since: this.stamp(), ran_ms });
		return this;
	}

	// The three verdicts on a proposal that is waiting. Each takes a note string or {by, note}, writes verdict: {is, note, by}, and moves the state.
	verdict(is, arg, state, extra){
		if (!CAN[is].has(this.state)) return this.warn(`${is}(): can't ${is} from "${this.state}"`);
		const { by, note } = typeof arg === "object" && arg ? arg : { note: arg };
		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = state === "running" ? this.ms() : null;
		this.put("verdict", { is, note: note ?? null, by: by ?? null });
		this.set({ waiting_on: null, ...extra, ran_ms, state });
		return this;
	}
	// approve: the task is ACCEPTED (waiting -> idle: worth doing, queued, nobody on it yet). The agent's own start() begins it
	// (core/Task/doc/resolution.md, section 5). Approval with a caveat is approve(note).
	approve(arg){
		const o = typeof arg === "object" && arg ? arg : { note: arg };
		return this.verdict("approve", arg, "idle", { approved_by: o.by ?? null, approved_note: o.note ?? null });
	}
	// improve: back to whoever proposed it, to revise and wait() again.
	improve(arg){ return this.verdict("improve", arg, "running"); }
	// reject: stopped, the note is the reason.
	reject(arg){
		const note = typeof arg === "object" && arg ? arg.note : arg;
		return this.verdict("reject", arg, "stopped", { stopped_at: this.stamp(), why: note ?? null });
	}

	// HONEST COMPLETION (core/Task/doc/resolution.md, section 6). A live complete() takes {outcome, evidence, confidence, caveats}:
	// `evidence` a non-empty list (a file, commit, shot or test), `confidence` "high" | "medium" | "low" (default "medium"), `caveats` a list
	// of what was asked and not done (default []). With no evidence it refuses and says what to pass. Exempt: replay (a recorded finish is a
	// fact; old logs have none) and the automatic completion when the last child completes (`auto`, no agent made a claim).
	// Returns the refusal text, or null when the arguments are fine. Servex's item tool calls it before it writes a line.
	static completion_problem(args){
		const a = args && typeof args === "object" ? args : {};
		const ev = [].concat(a.evidence ?? []).filter(e => String(e ?? "").trim());
		if (!ev.length) return `complete() needs evidence: pass {outcome: "what is now true", evidence: ["a file, commit, shot or test"], confidence: "high" | "medium" | "low", caveats: ["what was asked and not done"]}`;
		if (a.confidence !== undefined && !CONFIDENCE.includes(a.confidence)) return `complete(): confidence must be one of ${CONFIDENCE.join(", ")}, not "${a.confidence}"`;
		return null;
	}

	// Refuses while any subtask is not complete: names the first open one, the
	// same "tell them what to do next" shape as Item.locate()'s own warnings.
	complete(args){
		if (this.state === "complete") return this;
		const { completion, complete, outcome, evidence, confidence, caveats, auto } = args && typeof args === "object" ? args : {};

		// A recorded finish is a fact during replay (this._rp): a {task: ref} child the worker only filed is not a reason to refuse it. Server/doc/state.md
		const open = this._rp ? null : [...(this._tasks ?? [])].find(t => t.state !== "complete");
		if (open) return this.warn(`complete(): "${open.get("title") ?? open.id}" isn't complete yet — complete that first`);

		if (!CAN.complete.has(this.state)) return this.warn(`complete(): can't complete from "${this.state}"`);

		if (!this._rp && !auto){
			const no = Task.completion_problem(args);
			if (no) return this.warn(no);
		}

		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		const c = completion ?? complete;
		const claim = evidence === undefined ? {} : { evidence: [].concat(evidence), confidence: confidence ?? "medium", caveats: [].concat(caveats ?? []) };
		this.set({ completed_at: this.stamp(), ran_ms, ...(c !== undefined ? { completion: c } : {}), ...(outcome !== undefined ? { outcome } : {}), ...claim, state: "complete" });
		return this;
	}

	// Old name, kept for old callers and old logs; nothing new writes it.
	finish(args){ return this.complete(args); }

	// ---- Replay: Item.replay / Item.Store.read drive these; only the legacy mapping lives here ----
	static replay_new(lines){
		const first = lines.find(l => l?.assign)?.assign ?? {};
		// A home-made child (plan step 14a) has no `assign`: line 1 holds its own `id`.
		const own = first.slug ?? first.task ?? (typeof lines[0]?.id === "string" ? lines[0].id : null);
		return new this({ id: own ?? "task" });
	}

	// ---- References: a parent's `{"task": "<app path>"}` line is a live child replayed from its own file ----
	// ONE from_ref. Node sets `Task.resolver = path => parsed lines | null` (Servex/agents/page_tools.js link_refs): sync, read from disk.
	// With no resolver, the browser gets a stub titled by its path's last segment ("loading"); `open_ref` then replays the child's own
	// task.jsonl into that stub through the Store (the way TaskPage does) and tails it live. "missing" only after a 404.
	static resolver = null;
	static resolving = new Set();
	static from_ref(ref, as){
		const lines = !this.resolving.has(ref) && this.resolver ? this.resolver(ref) : null;
		const id = as ?? this.ref_id(ref);   // `as`: the id the task had in the parent (a moved item keeps it, whatever its new folder is called)
		let kid;
		if (lines?.length){
			this.resolving.add(ref);   // a cycle of references stops here
			const Own = Item.types.get(lines[0]?.class);   // line 1 may name a subclass (a Process): replay it as that, when it is loaded
			try { kid = (Own && Own.prototype instanceof this ? Own : this).replay(lines); } finally { this.resolving.delete(ref); }
			if (kid.id === "tasks" || as) kid.id = id;   // a module list's line 1 says "tasks": a property name, and the same for every module
		} else {   // no file (node), or not read yet (browser): a stub, never a throw
			kid = new this({ id });
			kid.put("title", id);
			const browser = !this.resolver && typeof document !== "undefined" && !this.resolving.has(ref);
			kid.put("state", browser ? "loading" : "missing");
			if (browser) kid.ready = this.open_ref(kid, ref);   // a promise: resolves once the file is read (or 404s)
		}
		if (kid.data.path === undefined) kid.put("path", ref);
		kid._own_file = ref;   // a referenced child lives in its own file: the parent Store never records its changes (Store.js owned_below)
		return kid;
	}

	// A reference's id is its folder name; a module's list (/framework/core/Task/tasks/) is "core-Task-tasks", so lists side by side (/tasks/) never collide.
	static ref_id(ref){
		const segs = String(ref).split("/").filter(Boolean);
		return segs.at(-1) === "tasks" && segs.length > 1 ? segs.slice(segs[0] === "framework" ? 1 : 0).join("-") : segs.at(-1) ?? "";
	}

	// Browser only: open the child's file through the shared Store, then attach (replay + live tail) onto the stub.
	static async open_ref(kid, ref){
		const dir = String(ref).replace(/\/?$/, "/");
		let store = this.Store.for(dir + "task.jsonl");
		try { await store.open(); } catch { /* treated as missing below */ }
		if (!store.host && !store.count){   // a session folder's log is session.jsonl (a task moved into a child session, item-move)
			const s = this.Store.for(dir + "session.jsonl");
			try { await s.open(); if (s.host || s.count) store = s; } catch { /* still missing */ }
		}
		if (store.host){   // another reader (TaskPage) is already attached and live: this stub takes a snapshot of the same file
			const res = await fetch(store.url).catch(() => null);
			const entries = res?.ok ? store.parse(await res.text()) : [];
			if (!entries.length) kid.set({ state: "missing" });
			else { kid.put("state", "idle"); for (const e of entries) kid.replay_line(e); }
			return;
		}
		if (!store.count){ kid.set({ state: "missing" }); return; }
		kid.put("state", "idle");   // the file's own verb lines take it from here
		store.attach(kid);
	}

	// The tasks sorted by recency x weight, biggest first. Weight = priority.score (1 if missing) x (1 + children);
	// recency halves every 3 days since the task's last line `ts` (else `at`). `now` is injectable for tests.
	static rank(list, now = Date.now()){
		const score = t => {
			const when = Date.parse(t._last_ts ?? t.data.ts ?? t.data.at ?? "") || now;
			const weight = (Number(t.priority?.score) || 1) * (1 + [...(t._tasks ?? [])].length);
			return weight * 0.5 ** (Math.max(0, now - when) / (3 * 864e5));
		};
		return [...(list ?? [])].map(t => [t, score(t)]).sort((a, b) => b[1] - a[1]).map(([t]) => t);
	}

	// Time comes from the lines (`at`, else the item tool's `ts`, `assign.at|landed_at|requested_at`), never the wall clock. Server/doc/state.md
	replay_line(line){
		const rp = this._rp ??= { at: null, explicit: false };
		if (typeof (line.ts ?? line.at) === "string") this._last_ts = line.ts ?? line.at;   // for Task.rank
		const a = line.assign && typeof line.assign === "object" ? line.assign : null;
		const verb = VERBS.find(v => line[v] && typeof line[v] === "object");
		rp.at = line.at ?? line.ts ?? a?.at ?? a?.landed_at ?? a?.requested_at ?? line[verb]?.at ?? rp.at;
		if (a){
			// put(), not set(): set() reads `at` as a path (and drops the line) and calls any key that names a method.
			const { state, session_id, at: _t, ...rest } = a;
			for (const [k, v] of Object.entries(rest))
				this.put(k === "finished_at" ? "completed_at" : k === "complete" && typeof v === "number" ? "completion" : k, v);   // old folders
			if (session_id !== undefined) this.put("session", session_id);
		}
		if (typeof line.task === "string"){   // a later reference with the same id (the folder name) replaces the earlier one: the task moved home
			const kid = Task.from_ref(line.task, line.as), had = this.tasks.find(kid.id);
			if (had) this.tasks.replace(had, kid); else this.tasks.insert(kid);
			this.adopt_child(kid);
		}
		if (line.id !== undefined && !a) rp.fresh = true;   // a home-made task's line 1: idle until a verb line says otherwise
		if (typeof line.commit === "string") this.commit(line.commit);
		if (line.reinforce && typeof line.reinforce === "object") this.reinforce({ ...line.reinforce, by: line.reinforce.by ?? line.by });
		if (line.priority && typeof line.priority === "object"){
			const { score, why, by } = line.priority;
			this.put("priority", { score, why, by });
		}
		if (line.content && typeof line.content === "object") this.content.set(line.content);
		if (line.tasks && typeof line.tasks === "object" && !Array.isArray(line.tasks)) this.tasks.set(line.tasks);
		for (const k of FIELDS) if (line[k] !== undefined) this.put(k, line[k]);   // a plain field line, e.g. one the item tool wrote
		if (line.set && typeof line.set === "object") for (const [k, v] of Object.entries(line.set)) this.put(k, v);   // the browser Store's own change line
		// A subtask given its own folder: {"file":"<child>/task.jsonl"} swaps the nested child for that file's task (same id).
		if (typeof line.file === "string" && line.file.endsWith("/task.jsonl") && typeof this.data.path === "string"){
			const kid = Task.from_ref(this.data.path.replace(/\/?$/, "/") + line.file.slice(0, -"task.jsonl".length));
			const had = this.tasks.find(kid.id);
			if (had) this.tasks.replace(had, kid); else this.tasks.insert(kid);
			this.adopt_child(kid);
		}
		// A nested subtask changed: {"<child id>":{…}} goes to that child, the way a page line goes to a content item.
		for (const k of Object.keys(line)) {
			const v = line[k];
			if (!v || typeof v !== "object" || Array.isArray(v) || LINE_KEYS.has(k) || !this._tasks) continue;
			const kid = this._tasks.find(k);
			if (!kid?.replay_line) continue;
			kid.replay_line(v);
			if (typeof v.state === "string" && !VERBS.some(w => v[w])) kid.put("state", v.state);
		}
		const verdict = line.verdict && typeof line.verdict === "object" && ["approve", "improve", "reject"].includes(line.verdict.is) && !verb ? line.verdict : null;
		if (verdict || verb){
			if (!rp.explicit){ rp.explicit = true; this.replay_legacy(true); }
			this._at = rp.at;
			try {
				if (verdict) this[verdict.is]({ by: verdict.by, note: verdict.note });
				else { const { at: _a, ...args } = line[verb]; this[verb](verb === "stop" ? args.why : args); }
			} finally { this._at = null; }   // so a live Store.read never leaves the clock pinned
		}
		return this;
	}

	// No explicit verb line anywhere: infer the state from the old fields.
	replay_end(){
		if (!this._rp?.explicit) this.replay_legacy(!!this._rp?.fresh);
		this._at = null;
		this._rp = null;
		return this;
	}

	// landed -> complete (landed_at alone, outcome or not: Server/doc/state.md), closed -> stopped, else running (today's chasing)
	replay_legacy(partial){
		const d = this.data;
		if (d.landed_at) this.set({ state: "complete", completed_at: d.landed_at });
		else if (d.closed_by) this.set({ state: "stopped", stopped_at: d.closed_at ?? this._rp?.at });
		else if (!partial) this.set({ state: "running" });   // before an explicit line, an open legacy task stays idle so `start` is legal
	}
}

Task.STATES = STATES;
Task.FIELDS = FIELDS;

// Routine procedure per kind of work (doc/templates.md): TaskLoop.launch fills an approved task's `agent` from these; the browser card reads the same words.
Task.TEMPLATES = {
	code: { worktree: true, commit: true, review: true, model: "claude-sonnet-5-5", permission_mode: "bypassPermissions" },
	doc: { worktree: false, commit: true, review: false, model: "claude-sonnet-5-5", permission_mode: "bypassPermissions" },
	scan: { worktree: false, commit: false, review: false, model: "claude-haiku-5-5", permission_mode: "plan" },
};

export default Task;

Item.register(Task, "Task");
