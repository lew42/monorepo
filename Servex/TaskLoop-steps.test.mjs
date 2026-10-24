/* node Servex/TaskLoop-steps.test.mjs — the Step runner's nudge (Servex/TaskLoop.js nudge_step, 2026-10-12):
 * an overdue step in the NEW sessions store gets exactly one nudge across two ticks; a live agent only; slug() reads both shapes.
 * A fake servex stands in (agents.send is a recorder); no real agent, no real git. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-steps-test-"));
process.env.SERVEX_HOME = dir;
process.env.LEDGER_ROOT = dir;   // TaskDirs reads this at import: the fixture is the repo
const { default: TaskLoop } = await import("./TaskLoop.js");

const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const t = path.join(dir, "public", "framework", "ai", "sessions", y, m, d, "session-abcd1234", "slow-task");
fs.mkdirSync(t, { recursive: true });
const file = path.join(t, "task.jsonl"), ago = min => new Date(Date.now() - min * 60000).toISOString();
fs.writeFileSync(file, JSON.stringify({ assign: { agent: "minion-x", session_id: "s1", steps: ["Slow step (5 min)", "Next (5 min)"], step: 1, heartbeat: true, requested_at: ago(30) } }) + "\n");

// tick() starts the daily jobs (follow-up, handover, undone-asks) as children with cwd = dir; on Windows a live child blocks the rm below. A fixture that has already done today's jobs starts none.
const ai = path.join(dir, "public", "framework", "ai"), today = new Date().toISOString().slice(0, 10);
fs.mkdirSync(path.join(ai, "doc"), { recursive: true }); fs.mkdirSync(path.join(ai, "asks"), { recursive: true });
fs.writeFileSync(path.join(ai, "doc", "follow-up.md"), "x");
fs.writeFileSync(path.join(ai, "handover.md"), "## NOW (computed " + today + ")\n");
fs.writeFileSync(path.join(ai, "asks", "undone.json"), JSON.stringify({ generated_at: today }));

const sent = [], logged = [];
const servex = {
	say(){}, heartbeat: { opted_in: s => s.heartbeat === true },
	agents: { registry_list: () => [{ id: "minion-x", state: "working", session_id: "s1" }], send: (id, text, note) => sent.push({ id, text, note }) },
	log: { append: async (name, rec) => logged.push({ name, rec }) },
};
const loop = new TaskLoop({ root: dir, servex, quiet_min: 9999 });

assert.equal(loop.slug(file), "slow-task", "new shape: session folder dropped");
assert.equal(loop.slug(path.join(dir, "public", "framework", "ai", "2026-10-12", "a", "b", "task.jsonl")), "a/b", "old shape keeps sub-task path");
assert.deepEqual(loop.find_task_files(), [path.resolve(file)], "found in the new store");

await loop.tick();
await loop.tick();
assert.equal(sent.length, 1, "one nudge across two ticks");
assert.equal(sent[0].id, "minion-x"); assert.equal(sent[0].note.from, "servex-step-runner");
assert.match(sent[0].text, /^You were on step 1 \(Slow step, 5 min\) since /);
assert.equal(logged.length, 1); assert.equal(logged[0].name, "steps"); assert.equal(logged[0].rec.step, 1);
assert.match(fs.readFileSync(file, "utf8"), /"nudge":1/);
assert.equal(loop.status().nudged, 1);

fs.rmSync(dir, { recursive: true, force: true });
console.log("TaskLoop-steps.test.mjs: all checks passed");
