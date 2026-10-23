// A Process: a Task whose children are named phases, run in series by node (doc/process.md). Data plus one decision, next(); it never moves itself.
import Task from "./Task.js";
import Item from "../Item/Item.js";

// Lines only node writes, each naming the phase it is about: {"spawn":{"phase":"plan","agent":…}}.
const PHASE_LINES = { spawn: "spawned", queue: "queued", pulse: "pulses", measure: "measure" };

export class Process extends Task {

	// Phases always run in series, and only node starts them: Task's in-memory auto-start is off, so state comes from lines alone.
	get mode(){ return "series"; }
	start_children(){}
	child_changed(){}

	get process(){ return this.get_one("process") ?? null; }
	get creator(){ return this.get_one("creator") ?? null; }
	get phases(){ return [...(this._tasks ?? [])]; }
	// The phase being worked on: the first one not complete, or null once all are.
	get phase(){ return this.phases.find(p => p.state !== "complete") ?? null; }

	// What node should do now, as one action; null = nothing (waiting on an agent, the owner, or finished).
	next(){
		if (this.state === "idle") return { start: true };
		if (this.state !== "running") return null;
		const p = this.phase;
		if (this.moves_home()) return { move: this.get_one("module") };
		if (!p) return { complete: true };
		const run = p.get_one("session")?.run ?? "fresh";
		if (p.state === "idle") return run === "wait" ? { wait: p.id } : { start: p.id };
		if (p.state === "running" && !p.get_one("spawned")) return { launch: p.id };
		return null;
	}

	// Draft in the session, then move home (doc/owner-2026-10-20-projects-and-completion.md §6): once a phase marked `home_after` is complete
	// (build: approve-plan), a process that names a `module` belongs in <module>/tasks/<id>/. True while it is not there yet.
	moves_home(){
		const mod = this.get_one("module");
		if (typeof mod !== "string" || !mod || this.get_one("home_refused")) return false;   // refused once (the folder exists): it stays
		if (!this.phases.some(p => p.get_one("home_after") && p.state === "complete")) return false;
		return this.get_one("path") !== `/framework/${mod.replace(/^\/+|\/+$/g, "")}/tasks/${this.id}/`;
	}

	// The prompt node sends the phase's session: the job, the brief, what earlier phases found, and the one line that completes it.
	prompt(id, url){
		const p = this.phases.find(x => x.id === id);
		if (!p) return null;
		const done = this.phases.filter(x => x.state === "complete" && x.get_one("outcome"));
		const brief = this.get_one("brief");
		return [
			`You are running the "${p.get_one("title") ?? id}" phase of the ${this.process ?? "process"} process "${this.get_one("title") ?? this.id}" (${url}).`,
			brief ? `The brief: ${brief}. Read it first.` : "",
			done.length ? `What the earlier phases recorded:\n${done.map(x => `- ${x.id}: ${x.get_one("outcome")}`).join("\n")}` : "",
			`Your job in this phase: ${p.get_one("do") ?? "(not described)"}`,
			`When the phase is done, record it with the item tool; this is what moves the process on, and nothing else does:`,
			`item({path: "${url}", delta: {"${id}": {"complete": {"outcome": "<a few sentences: what you found or did, and the files or branch it is in>"}}}})`,
		].filter(Boolean).join("\n\n");
	}

	// The lines that make a new process from a definition: line-1 fields, then one add per phase. `phases` overrides a phase's session: {plan: {model}}.
	static lines({ process, phases: over = {}, ...fields } = {}){
		const def = this.DEFINITIONS[process];
		if (!def) return null;
		const first = { class: "Process", process, mode: "series", ...fields };
		const adds = def.map(p => ({ tasks: { add: { type: "Task", ...p, ...(over[p.id] ? { session: { ...p.session, ...over[p.id] } } : {}) } } }));
		return [first, ...adds];
	}

	// Node's own lines: each records a fact on the phase it names. Everything else is a Task line.
	replay_line(line){
		if (typeof line.process === "string") this.put("process", line.process);
		if (line.class === "Process" && typeof line.by === "string") this.put("creator", line.by);   // line 1's writer made the process: the "owner" phases go to it
		for (const [key, field] of Object.entries(PHASE_LINES)){
			const body = line[key];
			const kid = body && typeof body === "object" && typeof body.phase === "string" ? this._tasks?.find(body.phase) : null;
			if (kid){ const { phase: _p, ...rest } = body; kid.put(field, key === "pulse" ? rest.n ?? 1 : { ...rest, at: rest.at ?? line.at ?? line.ts }); }
		}
		return super.replay_line(line);
	}
}

// The small core set. A phase id never names a Task verb or field (`improve` would call improve()). A phase: id, title, `do` (the job), `session` ({run: fresh | same | owner | wait, role, model, effort}).
const SONNET = "claude-sonnet-5-5", HAIKU = "claude-haiku-5-5";
Process.DEFINITIONS = {
	build: [
		{ id: "investigate", title: "Investigate", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
			do: "Read the brief and the readmes on the way to the code it names. Write investigation.md beside the brief: the questions that matter, ranked; what is known, as class sketches (class X extends Y, its core API) and named parts; what already exists to reuse (node Server/PastWork.mjs \"<topic>\"); risks. Mark each fact you checked in the code as checked; the rest are guesses." },
		{ id: "plan", title: "Plan", session: { run: "same" },
			do: "Write plan.md beside the brief: the class sketch, the files to change, small steps you can check, and how you will prove it works. Then re-read the owner's words in the brief and say, one line each, whether the plan covers them." },
		{ id: "improve-plan", title: "Improve the plan", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
			do: "Read the brief, investigation.md and plan.md with fresh eyes. Fix plan.md where it misses the brief, rebuilds something that exists, or is bigger than needed. List what you changed at the end of plan.md under 'Improved'." },
		{ id: "approve-plan", title: "Approve the plan", session: { run: "owner" }, home_after: true,
			do: "Read plan.md. Complete this phase with outcome 'approved' (plus any caveat), or 'changes: …' naming what the builder must change first." },
		{ id: "execute", title: "Execute", session: { run: "fresh", role: "helper", model: SONNET, effort: "medium" },
			do: "Build the plan on its own branch in a worktree Servex serves: take one with the take_worktree tool (it has its packages and a site at http://<name>.localhost/). Only if that tool is missing, use git worktree add -b task/<slug> ../worktrees/<slug> michael/dev, and say in the outcome that it is not served. Apply any 'changes:' from the approve-plan phase first. Load every page you changed with check_page at its worktree url and fix each console error. Commit each working step. Never merge. Outcome: the branch, the worktree url, the commits, and how you tested it." },
		{ id: "review", title: "Review", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
			do: "Review the branch named in the execute outcome (git diff michael/dev...<branch>) against plan.md and the brief. Fix small problems on the branch and commit; run the test the plan names. Load every changed page with check_page at the worktree url from the execute outcome (and the shot tool at 400 and 1200 px when the brief names widths). Outcome: 'ready to merge: <branch>' only when those pages loaded with no console errors; if you could not load them, 'not checked: <why>', never ready." },
		{ id: "merge", title: "Merge", session: { run: "wait" },
			do: "The owner merges the reviewed branch, or says no." },
	],
	investigate: [
		{ id: "questions", title: "Questions", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
			do: "Write questions.md beside the brief: the questions it raises, ranked by how much each answer changes the work; for each, what is already known (with the file) and how to find out. Name the known structure as class sketches." },
		{ id: "scout", title: "Scout", session: { run: "fresh", role: "helper", model: HAIKU, effort: "low" },
			do: "Answer the top three questions in questions.md: in the repo (readmes, grep) and, for questions about the world outside, on the web (WebSearch, WebFetch). Keep each read small and stay under 100k tokens. Append each answer to questions.md with its sources." },
		{ id: "synthesize", title: "Synthesize", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
			do: "Write findings.md: each question with its answer, marked 'checked in code', 'two sources agree' or 'guess'. Never a made-up confidence number." },
	],
};

export default Process;

Item.register(Process, "Process");
