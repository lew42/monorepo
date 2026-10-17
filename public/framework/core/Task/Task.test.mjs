// Node test for Task — no DOM, no server. Run: `node Task.test.mjs`.
import Task from "./Task.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

check("starts idle", () => new Task({ id: "t" }).state === "idle");

check("start() moves idle -> running and stamps started_at", () => {
	const t = new Task({ id: "t" });
	t.start();
	return t.state === "running" && typeof t.data.started_at === "string";
});

check("pause()/resume() round-trip", () => {
	const t = new Task({ id: "t" });
	t.start(); t.pause();
	if (t.state !== "paused") return false;
	t.resume();
	return t.state === "running";
});

check("an illegal transition warns and is a no-op, never a throw", () => {
	const t = new Task({ id: "t" });
	t.pause();   // idle -> pause is illegal
	return t.state === "idle";
});

check("finish() refuses while a subtask is open, naming it", () => {
	const t = new Task({ id: "t", data: { title: "Parent" } });
	const a = new Task({ id: "a", data: { title: "Sub A" } });
	t.tasks.add(a);
	t.start();
	t.finish();
	return t.state === "running";   // refused — a is still idle, not finished
});

check("finish() succeeds once every subtask is finished", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	t.start();
	a.start(); a.finish();
	b.start(); b.finish();
	t.finish();
	return t.state === "finished" && typeof t.data.finished_at === "string";
});

check("progress() reflects finished subtasks, computed not stored", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 2 })) return false;
	a.start(); a.finish();
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 2 });
});

check("progress() with no subtasks is 0/1, then 1/1 once finished", () => {
	const t = new Task({ id: "t" });
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 1 })) return false;
	t.start(); t.finish();
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 1 });
});

check("duration() counts running time, not paused time", () => {
	const t = new Task({ id: "t" });
	t.start();
	const d1 = t.duration();
	t.pause();
	const banked = t.duration();
	// time passing while paused must not grow duration()
	return d1 >= 0 && banked >= d1 && t.duration() === banked;
});

check("stop() records why and stamps stopped_at", () => {
	const t = new Task({ id: "t" });
	t.start();
	t.stop("owner cancelled");
	return t.state === "stopped" && t.data.why === "owner cancelled" && typeof t.data.stopped_at === "string";
});

const { default: Item } = await import("../Item/Item.js");

check("Task.register()'d — hydrates from a type:\"Task\" line", () => {
	const t = new Task({ id: "t" });
	t.tasks.add(new Task({ id: "a" }));
	const json = JSON.parse(JSON.stringify(t));
	const back = Item.hydrate(json);
	return back instanceof Task && back.tasks.length === 1 && back.tasks.find("a") instanceof Task;
});

// ── replay ──
const A = { assign: { title: "T", agent: "m1", session_id: "s1", steps: ["a (1 min)"], step: 1, requested_at: "2026-10-16T10:00:00Z" } };
const landed = { assign: { landed_at: "2026-10-16T11:00:00Z", outcome: "Done." } };

check("replay: legacy landed file is finished; session_id maps to session", () => {
	const t = Task.replay([A, landed]);
	return t.state === "finished" && t.data.finished_at === "2026-10-16T11:00:00Z" && t.data.session === "s1" && t.data.step === 1 && t.data.steps.length === 1;
});
check("replay: an assign line with `at` (append.mjs stamps one) still counts; a key naming a method is data", () => {
	const t = Task.replay([{ assign: { at: "2026-10-16T10:00:00Z", title: "x", progress: 3 } }, { assign: { at: "2026-10-16T11:00:00Z", landed_at: "2026-10-16T11:00:00Z", outcome: "Done." } }]);
	return t.state === "finished" && t.data.title === "x" && t.data.progress === 3;
});
check("replay: landed_at with an empty outcome is still running", () => Task.replay([A, { assign: { landed_at: "2026-10-16T11:00:00Z", outcome: " " } }]).state === "running");
check("replay: legacy closed file is stopped", () => Task.replay([A, { assign: { closed_by: "owner", closed_at: "2026-10-16T12:00:00Z" } }]).state === "stopped");
check("replay: legacy open file is running", () => Task.replay([A, { log: { at: "2026-10-16T10:05:00Z", msg: "x" } }]).state === "running");
check("replay: explicit wait then approve", () => {
	const lines = [A, { wait: { on: "owner", what: "pick one", at: "2026-10-16T10:30:00Z" } }];
	const w = Task.replay(lines);
	if (w.state !== "waiting" || w.data.waiting_on !== "owner" || w.data.waiting_since !== "2026-10-16T10:30:00Z") return false;
	const t = Task.replay([...lines, { approve: { by: "owner", note: "go", at: "2026-10-16T10:40:00Z" } }]);
	return t.state === "idle" && t.data.waiting_on === null && t.data.approved_by === "owner";
});
check("replay: wait after legacy lines overrides them, even a later legacy landing only adds data", () => {
	const t = Task.replay([A, { wait: { on: "agent-9", at: "2026-10-16T10:30:00Z" } }, landed]);
	return t.state === "waiting" && t.data.landed_at === "2026-10-16T11:00:00Z";
});
check("replay: an illegal transition warns and does not throw", () => {
	const t = Task.replay([A, { start: {} }, { approve: { by: "owner" } }]);   // approve from running is illegal
	return t.state === "running";
});
check("replay: stop and finish accept waiting", () => {
	const w = [A, { wait: { on: "owner", at: "2026-10-16T10:30:00Z" } }];
	return Task.replay([...w, { stop: { why: "no" } }]).state === "stopped" && Task.replay([...w, { finish: {} }]).state === "finished";
});
check("replay: deterministic, uses line times not the wall clock", () => {
	const lines = [A, { start: {}, at: "2026-10-16T10:00:00Z" }, { pause: {}, at: "2026-10-16T10:10:00Z" }, { finish: {}, at: "2026-10-16T10:20:00Z" }];
	const a = Task.replay(lines), b = Task.replay(lines);
	return JSON.stringify(a) === JSON.stringify(b) && a.data.ran_ms === 600000 && a.data.finished_at === "2026-10-16T10:20:00Z";
});
check("tasks is made on first use; progress() works before it", () => {
	const t = Task.replay([A]);
	return t._tasks === undefined && t.progress().total === 1 && t.tasks.length === 0 && t._tasks !== undefined;
});

check("fields: expected, module, session, priority, commits", () => {
	const t = Task.replay([{ assign: { expected: "x", module: ["core/Task"], session_id: "s9" } },
		{ priority: { score: 5, why: "w", by: "owner" } }, { priority: { score: 7, why: "v", by: "m" } },
		{ commit: "abc" }, { commit: "def" }, { commit: "abc" }]);
	return t.expected === "x" && t.module[0] === "core/Task" && t.session === "s9"
		&& t.priority.score === 7 && t.priority.by === "m" && t.commits.join() === "abc,def"
		&& new Task({ id: "n" }).priority === null && new Task({ id: "n" }).commit("z").commits[0] === "z";
});
check("complete: checked_by wins, check() is final", () => {
	const t = new Task({ id: "t" }); t.check({ by: "owner" });
	return t.complete === 1 && t.data.checked_by === "owner";
});
check("complete: subtasks are the share finished", () => {
	const t = new Task({ id: "t" });
	t.tasks.add(new Task({ id: "a" })); t.tasks.add(new Task({ id: "b" }));
	t.tasks.find("a").finish();
	return t.complete === 0.5;
});
check("complete: legacy steps, step is the current one", () => {
	const t = Task.replay([{ assign: { steps: ["a", "b", "c", "d"], step: 3 } }]);
	return t.complete === 0.5;
});
check("complete: agent value, finished, and unset", () => {
	const a = new Task({ id: "a" }); a.put("complete", 0.3);
	const f = Task.replay([A, { finish: {} }]), n = new Task({ id: "n" });
	return a.complete === 0.3 && f.complete === 1 && n.complete === 0;
});
check("replay: commit lines on a legacy open file stay running", () => {
	const t = Task.replay([{ assign: { title: "T", requested_at: "2026-10-16T10:00:00Z" } }, { commit: "abc" }]);
	return t.state === "running" && t.commits[0] === "abc";
});

check("render() with no DOM returns undefined and warns once", () => {
	const warns = []; const w = console.warn; console.warn = m => warns.push(m);
	const t = new Task({ id: "r" });
	const out = [t.render(), t.render()];
	console.warn = w;
	return out.every(x => x === undefined) && warns.length === 1;
});

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} passing`);
if (passed !== results.length) process.exit(1);
