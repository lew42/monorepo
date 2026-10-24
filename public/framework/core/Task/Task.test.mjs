// Node test for Task — no DOM, no server. Run: `node Task.test.mjs`.
import Task from "./Task.js";
const EV = { outcome: "ok", evidence: ["test"] };

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

check("complete() refuses while a subtask is open, naming it", () => {
	const t = new Task({ id: "t", data: { title: "Parent" } });
	const a = new Task({ id: "a", data: { title: "Sub A" } });
	t.tasks.add(a);
	t.start();
	t.complete(EV);
	return t.state === "running";   // refused — a is still idle, not finished
});

check("complete() succeeds once every subtask is finished", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	t.start();
	a.start(); a.complete(EV);
	b.start(); b.complete(EV);
	t.complete(EV);
	return t.state === "complete" && typeof t.data.completed_at === "string";
});

check("progress() reflects finished subtasks, computed not stored", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 2, stopped: 0 })) return false;
	a.start(); a.complete(EV);
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 2, stopped: 0 });
});

check("progress() leaves stopped subtasks out of done and total", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" }), c = new Task({ id: "c" });
	t.tasks.add(a); t.tasks.add(b); t.tasks.add(c);
	a.start(); a.complete(EV); b.start(); b.stop("noise");
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 2, stopped: 1 });
});

check("a nested verb stamps the parent's line time (Task.clock), not the read's", () => {
	const a = new Task({ id: "a" });
	Task.clock = "2026-10-23T01:00:00.000Z"; a.start();
	Task.clock = "2026-10-23T01:30:00.000Z"; a.complete(EV); Task.clock = null;
	return a.data.completed_at === "2026-10-23T01:30:00.000Z" && a.duration() === 30 * 60e3;
});

check("progress() with no subtasks is 0/1, then 1/1 once finished", () => {
	const t = new Task({ id: "t" });
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 1 })) return false;
	t.start(); t.complete(EV);
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
	return t.state === "complete" && t.data.completed_at === "2026-10-16T11:00:00Z" && t.data.session === "s1" && t.data.step === 1 && t.data.steps.length === 1;
});
check("replay: an assign line with `at` (append.mjs stamps one) still counts; a key naming a method is data", () => {
	const t = Task.replay([{ assign: { at: "2026-10-16T10:00:00Z", title: "x", progress: 3 } }, { assign: { at: "2026-10-16T11:00:00Z", landed_at: "2026-10-16T11:00:00Z", outcome: "Done." } }]);
	return t.state === "complete" && t.data.title === "x" && t.data.progress === 3;
});
check("a landed task given a new open child reads running until that child is done, then complete again", () => {
	const t = Task.replay([A, landed, { tasks: { add: { type: "Task", id: "ask", title: "a request" } } }]);
	const open = t.state === "running" && t.data.state === "complete";
	const u = Task.replay([A, landed, { tasks: { add: { type: "Task", id: "ask", title: "a request" } } }, { ask: { complete: { outcome: "done" } } }]);
	return open && u.state === "complete";
});

check("replay: landed_at alone is complete, outcome or not (Server/doc/state.md)", () => { const t = Task.replay([A, { assign: { landed_at: "2026-10-16T11:00:00Z" } }]); return t.state === "complete" && t.data.completed_at === "2026-10-16T11:00:00Z"; });
check("replay: a line with `ts` and no `at` sets the time (the item tool stamps ts)", () => { const t = Task.replay([{ id: "x", ts: "2026-10-16T10:00:00Z" }, { start: {}, ts: "2026-10-16T10:05:00Z" }, { complete: {}, ts: "2026-10-16T11:00:00Z" }]); return t.state === "complete" && t.data.completed_at === "2026-10-16T11:00:00Z"; });
check("replay: a recorded finish stands after the worker filed an idle {task: ref} child", () => { const t = Task.replay([A, { task: "/framework/mod/x/tasks/filed/", at: "2026-10-16T10:10:00Z" }, { finish: { at: "2026-10-16T11:00:00Z", outcome: "Done." } }]); return t.state === "complete" && t.data.completed_at === "2026-10-16T11:00:00Z"; });
check("complete(): live calls still refuse while a subtask is open", () => { const t = Task.replay([A, { start: {} }, { task: "/framework/mod/x/tasks/filed/" }]); t.complete(EV); return t.state === "running"; });
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
	return Task.replay([...w, { stop: { why: "no" } }]).state === "stopped" && Task.replay([...w, { complete: {} }]).state === "complete";
});
check("replay: deterministic, uses line times not the wall clock", () => {
	const lines = [A, { start: {}, at: "2026-10-16T10:00:00Z" }, { pause: {}, at: "2026-10-16T10:10:00Z" }, { finish: {}, at: "2026-10-16T10:20:00Z" }];
	const a = Task.replay(lines), b = Task.replay(lines);
	return JSON.stringify(a) === JSON.stringify(b) && a.data.ran_ms === 600000 && a.data.completed_at === "2026-10-16T10:20:00Z";
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
	return t.completion === 1 && t.data.checked_by === "owner";
});
check("complete: subtasks are the share finished", () => {
	const t = new Task({ id: "t" });
	t.tasks.add(new Task({ id: "a" })); t.tasks.add(new Task({ id: "b" }));
	t.tasks.find("a").complete(EV);
	return t.completion === 0.5;
});
check("complete: legacy steps, step is the current one", () => {
	const t = Task.replay([{ assign: { steps: ["a", "b", "c", "d"], step: 3 } }]);
	return t.completion === 0.5;
});
check("complete: agent value, finished, and unset", () => {
	const a = new Task({ id: "a" }); a.put("complete", 0.3);
	const f = Task.replay([A, { complete: {} }]), n = new Task({ id: "n" });
	return a.completion === 0.3 && f.completion === 1 && n.completion === 0;
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


const family = (mode, n) => {
	const p = new Task({ id: "p" }); p.put("mode", mode);
	for (let i = 1; i <= n; i++) p.tasks.add(new Task({ id: "c" + i }));
	return [p, ...[...p.tasks]];
};

// State (Server/State.mjs) buckets exactly these states; its check.unbucketed names any new one (Server/doc/state.md).
check("never drop a task: every state is one State buckets", () =>
	Task.STATES.every(s => ["complete", "stopped", "waiting", "running", "paused", "idle"].includes(s)) && Task.STATES.length === 6);

check("node drives every step: series starts child 1 only, then each next, then the parent completes", () => {
	const [p, a, b, c] = family("series", 3);
	p.start();
	const s1 = [a, b, c].map(t => t.state).join();
	a.start === a.start && a.complete(EV);
	const s2 = [a, b, c].map(t => t.state).join();
	b.complete(EV);
	const s3 = [a, b, c].map(t => t.state).join();
	c.complete(EV);
	return s1 === "running,idle,idle" && s2 === "complete,running,idle" && s3 === "complete,complete,running" && p.state === "complete" && p.completion === 1;
});

check("node drives every step: parallel starts both children, parent completes after both", () => {
	const [p, a, b] = family("parallel", 2);
	p.start();
	if (a.state !== "running" || b.state !== "running") return false;
	a.complete(EV);
	if (p.state !== "running") return false;
	b.complete(EV);
	return p.state === "complete";
});

check("mode defaults to parallel", () => new Task({ id: "m" }).mode === "parallel" && Task.replay([{ assign: { mode: "series" } }]).mode === "series");

check("replay of an old folder: finish / finished_at become complete / completed_at", () => {
	const t = Task.replay([A, { start: {}, at: "2026-10-16T10:00:00Z" }, { finish: {}, at: "2026-10-16T10:05:00Z" }]);
	const u = Task.replay([{ assign: { title: "o", finished_at: "2026-10-16T11:00:00Z", complete: 0.5 } }, { start: {} }]);
	return t.state === "complete" && t.data.completed_at === "2026-10-16T10:05:00Z" && !("finished_at" in t.data) && u.data.completed_at === "2026-10-16T11:00:00Z" && u.completion === 0.5;
});

check("a stored state of finished reads as complete", () => (() => { const t = new Task({ id: "o" }); t.put("state", "finished"); return t.state === "complete"; })());

const waiting = () => Task.replay([A, { start: {} }, { wait: { on: "owner", what: "ok?" } }]);
check("approve(note): waiting -> running, verdict recorded", () => {
	const t = waiting().approve("fine, but mind X");
	return t.state === "idle" && t.data.verdict.is === "approve" && t.data.verdict.note === "fine, but mind X";
});
check("improve(note): waiting -> running", () => {
	const t = waiting().improve({ note: "redo", by: "owner" });
	return t.state === "running" && t.data.verdict.is === "improve" && t.data.verdict.by === "owner";
});
check("reject(note): waiting -> stopped, note is the reason", () => {
	const t = waiting().reject("no");
	return t.state === "stopped" && t.data.why === "no" && t.data.verdict.is === "reject";
});
check("verdicts replay as verbs and as verdict lines", () => {
	const a = Task.replay([A, { start: {} }, { wait: { on: "owner" } }, { reject: { note: "x" } }]);
	const b = Task.replay([A, { start: {} }, { wait: { on: "owner" } }, { verdict: { is: "improve", note: "y", by: "o" } }]);
	return a.state === "stopped" && b.state === "running" && b.data.verdict.note === "y";
});
check("a verdict outside waiting warns and changes nothing", () => new Task({ id: "v" }).approve("x").state === "idle");

// ---- step 13: Item owns replay ----
const OLD = [{ assign: { slug: "old", title: "Old", module: "core/Task", requested_at: "2026-10-16T10:00:00Z", finished_at: "2026-10-16T11:00:00Z", complete: 1, session_id: "s1" } },
	{ commit: "abc1234" }, { assign: { landed_at: "2026-10-16T11:00:00Z", outcome: "done" } }];
check("a Store-style replay_line per line matches Task.replay on an old folder", () => {
	const a = Task.replay(OLD);
	const b = new Task({ id: "old" });
	for (const line of OLD) b.replay_line(line);   // what Item.Store.read does for each entry
	b.replay_end();
	return a.state === "complete" && b.state === a.state && JSON.stringify(b.data) === JSON.stringify(a.data);
});
check("replay_line never leaves the clock pinned (live Store.read)", () => {
	const t = new Task({ id: "p" });
	t.replay_line({ start: { at: "2026-10-16T10:00:00Z" } });
	return t.state === "running" && t.data.started_at === "2026-10-16T10:00:00Z" && t._at === null;
});
check("tags: [module, own tags, parent tags], no duplicates or empties", () => {
	const parent = Task.replay([{ assign: { slug: "p", module: "core/Task" } }, { tags: ["plan", "", "core/Task"] }]);
	parent.tasks.set({ add: { type: "Task", id: "kid", data: { module: "core/Item", tags: ["plan", "x"] } } });
	const kid = parent.tasks.find("kid");
	return JSON.stringify(kid.tags) === JSON.stringify(["core/Item", "plan", "x", "core/Task"]) && JSON.stringify(new Task({ id: "n" }).tags) === "[]";
});
check("expected as an array survives replay; a string stays a string", () => {
	const a = Task.replay([A, { expected: ["one", "two"] }]), b = Task.replay([A, { expected: "just one" }]);
	return Array.isArray(a.expected) && a.expected.length === 2 && b.expected === "just one";
});
check("approve goes to accepted (idle), and start() is the agent's own call", () => { const t = waiting().approve("go"); if (t.state !== "idle") return false; t.start(); return t.state === "running"; });

check("content.add through replay, drawn data kept", () => {
	const t = Task.replay([A, { content: { add: { id: "n1", text: "a note" } } }, { content: { add: { id: "n2", title: "a decision" } } }]);
	return t.content.length === 2 && t.content.find("n1").get("text") === "a note";
});

check("settled() resolves at once when already complete, and later when it completes", async () => {
	const done = new Task({ id: "d" }); done.start(); done.complete(EV);
	const t = new Task({ id: "s" }); t.start();
	const p = t.settled(); let got = null; p.then(x => got = x);
	await done.settled();
	const before = got; t.stop("why");
	await p;
	return before === null && got === t;
});

check("sessions: empty when absent, replayed from a line", () => {
	const t = Task.replay([A]), u = Task.replay([A, { sessions: [{ id: "s1", task: "/x/" }] }]);
	return t.sessions.length === 0 && u.sessions[0].id === "s1";
});

check("source: a name is the source; an old doc path is `doc`, source undefined", () => {
	const a = Task.replay([A, { source: "servex:m1" }]), b = Task.replay([A, { source: "/framework/ai/plan.md" }]);
	return a.source === "servex:m1" && a.doc === undefined && b.source === undefined && b.doc === "/framework/ai/plan.md" && b.data.source === "/framework/ai/plan.md";
});

check("from_ref: two refs to id-less logs in one parent stay two children, named by folder", () => {
	Task.resolver = () => [{ assign: { now: "queued" } }];
	try {
		const t = Task.replay([A, { task: "/framework/mod/x/tasks/one/" }, { task: "/framework/mod/x/tasks/two/" }]);
		return t.tasks.all?.length === 2 || [...t.tasks].length === 2;
	} finally { Task.resolver = null; }
});

check("cost: computed through Task.cost_resolver, 0 without one", () => {
	const t = Task.replay([A, { path: "/p/" }]), none = t.cost;
	Task.cost_resolver = p => p === "/p/" ? 1.5 : 0;
	const got = t.cost; Task.cost_resolver = null;
	return none === 0 && got === 1.5;
});

check("complete() with no evidence is refused and says what to pass", () => {
	const t = new Task({ id: "h" }); t.start();
	const bare = t.complete(), text = t.complete("done").state, empty = t.complete({ outcome: "x", evidence: [] });
	return t.state === "running" && bare.state === "running" && text === "running" && empty.state === "running" && !t.data.completed_at;
});
check("complete() with evidence lands: confidence defaults to medium, caveats to []", () => {
	const t = new Task({ id: "h" }); t.start(); t.complete({ outcome: "built", evidence: ["abc1234"] });
	return t.state === "complete" && t.data.confidence === "medium" && t.data.caveats.length === 0 && t.data.evidence[0] === "abc1234";
});
check("complete() refuses a confidence that is not high | medium | low", () => {
	const t = new Task({ id: "h" }); t.start(); t.complete({ evidence: ["x"], confidence: "sure" });
	return t.state === "running" && Task.completion_problem({ evidence: ["x"], confidence: "high" }) === null;
});
check("replay of an old complete line with no evidence still completes; the last child completing the parent needs none", () => {
	const old = Task.replay([A, { start: {} }, { complete: { outcome: "old" } }]);
	const p = new Task({ id: "p" }); p.start(); p.tasks.set({ add: { type: "Task", id: "k" } });
	const k = p.tasks.find("k"); k.start(); k.complete(EV);
	return old.state === "complete" && p.state === "complete";
});

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} passing`);
if (passed !== results.length) process.exit(1);
