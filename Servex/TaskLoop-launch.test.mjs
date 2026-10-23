/* node Servex/TaskLoop-launch.test.mjs — an approved task with `agent` spawns itself once (core/Task/doc/templates.md, first slice).
 * A fake servex records agents.spawn; no real agent. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-launch-test-"));
process.env.SERVEX_HOME = dir;
process.env.LEDGER_ROOT = dir;
const { default: TaskLoop } = await import("./TaskLoop.js");

const spawned = [];
const servex = {
	say(){}, monitor: { flag: null },
	agents: { registry_list: () => [{ id: "mastermind-x", state: "working" }], spawn: spec => (spawned.push(spec), { id: "minion-fake", session_id: "sess-fake" }) },
	log: { append: async () => {} },
};
const loop = new TaskLoop({ root: dir, servex });

const make = (name, lines) => {
	const d = path.join(dir, "public", "framework", "ai", "sessions", ...new Date().toISOString().slice(0, 10).split("-"), name); // today: tick only scans today and yesterday
	fs.mkdirSync(d, { recursive: true });
	const f = path.join(d, "task.jsonl"); fs.writeFileSync(f, lines.map(l => JSON.stringify(l)).join("\n") + "\n"); return f;
};
const spawn_lines = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.includes('"spawn"')).map(l => JSON.parse(l).spawn);
const head = (extra = {}) => ({ id: "t", title: "T", by: "mastermind-x", ts: "2026-10-17T10:00:00Z", template: "code", agent: { role: "minion", effort: "medium", brief: "x/requirements.md" }, ...extra });
const wait = { wait: { on: "mastermind-x", what: "plan review", at: "2026-10-17T10:01:00Z" } };
const approve = { approve: { by: "owner", at: "2026-10-17T10:02:00Z" } };

// waiting, not yet approved: nothing
const a = make("a", [head(), wait]);
assert.equal((await loop.launch(a)).ok, false);
assert.equal(spawned.length, 0, "a waiting task spawns nothing");

// approved: one spawn, one line, every value from node
fs.appendFileSync(a, JSON.stringify(approve) + "\n");
const r = await loop.launch(a);
assert.equal(r.ok, true);
assert.equal(spawned.length, 1);
assert.equal(spawned[0].role, "minion");
assert.equal(spawned[0].model, "claude-sonnet-5-5", "model filled from Task.TEMPLATES.code");
assert.equal(spawned[0].permission_mode, "bypassPermissions");
assert.equal(spawned[0].parent, "mastermind-x", "parent = line 1's by when it is a live agent");
assert.equal(spawned[0].task.brief, "x/requirements.md");
const lines = spawn_lines(a);
assert.equal(lines.length, 1);
assert.deepEqual({ ...lines[0], at: "T" }, { at: "T", agent: "minion-fake", session_id: "sess-fake", by: "TaskLoop", author: "mastermind-x", approved_by: "owner" });

// second launch: a no-op
assert.equal((await loop.launch(a)).ok, false);
assert.equal(spawned.length, 1);
assert.equal(spawn_lines(a).length, 1);

// no agent: nothing, and an old-style string agent is not a config
const b = make("b", [{ id: "b", by: "x" }, wait, approve]);
const c = make("c", [{ assign: { agent: "minion-old", requested_at: "2026-10-17T10:00:00Z" } }, wait, approve]);
await loop.launch(b); await loop.launch(c);
assert.equal(spawned.length, 1, "a task with no agent config spawns nothing");

// approved_by comes from the approve line's own author when the verb carries no `by` (the item tool stamps `by` on the line)
const e = make("e", [head(), wait, { approve: { note: "ok" }, by: "voice-app" }]);
await loop.launch(e);
assert.equal(spawn_lines(e)[0].approved_by, "voice-app", "approved_by falls back to the approve line's by");

// hot: queue, not spawn; then the tick retry spawns once it clears
const d = make("d", [head(), wait, approve]);
servex.monitor.flag = { reason: "CPU above 90%" };
const h = await loop.launch(d);
assert.equal(h.queued, true);
assert.equal(spawned.length, 2);
assert.equal(spawn_lines(d).length, 0);
assert.equal(fs.readFileSync(d, "utf8").split("\n").filter(l => l.includes('"queue"')).length, 1);
await loop.launch(d);
assert.equal(fs.readFileSync(d, "utf8").split("\n").filter(l => l.includes('"queue"')).length, 1, "queued once");
servex.monitor.flag = null;
await loop.tick();
assert.equal(spawned.length, 3, "the tick retries a queued task");
assert.equal(spawn_lines(d).length, 1);

try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
console.log("TaskLoop-launch.test.mjs: all checks passed");
process.exit(0);
