// A DOM-free unit of work: id, title, a STATE, timestamps, a computed duration,
// and a List of subtasks. Runs in node (no `core/View` import) the same way
// `core/Item/Item.js` does — `AITask extends Task` (a later pass) adds the brief,
// agents, cost and review on top.
import Item from "../Item/Item.js";
import List from "../List/List.js";

const STATES = ["idle", "running", "paused", "stopped", "finished"];

// Which states each verb may start FROM — named by the verb, so the rule next to
// the verb is the rule that uses it.
const CAN = {
	start: new Set(["idle", "stopped"]),
	pause: new Set(["running"]),
	resume: new Set(["paused"]),
	stop: new Set(["idle", "running", "paused"]),
	finish: new Set(["idle", "running", "paused", "stopped"]),
};

const now = () => new Date().toISOString();

export class Task extends Item {

	constructor(...args){
		super(...args);
		this.tasks = new List({ owner: this, name: "tasks" });
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

	// `get_one`, not `get` (2026-10-03): `get("state")`'s own first step checks
	// `this["state"]` for a real instance property — which THIS GETTER IS,
	// so calling it from inside itself recurses forever. `get_one` is the
	// plain data seam underneath, exactly what a bare field lookup needs.
	get state(){ return this.get_one("state") ?? "idle"; }

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
		return this._ran_ms + (this._ran_since != null ? Date.now() - this._ran_since : 0);
	}

	// `{done, total}` from the subtasks' own states — never a stored number
	// (CLAUDE.md law 7: compute, don't recall). No subtasks yet is reported as
	// 0/1 (or 1/1 once finished), so a progress bar still means something before
	// the first subtask exists.
	progress(){
		const total = this.tasks.length;
		if (!total) return { done: this.state === "finished" ? 1 : 0, total: 1 };
		return { done: [...this.tasks].filter(t => t.state === "finished").length, total };
	}

	start(){
		if (!CAN.start.has(this.state)) return this.warn(`start(): can't start from "${this.state}"`);
		this._ran_since = Date.now();
		this.set({ state: "running", started_at: this.data.started_at ?? now() });
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
		this._ran_since = Date.now();
		this.set({ state: "running" });
		return this;
	}

	stop(why){
		if (!CAN.stop.has(this.state)) return this.warn(`stop(): can't stop from "${this.state}"`);
		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		this.set({ state: "stopped", stopped_at: now(), ran_ms, why: why ?? null });
		return this;
	}

	// Refuses while any subtask isn't finished — names the first open one, the
	// same "tell them what to do next" shape as `Item.locate()`'s own warnings.
	finish({ complete } = {}){
		if (this.state === "finished") return this;

		const open = [...this.tasks].find(t => t.state !== "finished");
		if (open) return this.warn(`finish(): "${open.get("title") ?? open.id}" isn't finished yet — finish that first`);

		if (!CAN.finish.has(this.state)) return this.warn(`finish(): can't finish from "${this.state}"`);

		const ran_ms = this.duration();
		this._ran_ms = ran_ms;
		this._ran_since = null;
		this.set({ state: "finished", finished_at: now(), ran_ms, ...(complete !== undefined ? { complete } : {}) });
		return this;
	}
}

Task.STATES = STATES;

export default Task;

Item.register(Task, "Task");
