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

// The landing line (one rule): finish text keys, then the last log msg, then the brief heading, then the plain no-summary sentence.
put(S + "t-key", { assign: { session_id: "s1", title: "Key", requested_at: "2026-10-17T09:00:00-05:00" } }, { finish: { at: "2026-10-17T10:00:00-05:00", merged: "Merged the fix. More." } });
put(S + "t-log", { assign: { session_id: "s1", title: "Log", requested_at: "2026-10-17T09:00:00-05:00" } }, { log: { at: "2026-10-17T09:30:00-05:00", msg: "last words" } }, { finish: { at: "2026-10-17T10:00:00-05:00" } });
const hd = put(S + "t-head", { assign: { session_id: "s1", title: "Head", requested_at: "2026-10-17T09:00:00-05:00" } }, { finish: { at: "2026-10-17T10:00:00-05:00" } });
fs.writeFileSync(path.join(hd, "requirements.md"), "# The brief heading\n\nbody\n");
put(S + "t-bare", { assign: { session_id: "s1", title: "Bare", requested_at: "2026-10-17T09:00:00-05:00" } }, { complete: {} });
const c = new State({ root, registry, now }).snapshot(), crow = id => c.tasks.find(r => r.id.endsWith(id));
assert.equal(crow("t-key").line, "Merged the fix."); assert.equal(crow("t-log").line, "last words");
assert.equal(crow("t-head").line, "The brief heading"); assert.equal(crow("t-bare").line, State.NO_SUMMARY);

// Cards and asks: the same row, each counted two ways (a fold, a text scan). A later line for an id wins.
const ai = path.join(root, "public/framework/ai"); fs.mkdirSync(ai, { recursive: true });
const jl = (file, lines) => fs.writeFileSync(path.join(ai, file), lines.map(l => typeof l === "string" ? l : JSON.stringify(l)).join("\n") + "\n");
const card = (id, status, extra = {}) => ({ id, title: "Card " + id, type: "card", status, created: "2026-10-17T09:00:00-05:00", last: "2026-10-17T10:00:00-05:00", ...extra });
jl("cards.jsonl", [card("2026/10/17/a", "open"), card("2026/10/17/a", "working", { last: "2026-10-17T11:00:00-05:00" }), card("2026/10/16/b", "done"), card("2026/10/17/c", "archived"),
	card("2026/10/17/d", "open", { owner_note: { kind: "needs-you", text: "Pick one.", by: "agent-x" } }), card("2026/10/17/e", "open", { owner_note: { kind: "decision", text: "Fyi." } })]);
jl("asks.jsonl", [{ ask: { at: "2026-10-17T09:00:00-05:00", title: "First ask", owner: "m1", card: "2026/10/17/a", status: "routed" } },
	{ ask: { id: "first-ask", status: "landed", at: "2026-10-17T12:00:00-05:00" } },
	{ ask: { at: "2026-10-17T09:00:00-05:00", id: "named", title: "Named ask", status: "parked" } },
	{ ask: { at: "2026-10-17T09:30:00-05:00", title: "Quiet ask", status: "routed" } }, { ask: { id: "never-routed", status: "landed" } }]);
const d = new State({ root, registry, now }).snapshot(), by = id => d.cards.find(r => r.id.endsWith(id));
assert.equal(d.cards.length, 5);                                         // six lines, five ids
assert.equal(by("/a").bucket, "working"); assert.equal(by("/b").bucket, "done"); assert.equal(by("/c").bucket, "archived");
assert.equal(by("/d").bucket, "needs"); assert.equal(by("/d").needs, true); assert.equal(by("/e").bucket, "open"); assert.equal(by("/e").needs, false);   // a decision FYI never waits
assert.equal(by("/a").day, "2026-10-17"); assert.equal(by("/a").url, "/framework/ai/2026/10/17/a/"); assert.equal(by("/a").kind, "card");
assert.deepEqual([d.check.cards.rows, d.check.cards.sum, d.check.cards.ids, d.check.cards.ok], [5, 5, 5, true]);
assert.equal(d.asks.length, 3);                                          // the never-routed update is no ask
const ask = id => d.asks.find(r => r.id === "ask:" + id);
assert.equal(ask("first-ask").bucket, "done"); assert.equal(ask("named").bucket, "waiting"); assert.equal(ask("named").needs, true); assert.equal(ask("quiet-ask").bucket, "queued");
assert.equal(ask("first-ask").when, "2026-10-17T12:00:00-05:00"); assert.equal(ask("first-ask").url, "/framework/ai/2026/10/17/a/");
assert.deepEqual([d.check.asks.rows, d.check.asks.sum, d.check.asks.ids, d.check.asks.ok], [3, 3, 3, true]);
assert.deepEqual([d.check.sessions.in_sessions, d.check.sessions.with_session, d.check.sessions.ok], [d.check.sessions.with_session, d.check.sessions.with_session, true]);
assert.equal(d.sessions.find(x => x.id === "s1").title != null, true);
assert.equal(State.sig(d) !== State.sig(s), true);                       // new cards and asks move the signature
assert.equal("cards" in State.stream_line(d), false);                    // the stream line stays small: counts and the check only
// Break the card count on purpose: an `id` that is not first on its line parses fine but the text scan misses it.
jl("cards.jsonl", [card("2026/10/17/a", "open"), `{"title":"Odd","id":"2026/10/17/odd","status":"open","last":"2026-10-17T10:00:00-05:00"}`]);
const e = new State({ root, registry, now }).snapshot();
assert.equal(e.check.ok, false); assert.deepEqual([e.check.cards.rows, e.check.cards.ids, e.check.cards.ok], [2, 1, false]); assert.equal(e.check.asks.ok, true);

fs.rmSync(root, { recursive: true, force: true });
console.log("State: ok (six tasks, every bucket, local days, check.ok true; broken copy: check.ok false, 2 vs 1; cards 5 = 5 = 5, asks 3 = 3 = 3, broken cards 2 vs 1)");
