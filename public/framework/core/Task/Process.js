// A Process: a Task whose children are named steps, run in series by node (doc/process.md). Data plus one decision, next(); it never moves itself.
import Task from "./Task.js";
import Item from "../Item/Item.js";

// Lines only node writes, each naming the step it is about: {"spawn":{"step":"plan","agent":…}}.
const STEP_LINES = { spawn: "spawned", queue: "queued", pulse: "pulses", measure: "measure" };

export class Process extends Task {

	// Steps always run in series, and only node starts them: Task's in-memory auto-start is off, so state comes from lines alone.
	get mode(){ return "series"; }
	start_children(){}
	child_changed(){}

	get process(){ return this.get_one("process") ?? null; }
	get creator(){ return this.get_one("creator") ?? null; }
	get steps(){ return [...(this._tasks ?? [])]; }
	// The step being worked on: the first one not complete, or null once all are.
	get step(){ return this.steps.find(p => p.state !== "complete") ?? null; }

	// What node should do now, as one action; null = nothing (waiting on an agent, the owner, or finished).
	next(){
		if (this.state === "idle") return { start: true };
		// Stopped with a step still running in a fresh session it spawned: halt that step (node stops its agent). The creator's own session is never stopped.
		if (this.state === "stopped"){ const h = this.steps.find(p => p.state === "running" && p.get_one("spawned")?.run === "fresh"); return h ? { halt: h.id } : null; }
		if (this.state !== "running") return null;
		const p = this.step;
		if (this.moves_home()) return { move: this.get_one("module") };
		if (!p) return { complete: true };
		const run = this.run_of(p);
		if (p.state === "idle") return run === "wait" ? { wait: p.id } : { start: p.id };
		if (p.state === "running" && !p.get_one("spawned")) return { launch: p.id };
		return null;
	}

	// How a step is run (doc/process.md, "A step's session"): its own session.run; a step with none runs fresh, except in a process of your own steps, where it goes to the creator.
	run_of(p){ return p?.get_one("session")?.run ?? (this.process === "steps" ? "owner" : "fresh"); }

	// Draft in the session, then move home (doc/owner-2026-10-20-projects-and-completion.md §6): once a step marked `home_after` is complete
	// (build: approve-plan), a process that names a `module` belongs in <module>/tasks/<id>/. True while it is not there yet.
	moves_home(){
		const mod = this.get_one("module");
		if (typeof mod !== "string" || !mod || this.get_one("home_refused")) return false;   // refused once (the folder exists): it stays
		if (!this.steps.some(p => p.get_one("home_after") && p.state === "complete")) return false;
		return this.get_one("path") !== `/framework/${mod.replace(/^\/+|\/+$/g, "")}/tasks/${this.id}/`;
	}

	// The prompt node sends the step's session: the job, the brief, what earlier steps found, and the one line that completes it.
	prompt(id, url){
		const p = this.steps.find(x => x.id === id);
		if (!p) return null;
		const done = this.steps.filter(x => x.state === "complete" && x.get_one("outcome"));
		const brief = this.get_one("brief");
		return [
			`You are running the "${p.get_one("title") ?? id}" step of the ${this.process ?? "process"} process "${this.get_one("title") ?? this.id}" (${url}).`,
			brief ? `The brief: ${brief}. Read it first.` : "",
			done.length ? `What the earlier steps recorded:\n${done.map(x => `- ${x.id}: ${x.get_one("outcome")}`).join("\n")}` : "",
			`Your job in this step: ${p.get_one("do") ?? "(not described)"}`,
			`When the step is done, record it with the item tool; this is what moves the process on, and nothing else does:`,
			`item({path: "${url}", delta: {"${id}": {"complete": {"outcome": "<a few sentences: what you found or did, and the files or branch it is in>"}}}})`,
		].filter(Boolean).join("\n\n");
	}

	// The lines that make a new process from a definition: line-1 fields, then one add per step. `steps_over` overrides a step's session: {plan: {model}}.
	// No definition but `steps` ([{title, do, session?}]): an ad-hoc process (`process` defaults to "steps"); a step with no session goes to the creator (run: owner).
	static lines({ process, steps_over: over = {}, steps, ...fields } = {}){
		const T = this.template(process), def = T ? T.steps : this.from_steps(steps);
		if (!def) return null;
		if (!T) process = "steps";   // own steps: whatever name came with them, no template matched
		const first = { class: "Process", process, mode: "series", ...fields };
		const adds = def.map(p => ({ tasks: { add: { type: "Task", ...p, ...(over[p.id] ? { session: { ...p.session, ...over[p.id] } } : {}) } } }));
		return [first, ...adds];
	}

	// The process templates, by name: one subclass each in processes/ (BuildProcess…), registered by processes/index.js (import Process from there when you need the templates; Process.js cannot import them, they extend it). `names()` is what the item tool's refusal lists.
	static TEMPLATES = {};
	static template(name){ return this.TEMPLATES[name] ?? null; }
	static names(){ return Object.keys(this.TEMPLATES); }

	// Words a log line is read by (a line's own keys, and every verb): a step id like these would be mistaken for the line, so it is slugged with a suffix.
	static RESERVED = ["file", "id", "log", "title", "by", "ts", "type", "task", "tasks", "assign", "state", "start", "pause", "resume", "stop", "complete", "finish", "wait", "approve", "improve", "reject"];

	// Steps written by the caller, as steps. Refused (null) when empty or when two share an id. An id that would name a Task verb, field or line key
	// (`improve` would call improve(); `file` is a line key) gets "-step" added: `file` -> `file-step`.
	static from_steps(steps){
		if (!Array.isArray(steps) || !steps.length) return null;
		const slug = t => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
		const out = steps.map((x, i) => { const o = typeof x === "string" ? { title: x } : { ...x }; o.id = slug(o.id ?? o.title) || `step-${i + 1}`; o.title ??= o.id; if (this.reserved(o.id)) o.id += "-step"; o.session ??= { run: "owner" }; return o; });
		if (new Set(out.map(o => o.id)).size !== out.length) return null;
		return out;
	}
	static reserved(id){ return this.RESERVED.includes(id) || id in Task.prototype || id in this.prototype; }

	// Node's own lines: each records a fact on the step it names. Everything else is a Task line.
	replay_line(line){
		if (typeof line.process === "string") this.put("process", line.process);
		if (line.class === "Process" && typeof line.by === "string") this.put("creator", line.by);   // line 1's writer made the process: the "owner" steps go to it
		for (const [key, field] of Object.entries(STEP_LINES)){
			const body = line[key];
			const at = body && typeof body === "object" ? body.step ?? body.phase : null;   // old logs wrote `phase`: still read, never rewritten
			const kid = typeof at === "string" ? this._tasks?.find(at) : null;
			if (kid){ const { step: _s, phase: _p, ...rest } = body; kid.put(field, key === "pulse" ? rest.n ?? 1 : { ...rest, at: rest.at ?? line.at ?? line.ts }); }
		}
		return super.replay_line(line);
	}
}

export default Process;

Item.register(Process, "Process");
