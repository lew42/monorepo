// Node test for Project — no DOM, no server. Run: `node Project.test.mjs`.
import Project from "./Project.js";
import Task from "./Task.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

check("is a Task, starts at requirements, idle", () => {
	const p = new Project({ id: "p" });
	return p instanceof Task && p.stage === "requirements" && p.state === "idle";
});

check("advance() walks the stages; approval waits on the owner, work runs", () => {
	const p = new Project({ id: "p" });
	p.advance(); p.advance();
	if (p.stage !== "plan") return false;
	p.advance();
	if (p.stage !== "approval" || p.state !== "waiting") return false;
	p.advance();
	return p.stage === "work" && p.state === "running" && !!p.started_at;
});

check("landed completes and stamps completed_at; advance past it warns", () => {
	const p = new Project({ id: "p" });
	for (let i = 0; i < 5; i++) p.advance();
	const done = p.stage === "landed" && p.state === "complete" && !!p.completed_at && p.completed === 1;
	p.advance();
	return done && p.stage === "landed";
});

check("an open subtask blocks landing; the stage stays at work", () => {
	const p = new Project({ id: "p" });
	p.tasks.add(new Task({ id: "a" }));
	for (let i = 0; i < 5; i++) p.advance();
	return p.stage === "work" && p.state === "running";
});

check("completion equals completed, replayed from lines", () => { const p = Project.from_lines([{ id: "r", title: "x" }, { start: {} }, { complete: {} }]); return p instanceof Project && p.completion === 1 && p.completed === 1; });

check("completed is computed from subtasks, never stored", () => {
	const p = new Project({ id: "p" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	p.tasks.add(a); p.tasks.add(b);
	if (p.completed !== 0) return false;
	a.start(); a.complete();
	if (p.completed !== 0.5) return false;
	b.start(); b.complete();
	return p.completed === 1 && p.data.completed === undefined;
});

check("completed averages nested projects", () => {
	const p = new Project({ id: "p" }), q = new Project({ id: "q" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" }), c = new Task({ id: "c" });
	q.tasks.add(a); q.tasks.add(b); p.tasks.add(q); p.tasks.add(c);
	a.start(); a.complete();
	return p.completed === (0.5 + 0) / 2;
});

check("no subtasks: 0 until complete", () => {
	const p = new Project({ id: "p" });
	const before = p.completed;
	p.start(); p.complete();
	return before === 0 && p.completed === 1;
});

check("unknown stage falls back to requirements", () => new Project({ id: "p", data: { stage: "nope" } }).stage === "requirements");

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} passing`);
if (passed !== results.length) process.exit(1);
