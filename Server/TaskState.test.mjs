// node Server/TaskState.test.mjs — the grouping and the quiet mark, on a fake registry.
import assert from "node:assert/strict";
import TaskState from "./TaskState.mjs";
const now = Date.parse("2026-10-14T20:00:00-05:00"), at = m => new Date(now - m * 60000).toISOString();
const reg = [
	{ id: "a", role: "task-mastermind", name: "a", state: "working", last_at: at(1) },
	{ id: "b", role: "task-mastermind", name: "b", state: "working", last_at: at(9) },
	{ id: "c", role: "task-mastermind", name: "c", state: "queued" },
	{ id: "d", role: "task-mastermind", name: "d", state: "stopped" },
];
const s = new TaskState({ registry: reg, now, sess: "/nonexistent" }).snapshot();
assert.deepEqual(s.in_flight.map(r => r.agent), ["b", "a"]);   // quiet first
assert.equal(s.in_flight[0].quiet, true); assert.equal(s.in_flight[1].quiet, false);
assert.deepEqual(s.queued.map(r => r.agent), ["c"]);
assert.equal(TaskState.first_sentence("**Done.** More text"), "Done.");
assert.equal(TaskState.id("C:/x/ai/sessions/2026/10/14/s/t"), "2026~10~14~s~t");
console.log("TaskState: ok");
