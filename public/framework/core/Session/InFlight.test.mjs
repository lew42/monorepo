// InFlight.pick(session): in flight (newest first, capped), waiting on the owner, next, done. `node public/framework/core/Session/InFlight.test.mjs`
import Test from "../Test/Test.js";
import Session from "./Session.js";
import InFlight from "./InFlight.js";

const t = new Test("InFlight: pick() sorts a session's tasks into in flight, waiting, next and done");
const at = m => `2026-11-02T10:${String(m).padStart(2, "0")}:00.000Z`;
const lines = [{ session: { id: "s" } }];
for (let i = 1; i <= 7; i++){
	lines.push({ tasks: { add: { type: "Task", id: "r" + i, title: "Run " + i } }, ts: at(i) });
	lines.push({ tasks: { ["r" + i]: { start: {} } }, ts: at(i) });
}
lines.push({ tasks: { r7: { set: { now: "writing the test" } } }, ts: at(8) });
lines.push({ tasks: { add: { type: "Task", id: "w", title: "Rename" } }, ts: at(9) }, { tasks: { w: { wait: { on: "owner", what: "go on the rename" } } }, ts: at(9) });
lines.push({ tasks: { add: { type: "Task", id: "wa", title: "Other" } }, ts: at(9) }, { tasks: { wa: { wait: { on: "mastermind-x", what: "x" } } }, ts: at(9) });
lines.push({ tasks: { add: { type: "Task", id: "n1", title: "Later" } }, ts: at(10) });
lines.push({ tasks: { add: { type: "Task", id: "d", title: "Done" } }, ts: at(11) }, { tasks: { d: { start: {} } }, ts: at(11) }, { tasks: { d: { complete: { outcome: "o", evidence: ["e"] } } }, ts: at(12) });
lines.push({ tasks: { add: { type: "Task", id: "x", title: "Dropped" } }, ts: at(13) }, { tasks: { x: { stop: { why: "no" } } }, ts: at(13) });
const s = Session.replay(lines), p = InFlight.pick(s);

t.eq(p.inflight.length, 5, "at most 5 in flight");
t.eq(p.more, 2, "the rest are counted (7 running, 5 shown)");
t.eq(p.inflight[0].id, "r7", "most recently started first");
t.eq(InFlight.now_of(p.inflight[0]), "writing the test", "a task's current line is its now");
t.eq(p.waiting.map(w => w.task.id).join(), "w", "waiting on the owner only, not on another agent");
t.eq(p.waiting[0].what, "go on the rename", "the one thing needed");
t.ok(p.next.some(x => x.id === "n1"), "an idle task is next");
t.eq(p.done, 1, "done is a count");
t.ok(![...p.inflight, ...p.next].some(x => x.id === "x"), "a stopped task is nowhere");
const rows = [
	{ branch: "worktree/a", age_hours: 7, on_base: false, task: "public/framework/ai/sessions/2026/10/20/session-e00f55c9/a" },
	{ branch: "worktree/fresh", age_hours: 1, on_base: false, task: "public/framework/ai/sessions/2026/10/20/session-e00f55c9/f" },
	{ branch: "worktree/landed", age_hours: 9, on_base: true, task: "public/framework/ai/sessions/2026/10/20/session-e00f55c9/l" },
	{ branch: "worktree/other", age_hours: 9, on_base: false, task: "public/framework/ai/sessions/2026/10/20/session-aaaa/o" },
	{ branch: "worktree/nobody", age_hours: 9, on_base: false, task: null }];
t.eq(InFlight.unmerged(rows, "/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl").map(r => r.branch).join(), "worktree/a", "built, not merged: old, not landed, this session's task only");
t.eq(InFlight.unmerged(rows, "").length, 0, "no session folder, no rows");
t.done();
