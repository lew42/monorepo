// The one completion score (the owner, 2026-11-04): a plain method, recomputed here a second way, nested to any depth, with a child session and
// with counted owner Prompts. DOM-free. `node public/framework/core/Task/completion.test.mjs`
import Test from "../Test/Test.js";
import Task from "./Task.js";
import Session from "../Session/Session.js";

const t = new Test("Task: completion_score() is one plain method; a child session and a counted Prompt move the parent");
const at = m => `2026-11-04T10:${String(m).padStart(2, "0")}:00.000Z`;
const done = (outcome = "done") => ({ complete: { outcome, evidence: ["a test"] } });

// THE SECOND WAY: read the task tree as plain data and average it with a separate little recursion (no Task code).
const plain = n => ({ state: n.state, checked: !!n.data.checked_by, kids: [...(n._tasks ?? [])].map(plain),
	prompts: [...(n._content ?? [])].filter(c => c.counts_toward_score).map(c => ({ state: c.state, ok: c.completion_score() === 1, kids: [...(c._tasks ?? [])].map(plain) })) });
const second = p => {
	if (p.checked) return 1;
	const parts = [...p.kids.filter(k => k.state !== "stopped"), ...p.prompts];
	if (!parts.length) return p.state === "complete" ? 1 : 0;
	return parts.reduce((s, k) => s + (k.ok !== undefined ? (k.ok ? 1 : k.kids.length ? second(k) : 0) : second(k)), 0) / parts.length;
};
const same = (n, why) => t.eq(Math.round(n.completion_score() * 1e9), Math.round(second(plain(n)) * 1e9), why);

// 1. A parent session holding a child session that holds nested tasks.
const parent = Session.replay([
	{ session: { id: "p1", kind: "vscode-tab", at: at(0) } },
	{ tasks: { add: { type: "Task", id: "mine", title: "My own task" } }, ts: at(1) },
	{ tasks: { add: { type: "Session", id: "child", title: "A spawned agent" } }, ts: at(2) },
	{ tasks: { child: { tasks: { add: { type: "Task", id: "a", title: "A" } } } }, ts: at(3) },
	{ tasks: { child: { tasks: { a: { tasks: { add: { type: "Task", id: "deep", title: "Deepest" } } } } } }, ts: at(4) },
	{ tasks: { child: { tasks: { add: { type: "Task", id: "b", title: "B" } } } }, ts: at(5) },
]);
const child = parent.find("child");
t.ok(child?.is_session, "the child session is a Session inside the parent's tasks");
t.eq(parent.completion_score(), 0, "nothing finished: 0");
same(parent, "the second recomputation agrees (nothing finished)");

parent.find("deep").complete(done().complete);
const afterDeep = parent.completion_score();
t.ok(afterDeep > 0, "finishing the DEEPEST task moves the parent's number");
t.eq(afterDeep, (0 + (1 + 0) / 2) / 2, "the number is the mean of means: mine 0, child (a 1 via its deepest task, b 0) 0.5");
t.eq(parent.completion, parent.completion_score(), "`completion` is the same number as the method");
same(parent, "the second recomputation agrees (deepest done)");

parent.find("mine").complete(done().complete);
t.ok(parent.completion_score() < 1, "everything but one task (b) is done: still below 1");
t.eq(parent.completion_score(), (1 + (1 + 0) / 2) / 2, "the number is the mean of means: mine 1, child (a 1, b 0) 0.5");
parent.find("b").complete(done().complete);
t.eq(parent.completion_score(), 1, "finishing all of them is exactly 1");
same(parent, "the second recomputation agrees (all done)");
t.eq(parent.tally().created, 5, "tally: created counts child sessions and tasks at any depth");
t.eq(parent.tally().finished, 3, "tally: finished (mine, deep, b; the child session and a have not been completed themselves)");
t.eq(parent.tally().sessions, 1, "tally: one child session");

// 2. A session with ONE complete task is itself complete.
const one = Session.replay([{ session: { id: "s2" } }, { tasks: { add: { type: "Task", id: "x", title: "X" } }, ts: at(1) }, { tasks: { x: done() }, ts: at(2) }]);
t.eq(one.completion_score(), 1, "a session with one complete task is complete");

// 3. A stopped task is left out; an unproven finish is counted, not hidden.
const mix = Session.replay([{ session: { id: "s3" } },
	{ tasks: { add: { type: "Task", id: "p", title: "P" } }, ts: at(1) }, { tasks: { add: { type: "Task", id: "q", title: "Q" } }, ts: at(2) },
	{ tasks: { p: done() }, ts: at(3) }, { tasks: { q: { stop: { why: "dropped" } } }, ts: at(4) }]);
t.eq(mix.completion_score(), 1, "a stopped task leaves the mean");
t.eq(mix.tally().stopped, 1, "tally: stopped");
const bare = Session.replay([{ session: { id: "s3b" } }, { tasks: { add: { type: "Task", id: "p", title: "P" } }, ts: at(1) }, { landed_at: at(2) }, { tasks: { p: { complete: {} } }, ts: at(3) }]);
t.eq(bare.tally().unproven, bare.find("p")?.state === "complete" ? 1 : 0, "tally: a complete task with no outcome and no evidence is counted as unproven");

// 4. An owner Prompt with `counted` lowers the score until it is resolved; an old Prompt (no flag) counts nowhere.
const ps = Session.replay([{ session: { id: "s4" } },
	{ tasks: { add: { type: "Task", id: "k", title: "K" } }, ts: at(1) }, { tasks: { k: done() }, ts: at(2) },
	{ content: { add: { type: "Prompt", id: "old", text: "an old one" } }, ts: at(3) },
	{ content: { add: { type: "Prompt", id: "new1", text: "do the thing", counted: true } }, ts: at(4) }]);
t.eq(ps.completion_score(), 0.5, "one finished task + one unresolved counted prompt: 1/2");
t.eq(ps.tally().prompts.unresolved, 1, "tally: one unresolved prompt");
same(ps, "the second recomputation agrees (with a prompt)");
ps.content.find("new1").set({ no_action: "a question, answered in chat" });
t.eq(ps.completion_score(), 1, "marking the prompt no-action resolves it with nobody filing a task");
t.eq(ps.tally().prompts.unresolved, 0, "tally: none unresolved");

// 4b. The same resolution as a log line: {"<prompt id>":{"no_action":"why"}}.
const viaLine = Session.replay([{ session: { id: "s4b" } }, { content: { add: { type: "Prompt", id: "q1", text: "what is x?", counted: true } }, ts: at(1) }, { q1: { no_action: "answered in chat" }, ts: at(2) }]);
t.eq(viaLine.completion_score(), 1, "a {no_action} line on the prompt resolves it");

// 5. Resolving a counted Prompt by filing a task under it: the score follows that task.
const ps2 = Session.replay([{ session: { id: "s5" } }, { content: { add: { type: "Prompt", id: "n", text: "fix it", counted: true } }, ts: at(1) }]);
t.eq(ps2.completion_score(), 0, "an unresolved counted prompt alone: 0");
ps2.content.find("n").tasks.add({ type: "Task", id: "fix", title: "Fix it" });
t.eq(ps2.completion_score(), 0, "a task filed under it, not done: still 0");
ps2.content.find("n").find("fix").complete(done().complete);
t.eq(ps2.completion_score(), 1, "the task done: the prompt, and so the session, is 1");

// 6. HONEST SCORE (2026-11-06): a session with nothing to score is null ("needs review"), never 0 or 1; a plain leaf task keeps 1/0.
const empty = Session.replay([{ session: { id: "s6" } }]);
t.eq(empty.completion_score(), null, "a session with no tasks and no counted prompts has no score");
t.eq(empty.completion, null, "completion reads the same null");
t.eq(Task.show(empty.completion), "needs review", "Task.show: null reads \"needs review\"");
t.eq(Task.show(0.5), "50%", "Task.show: a number reads as a percent");
t.eq(Task.replay([{ assign: { id: "leaf" } }]).completion_score(), 0, "a plain leaf task keeps 0");
t.eq(Task.mean([null, null]), null, "mean of only nulls is null");
t.eq(Task.mean([null, 1, 0]), 0.5, "mean leaves null parts out");
const mix6 = Session.replay([{ session: { id: "s6b" } },
	{ tasks: { add: { type: "Session", id: "blank", title: "A child with nothing" } }, ts: at(1) },
	{ tasks: { add: { type: "Task", id: "k", title: "K" } }, ts: at(2) }, { tasks: { k: done() }, ts: at(3) }]);
t.eq(mix6.completion_score(), 1, "a null child session is left out of the parent's mean");
t.eq(mix6.tally().unscored, 1, "tally.unscored counts the child session with no score");
const allnull = Session.replay([{ session: { id: "s6c" } }, { tasks: { add: { type: "Session", id: "blank", title: "Nothing" } }, ts: at(1) }]);
t.eq(allnull.completion_score(), null, "a parent whose parts are all null is null");

t.done();
