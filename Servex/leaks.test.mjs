/* node Servex/leaks.test.mjs — leaks.mjs pairs start lines with end lines and sorts the open ones, on made-up log lines. */
import assert from "node:assert/strict";
import { pair, classify, report, close_lines } from "./leaks.mjs";

const T = s => `2026-11-06T10:${s}.000Z`, ms = s => Date.parse(T(s));
const L = (file, row) => ({ file, row });

const lines = [
	L("a.jsonl", { pid: 1, started: T("00:00"), agent: "m1", why: "bash" }),
	L("a.jsonl", { pid_exit: 1, ended: T("00:30") }),                       // pair: 1 closed
	L("a.jsonl", { pid: 2, at: T("01:00"), agent: "m1" }),                  // old field name `at`: open
	L("a.jsonl", { pid: 3, started: T("02:00"), agent: "m2" }),
	L("parent.jsonl", { pid: 3, started: T("02:00"), agent: "m2" }),        // the same line copied into a parent's log: one start, two files
	L("a.jsonl", { pid: 4, started: T("03:00") }),
	L("a.jsonl", { pid_exit: 4, at: T("03:10") }),                          // old end field `at`
	L("a.jsonl", { pid: 5, started: T("04:00") }),
	L("a.jsonl", { pid_exit: 5, ended: T("04:10") }),
	L("a.jsonl", { pid: 5, started: T("05:00") }),                          // the number came back: the second start is open, the first is closed
	L("a.jsonl", { pid: 6, started: T("06:00") }),
	L("a.jsonl", { pid_exit: 6, ended: T("05:00") }),                       // an end BEFORE the start belongs to nothing: 6 stays open
];
const { open, starts, ends } = pair(lines);
assert.deepEqual(open.map(s => s.pid).sort(), [2, 3, 5, 6], "open starts");
assert.equal(starts.length, 7, "the copied line is one start");
assert.equal(ends.length, 4);
assert.deepEqual(open.find(s => s.pid === 3).files.sort(), ["a.jsonl", "parent.jsonl"], "every log a start was copied to is remembered");
assert.equal(open.find(s => s.pid === 5).t, ms("05:00"), "the open pid 5 is the second start");
console.log("PASS  pair(): started/ended and the older `at`, copies, a reused number, an end before its start");

const alive = new Map([[2, ms("01:00") - 1000], [3, ms("02:00") + 20000], [5, ms("05:00")], [6, ms("06:00")]]);   // pid 3 was born 20 s AFTER its line: a newer process
const done = (agent) => agent === "m1" ? "agent m1 is stopped" : null;
const g = classify(open, alive, done);
assert.deepEqual(g.gone.map(s => s.pid), [3], "a number that now belongs to a newer process is gone");
assert.deepEqual(g.done.map(s => s.pid).sort(), [2], "alive, owner done");
assert.deepEqual(g.working.map(s => s.pid).sort(), [5, 6], "alive, owner working");
assert.equal(g.done[0].owner_state, "agent m1 is stopped");
assert.deepEqual(classify(open, new Map(), done).gone.length, 4, "nothing alive: all gone");
console.log("PASS  classify(): gone / alive-owner-done / alive-owner-working");

const md = report(g, { starts: starts.length, ends: ends.length });
assert.match(md, /## 1\. Gone, end missed \(1\)/); assert.match(md, /## 2\. Alive, owner done: the leaks \(1\)/); assert.match(md, /## 3\. Alive, owner working \(2\)/);
assert.equal(report({ gone: [], done: [], working: [] }, { starts: 0, ends: 0 }).match(/_none_/g).length, 3);
console.log("PASS  report(): three sections");

const boot = ms("05:30");
const closed = close_lines(g.gone.concat(open.find(s => s.pid === 6)), starts, boot);   // pid 3 (two logs) is gone; pid 6 started after the boot
assert.deepEqual(closed.map(c => c.file).sort(), ["a.jsonl", "parent.jsonl"], "one end line into every log the start is in");
assert.ok(closed.every(c => c.line.pid_exit === 3 && c.line.seen === "boot" && Date.parse(c.line.ended) === boot), "ended = the sweeping boot");
const reused = close_lines([starts.find(s => s.pid === 5 && s.t === ms("04:00"))], starts, ms("09:00"));
assert.equal(Date.parse(reused[0].line.ended), ms("05:00") - 1, "a number started again ends 1 ms before its next start");
const after = pair(lines.concat(closed.map(c => L(c.file, c.line))));
assert.ok(!after.open.some(s => s.pid === 3), "pair() counts the boot line as the end");
console.log("PASS  close_lines(): gone-at-boot ends, every log, upper-bound time, a reused number");
console.log("leaks.test: all checks pass");
