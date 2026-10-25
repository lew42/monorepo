// node public/framework/ai/AISession/SessionTimeline.test.mjs — the Timeline's rows: one per record line, one per prompt, one per landed child,
// counted here by hand, in time order, newest last. The page draws these same rows (data-total), so the two counts must agree.
import assert from "node:assert/strict";
import Rows from "./SessionTimelineRows.js";

const at = m => `2026-10-20T20:${String(m).padStart(2, "0")}:00.000Z`;

// session.jsonl: one of each line shape the real records hold (13 lines)
const record = [
	{ session: { kind: "voice" }, at: at(0) },
	{ tasks: { add: [{ id: "t1", title: "Build the tab" }, { id: "t2", title: "Write the test" }] }, at: at(1) },
	{ task: "/framework/ai/x/child-a/", as: "child-a", type: "Session", spawn: { role: "minion", model: "sonnet" }, at: at(2) },
	{ sessions: ["child-b", "child-c"], at: at(3) },
	{ log: "step one done", at: at(4) },
	{ tag: "timeline", at: at(5) },
	{ note: "a note", at: at(6) },
	{ decision: { decision: "use a Tail", why: "no second fetch" }, at: at(7) },
	{ review: { size: "full", verdict: "ok", findings: [{ n: 1 }, { n: 2 }] }, at: at(8) },
	{ tasks: { t1: { complete: "built" }, t2: { complete: "tested" } }, at: at(9) },   // two tasks done in ONE line: one row
	{ commit: { hash: "0123456789abcdef", what: "the tab" }, at: at(10) },
	{ stop: { why: "waiting" }, at: at(11) },
	{ log: "a line with no time of its own" },
];
// prompts.jsonl: 3 prompts (several stages each), one of them out of order in time
const prompts = [
	{ prompt: "p1", stage: "raw", text: "first words", at: at(1) },
	{ prompt: "p1", stage: "refined", cards: [], subject: "First subject", at: at(1) },
	{ prompt: "p2", stage: "raw", text: "second words", at: at(5) },
	{ prompt: "p3", stage: "raw", text: "third words", at: at(0) },
];
const landed = [{ id: "child-a", name: "child-a", at: at(10) }];

const rows = Rows.rows(record, prompts, landed);

// the independent count: record lines + distinct prompt ids + landed children
const expected = record.length + new Set(prompts.map(p => p.prompt)).size + landed.length;
assert.equal(expected, 17);
assert.equal(rows.length, expected, "rows drawn with every filter on = lines + prompts + landed");

// time order, oldest first, ties by their original order; the untimed line takes the time of the line before it
for (let i = 1; i < rows.length; i++) assert.ok(rows[i].at >= rows[i - 1].at, "row " + i + " is not before row " + (i - 1));
const untimed = rows.find(r => r.text === "a line with no time of its own");
assert.equal(untimed.at, Date.parse(at(11)));

// the shapes
const kinds = k => rows.filter(r => r.kind === k);
assert.equal(kinds("prompt").length, 3);
assert.equal(kinds("prompt").find(r => r.raw === "first words").text, "First subject");
assert.equal(kinds("done").length, 1, "two tasks completed in one line are one row");
assert.match(kinds("done")[0].text, /2 tasks done/);
assert.equal(kinds("task").length, 1);
assert.match(kinds("task")[0].text, /2 tasks added/);
assert.equal(kinds("child").length, 2);
assert.deepEqual(kinds("child").find(r => r.children.length === 2).children, ["child-b", "child-c"]);
assert.equal(kinds("landed").length, 1);
assert.equal(kinds("note").length, 1);
assert.equal(kinds("decision").length, 1);
assert.equal(kinds("review").length, 1);
assert.match(kinds("review")[0].text, /2 findings/);
assert.equal(kinds("commit").length, 1);
assert.equal(kinds("session").length, 2, "session started + stopped");
assert.equal(kinds("log").length, 2);
assert.equal(kinds("tag").length, 1);

// nothing recorded: no rows, no crash; prompts alone still make rows
assert.equal(Rows.rows([], [], []).length, 0);
assert.equal(Rows.rows([], prompts, []).length, 3);

// the default filter hides log and tag lines
assert.deepEqual(Rows.HIDDEN, ["log", "tag"]);
assert.equal(rows.filter(r => !Rows.HIDDEN.includes(r.kind)).length, expected - 3);

// landed_of: only children whose snapshot says landed
const kids = [{ id: "a", name: "a", snap: { state: "complete", last_activity: at(3) } }, { id: "b", name: "b", snap: { state: "running" } }, { id: "c", name: "c", snap: null }, { id: "d", name: "d", snap: { closed: true, first_at: at(4) } }];
assert.deepEqual(Rows.landed_of(kids).map(k => k.id), ["a", "d"]);

console.log("SessionTimeline.test.mjs ok: " + rows.length + " rows = " + record.length + " lines + 3 prompts + " + landed.length + " landed");
