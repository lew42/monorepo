// node Server/TaskState.test.mjs — the grouping and the quiet mark, on a fake registry.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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

// waiting group: one task waiting on the owner, one on an agent, one approved (today's folder under a temp sessions store)
const sess = fs.mkdtempSync(path.join(os.tmpdir(), "taskstate-test-")), n = new Date(now), p2 = x => String(x).padStart(2, "0");
const day = path.join(sess, String(n.getFullYear()), p2(n.getMonth() + 1), p2(n.getDate()));
const put = (name, ...lines) => { fs.mkdirSync(path.join(day, name), { recursive: true }); fs.writeFileSync(path.join(day, name, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
put("w-owner", { assign: { title: "Pick a name" } }, { wait: { on: "owner", what: "a name", at: at(30) } });
put("w-agent", { assign: { title: "Review" } }, { wait: { on: "minion-y", what: "x", at: at(30) } });
put("w-done", { assign: { title: "Done" } }, { wait: { on: "owner", at: at(30) } }, { approve: { by: "owner", at: at(20) } });
const w = new TaskState({ registry: [], now, sess }).snapshot();
assert.deepEqual(w.waiting.map(r => r.title), ["Pick a name"]);
assert.equal(w.waiting[0].waiting_on, "owner"); assert.equal(w.waiting[0].since, at(30));
assert.match(w.waiting[0].url, /\/w-owner\/$/); assert.equal(w.counts.waiting, 1);
assert.notEqual(TaskState.sig(w), TaskState.sig({ ...w, waiting: [] }));
fs.rmSync(sess, { recursive: true, force: true });
console.log("TaskState: ok");
