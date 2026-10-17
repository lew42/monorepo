// A DOM-free unit of work: id, title, a STATE, timestamps, a computed duration,
// and a List of subtasks. Runs in node (no `core/View` import) the same way
// `core/Item/Item.js` does — `AITask extends Task` (a later pass) adds the brief,
// agents, cost and review on top.
import Item from "../Item/Item.js";
import List from "../List/List.js";

const STATES = ["idle", "running", "paused", "waiting", "stopped", "complete"];

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
		if ([...this._tasks].every(t => t.state === "complete")) this.complete();
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
	get state(){ const s = this.get_one("state") ?? "idle"; return s === "finished" ? "complete" : s; }

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
		const total = this._tasks?.length ?? 0;
		if (!total) return { done: this.state === "complete" ? 1 : 0, total: 1 };
		return { done: [...this._tasks].filter(t => t.state === "complete").length, total };
	}

	// Fields: plain data, read where they are written (readme: Fields).
	get expected(){ return this.get_one("expected"); }
	get module(){ return this.get_one("module"); }
	get session(){ return this.get_one("session") ?? this.get_one("session_id"); }
	get priority(){ return this.get_one("priority") ?? null; }
	get commits(){ return [...(this.data.commits ?? [])]; }
	commit(hash){
		const h = String(hash ?? "").trim();
		if (!h || (this.data.commits ?? []).includes(h)) return this;
		this.put("commits", [...(this.data.commits ?? []), h]);
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
		const total = this._tasks?.length;
		if (total) return [...this._tasks].filter(t => t.state === "complete").length / total;
		const steps = this.data.steps;
		if (Array.isArray(steps) && steps.length){
			const step = Math.max(1, Math.min(Number(this.data.step) || 1, steps.length));
			return (this.state === "complete" ? steps.length : step - 1) / steps.length;
		}
		const c = this.data.completion ?? this.data.complete;
		if (typeof c === "number") return Math.max(0, Math.min(1, c));
		return this.state === "complete" ? 1 : 0;
	}

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
	// approve: back to idle (start() it again). Approval with a caveat is approve(note).
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

	// Refuses while any subtask is not complete: names the first open one, the
	// same "tell them what to do next" shape as Item.locate()'s own warnings.
	complete({ completion, complete } = {}){
		if (this.state === "complete") return this;

		const open = [...(this._tasks ?? [])].find(t => t.state !== "complete");
		if (open) return this.warn(`complete(): "${open.get("title") ?? open.id}" isn't complete yet — complete that first`);

		if (!CAN.complete.has(this.state)) return this.warn(`complete(): can't complete from "${this.state}"`);

		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		const c = completion ?? complete;
		this.set({ completed_at: this.stamp(), ran_ms, ...(c !== undefined ? { completion: c } : {}), state: "complete" });
		return this;
	}

	// Old name, kept for old callers and old logs; nothing new writes it.
	finish(args){ return this.complete(args); }
}

// Build a Task from parsed `task.jsonl` lines (see readme: Replay). Time comes from the
// lines (`at`, `assign.at|landed_at|requested_at`), never the wall clock.
Task.replay = function(lines){
	const first = lines.find(l => l?.assign)?.assign ?? {};
	const task = new Task({ id: first.slug ?? first.task ?? "task" });
	let at = null, explicit = false;
	const legacy = (partial) => {   // landed -> complete, closed -> stopped, else running (today's chasing)
		const d = task.data;
		if (d.landed_at && String(d.outcome ?? "").trim()) task.set({ state: "complete", completed_at: d.landed_at });
		else if (d.closed_by) task.set({ state: "stopped", stopped_at: d.closed_at ?? at });
		else if (!partial) task.set({ state: "running" });   // before an explicit line, an open legacy task stays idle so `start` is legal
	};
	for (const line of lines){
		if (!line || typeof line !== "object") continue;
		const a = line.assign && typeof line.assign === "object" ? line.assign : null;
		const verb = VERBS.find(v => line[v] && typeof line[v] === "object");
		at = line.at ?? a?.at ?? a?.landed_at ?? a?.requested_at ?? line[verb]?.at ?? at;
		if (a){
			// put(), not set(): set() reads `at` as a path (and drops the line) and calls any key that names a method.
			const { state, session_id, at: _t, ...rest } = a;
			for (const [k, v] of Object.entries(rest)){
					task.put(k === "finished_at" ? "completed_at" : k === "complete" && typeof v === "number" ? "completion" : k, v);   // old folders
				}
			if (session_id !== undefined) task.put("session", session_id);
		}
		if (typeof line.commit === "string") task.commit(line.commit);
		if (line.priority && typeof line.priority === "object"){
			const { score, why, by } = line.priority;
			task.put("priority", { score, why, by });
		}
		if (line.content && typeof line.content === "object") task.content.set(line.content);
		if (line.verdict && typeof line.verdict === "object" && ["approve", "improve", "reject"].includes(line.verdict.is) && !verb){
			if (!explicit){ explicit = true; legacy(true); }
			task._at = at;
			task[line.verdict.is]({ by: line.verdict.by, note: line.verdict.note });
		}
		if (verb){
			if (!explicit){ explicit = true; legacy(true); }
			task._at = at;
			const { at: _a, ...args } = line[verb];
			task[verb](verb === "stop" ? args.why : args);
		}
	}
	if (!explicit) legacy();
	task._at = null;
	return task;
};

Task.STATES = STATES;

export default Task;

Item.register(Task, "Task");
