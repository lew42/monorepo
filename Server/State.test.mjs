// node Server/State.test.mjs — six planted tasks in a scratch store, every bucket, the local-day grouping, check.ok;
// then one folder broken on purpose and check.ok must turn false with the right two numbers. Doc: Server/doc/state.md
process.env.TZ = "America/Chicago";   // the day rule is the owner's local day; pinned so the test means the same anywhere
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import State from "./State.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "state-test-"));
const put = (rel, ...lines) => { const d = path.join(root, rel); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); return d; };
const S = "public/framework/ai/sessions/2026/10/17/sess-a/", M = "public/framework/mod/X/tasks/";
const now = Date.parse("2026-10-17T23:45:00-05:00");

// 1. session home, assign.landed_at (yesterday, local)
put(S + "t-landed", { assign: { session_id: "s1", title: "Landed by assign", requested_at: "2026-10-16T10:00:00-05:00" } },
	{ assign: { landed_at: "2026-10-16T20:00:00-05:00", outcome: "Done yesterday." } });
// 2. session home ending in a finish line: 03:30 UTC on the 18th is 22:30 on the 17th here, so it is TODAY (a UTC day would say tomorrow)
put(S + "t-finish", { assign: { session_id: "s1", title: "Landed by finish", requested_at: "2026-10-17T09:00:00-05:00" } },
	{ log: { at: "2026-10-17T21:00:00-05:00", msg: "working" } }, { finish: { at: "2026-10-18T03:30:00Z", outcome: "Done tonight." } });
// 3. module home ending in complete (item-tool lines: `ts`, no `at`)
put(M, { id: "tasks", path: "/framework/mod/X/tasks/", title: "X tasks" }, { task: "/framework/mod/X/tasks/t-complete/" }, { task: "/framework/mod/X/tasks/t-idle/" });
put(M + "t-complete", { id: "t-complete", path: "/framework/mod/X/tasks/t-complete/", title: "Module complete", module: "mod/X", ts: "2026-10-17T14:00:00Z" },
	{ start: {}, ts: "2026-10-17T14:05:00Z" }, { complete: {}, ts: "2026-10-17T15:00:00Z" });
// 4. an idle module task
put(M + "t-idle", { id: "t-idle", path: "/framework/mod/X/tasks/t-idle/", title: "Module idle", module: "mod/X", ts: "2026-10-17T14:00:00Z" });
// 5. in flight: a running session task a working agent holds
const flight = put(S + "t-flight", { assign: { session_id: "s1", agent: "minion-f", title: "In flight", requested_at: "2026-10-17T22:00:00-05:00" } });
// 6. stopped
put(S + "t-stopped", { assign: { session_id: "s1", title: "Stopped", requested_at: "2026-10-17T08:00:00-05:00" } }, { stop: { at: "2026-10-17T08:30:00-05:00", why: "dup" } });
// plus an old session folder that moved to a module home: counted once, there
put(S + "t-moved", { assign: { session_id: "s1", title: "Moved", landed_at: "2026-10-17T10:00:00-05:00", outcome: "x" } }, { home: "/framework/mod/X/tasks/t-complete/" });
fs.mkdirSync(path.join(root, "public/tasks"), { recursive: true });
fs.writeFileSync(path.join(root, "public/tasks/task.jsonl"), [{ id: "tasks", path: "/tasks/" }, { task: "/framework/mod/X/tasks/" }].map(l => JSON.stringify(l)).join("\n") + "\n");

const registry = [{ id: "minion-f", role: "minion", state: "working", task_dir: flight, last_at: new Date(now - 60000).toISOString() }];
const s = new State({ root, registry, now }).snapshot();
assert.equal(s.today, "2026-10-17");
assert.deepEqual(s.counts.tasks, { landed: 3, in_flight: 1, queued: 0, waiting: 0, idle: 1, stopped: 1, stale: 0 });
assert.equal(s.counts.landed_by_day["2026-10-17"], 2); assert.equal(s.counts.landed_by_day["2026-10-16"], 1);
const row = id => s.tasks.find(r => r.id.endsWith(id));
assert.equal(row("t-finish").day, "2026-10-17");                       // local day, not the UTC 18th
assert.equal(row("t-complete").landed_at, "2026-10-17T15:00:00Z");      // the line's own `ts`, never the wall clock
assert.equal(row("t-complete").home, "module"); assert.equal(row("t-complete").url, "/framework/mod/X/tasks/t-complete/");
assert.equal(row("t-flight").bucket, "in_flight"); assert.equal(s.in_flight[0].agent, "minion-f");
for (const k of ["id", "home", "dir", "url", "title", "state", "started", "landed_at", "day", "agent", "session", "module", "line"]) assert.ok(k in row("t-landed"), "row has " + k);
assert.equal(s.check.total, 6); assert.equal(s.check.sum, 6); assert.equal(s.check.aliases, 1); assert.equal(s.check.files, 7);
assert.deepEqual([s.check.landed_today.state, s.check.landed_today.walk], [2, 2]);
assert.equal(s.check.ok, true, JSON.stringify(s.check));
assert.equal(s.counts.landed, 2); assert.equal(s.landed.length, 3);   // the dashboard's window holds the week, its count is today

// Break one on purpose: a start line after the finish. Task.js refuses it (a complete task cannot start), so State counts the task landed; the plain walk reads the last state verb as start and does not.
put(S + "t-finish", { assign: { session_id: "s1", title: "Landed then restarted", requested_at: "2026-10-17T09:00:00-05:00" } },
	{ finish: { at: "2026-10-18T03:30:00Z", outcome: "Done tonight." } }, { start: { at: "2026-10-18T03:40:00Z" } });
const b = new State({ root, registry, now }).snapshot();
assert.equal(b.check.ok, false);
assert.deepEqual([b.check.landed_today.state, b.check.landed_today.walk], [2, 1]);
assert.deepEqual(b.check.landed_today.only_state, ["2026~10~17~sess-a~t-finish"]);

fs.rmSync(root, { recursive: true, force: true });
console.log("State: ok (six tasks, every bucket, local days, check.ok true; broken copy: check.ok false, 2 vs 1)");
