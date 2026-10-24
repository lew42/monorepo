/* node Servex/agents/session-state.test.mjs — a session's whole picture (2026-10-23, "session data, complete"):
 * its own cost from cache.jsonl, child sessions nested with costs, task counts, the biggest tasks. */
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "sstate-home-"));
const { session_state } = await import("./page_tools.js");
const { default: Session } = await import("../../public/framework/core/Session/Session.js");
const { default: Task } = await import("../../public/framework/core/Task/Task.js");

// The session folder: cache.jsonl as AISessionIndex writes it (an older summary, then the newest).
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sstate-session-"));
const summary = (usd, off) => JSON.stringify({ summary: { usd, usd_parts: { out: usd }, active_ms: 5000, main_models: { "claude-opus-5-5": 3 }, last_at: "t" + off, cursor: { main: { off } } }, at: "now" }) + "\n";
fs.writeFileSync(path.join(dir, "cache.jsonl"), summary(1, 10) + summary(4.004, 99));

// A tab session record: line 1 is {session}, three tasks, two child agents (one under the other).
const s = Session.replay([
	{ session: { id: "11111111-2222-3333-4444-555555555555", kind: "vscode-tab", at: "2026-10-20T00:00:00Z" } },
	{ tasks: { add: { type: "Task", id: "a", title: "A", path: "/a/" } }, at: "2026-10-20T01:00:00Z" },
	{ tasks: { add: { type: "Task", id: "b", title: "B", path: "/a/" } } },
	{ tasks: { add: { type: "Task", id: "c", title: "C" } } },
	{ a: { start: {} } },
	{ c: { stop: { why: "noise" } }, at: "2026-10-20T02:00:00Z" },
]);
s.store = { file: path.join(dir, "session.jsonl") };
Session.agents_resolver = () => [{ id: "kid", parent: null, cost: 2 }, { id: "grandkid", parent: "kid", cost: 1.5 }];
Task.cost_resolver = p => (p === "/a/" ? 3 : 0);
const st = session_state(s);
assert.deepEqual([st.cost.total, st.cost.children, st.cost.tasks], [7.5, 3.5, 3], "own $4 + children $3.5; the folder /a/ that two tasks share counted once");
assert.equal(st.cost.own.usd, 4, "the newest summary wins");
assert.equal(st.cost.own.read_to, 99, "stamped with where the transcript was read to");
assert.equal(st.cost.own.active_ms, 5000);
assert.equal(st.children.length, 1); assert.equal(st.children[0].children[0].id, "grandkid"); assert.equal(st.children[0].total, 3.5);
assert.deepEqual(st.counts.direct, { created: 3, started: 2, complete: 0, stopped: 1 });
assert.equal(st.biggest.length, 1, "one entry per folder");
assert.equal(st.span_ms, 2 * 36e5);

fs.rmSync(path.join(dir, "cache.jsonl"));
const bare = session_state(s);
assert.equal(bare.cost.own, null, "no cache yet: no own cost, never a guess");
assert.equal(bare.cost.total, 3.5);
console.log("session-state: 13 checks passed");
