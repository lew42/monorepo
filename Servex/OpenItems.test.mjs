// No silent endings: a session or task closed under 100% files ONE task waiting on the owner, listing what stayed open; at 100% none;
// a doubled close or a replay files no second one; `list_waiting` (Cards.waiting) lists it. `node Servex/OpenItems.test.mjs`
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "open-items-"));
process.env.SERVEX_PUBLIC = tmp;
process.env.SERVEX_OPEN_ITEMS = "on";   // the filing is off by default; sections 1-8 test it switched on, section 9 the switch
const [{ default: Test }, { default: OpenItems }, { default: Cards }, { default: AIIndex }, { default: Task }] = await Promise.all([
	import("../public/framework/core/Test/Test.js"), import("./OpenItems.js"), import("./cards/Cards.js"), import("../Server/AIIndex.mjs"), import("../public/framework/core/Task/Task.js")]);

const t = new Test("OpenItems: a close under 100% files one waiting task; 100% files none; a repeat files nothing");
const sess = path.join(tmp, "framework", "ai", "sessions");
const make = (name, lines) => { const dir = path.join(sess, "2026", "11", "06", name), file = path.join(dir, "session.jsonl"); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, lines.map(l => JSON.stringify(l)).join("\n") + "\n"); return file; };
const append = (file, line) => { fs.appendFileSync(file, JSON.stringify(line) + "\n"); return OpenItems.after_write(file, line); };
const lines_of = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const nested = file => [...OpenItems.replay(lines_of(file))._tasks].filter(x => Task.is_closeout(x));
const at = m => `2026-11-06T10:${String(m).padStart(2, "0")}:00.000Z`;
const done = { complete: { outcome: "done", evidence: ["a test"] } };

// 1. A tab session with one open and one done task, then stopped.
const f1 = make("session-aaaa1111", [{ session: { id: "aaaa1111", kind: "vscode-tab", at: at(0) } },
	{ tasks: { add: { type: "Task", id: "open1", title: "Still open" } }, ts: at(1) },
	{ tasks: { add: { type: "Task", id: "done1", title: "Finished" } }, ts: at(2) }, { tasks: { done1: done }, ts: at(3) }]);
t.eq(append(f1, { stop: { why: "tab closed" }, ts: at(4) }), ["open-items"], "closing at 50% files exactly one task");
const mine = nested(f1);
t.eq(mine.length, 1, "one closeout task in the record");
t.eq([mine[0].state, mine[0].data.waiting_on], ["waiting", "owner"], "it waits on the owner");
t.ok(/open1/.test(mine[0].data.waiting_what) && /Still open/.test(mine[0].data.waiting_what) && !/done1/.test(mine[0].data.waiting_what), "it lists the open item (id and title), not the done one");
t.eq(OpenItems.replay(lines_of(f1)).state, "stopped", "the session stays stopped (the waiting child does not reopen it)");
t.eq(append(f1, { stop: { why: "tab closed" }, ts: at(5) }), [], "the same close again files nothing");
t.eq(nested(f1).length, 1, "still one task after the repeat");
t.eq(append(f1, { unclosed: { why: "abandoned", at: at(6) }, ts: at(6) }), [], "a replayed or later closing line files nothing for the same close");
t.eq(nested(f1).length, 1, "still one task");

// 2. A session at 100% closes with nothing filed.
const f2 = make("session-bbbb2222", [{ session: { id: "bbbb2222", kind: "vscode-tab", at: at(0) } },
	{ tasks: { add: { type: "Task", id: "only", title: "The only task" } }, ts: at(1) }, { tasks: { only: done }, ts: at(2) }]);
t.eq(append(f2, { stop: { why: "tab closed" }, ts: at(3) }), [], "closing at 100% files nothing");
t.eq(nested(f2).length, 0, "no closeout task");

// 3. A tab with nothing in it: the score is null (needs review) and there is nothing open to list, so nothing is filed.
const f3 = make("session-cccc3333", [{ session: { id: "cccc3333", kind: "vscode-tab", at: at(0) } }]);
t.eq(append(f3, { stop: { why: "abandoned" }, ts: at(1) }), [], "an empty tab closed files nothing (its score reads needs review)");
t.eq(OpenItems.replay(lines_of(f3)).completion_score(), null, "and its score is null");

// 4. A spawned agent's record (assign first) closed through closed_by, with an unfinished task inside.
const f4 = make("agent-dddd4444", [{ assign: { session_id: "dddd4444-0000-0000-0000-000000000000", agent: "minion-x", role: "minion", requested_at: at(0) }, id: "agent-dddd4444", title: "Build x" },
	{ tasks: { add: { type: "Task", id: "step", title: "Unfinished step" } }, ts: at(1) }]);
t.eq(append(f4, { assign: { closed_by: "owner", closed_at: at(2) }, at: at(2) }), ["open-items"], "an agent record closed with closed_by files one");

// 5. A nested task closed under 100% inside a record files at its own level.
const f5 = make("session-eeee5555", [{ session: { id: "eeee5555", kind: "vscode-tab", at: at(0) } },
	{ tasks: { add: { type: "Task", id: "mom", title: "Parent task" } }, ts: at(1) },
	{ tasks: { mom: { tasks: { add: { type: "Task", id: "kid", title: "Kid not done" } } } }, ts: at(2) }]);
t.eq(append(f5, { tasks: { mom: { stop: { why: "dropped" } } }, ts: at(3) }), ["mom/open-items"], "a nested parent stopped with an open kid files under itself");
t.eq(OpenItems.replay(lines_of(f5)).completion_score(), null, "the dropped parent is left out of the score and the filing does not change that");

// 6. list_waiting: the index lists the waiting task and Cards.waiting() (the function behind list_waiting) returns it.
const ai = path.join(tmp, "framework", "ai");
const snap = new AIIndex({ root: tmp, sess, framework: path.join(tmp, "framework"), index: path.join(sess, "no-index.jsonl"), registry: [], now: Date.parse(at(30)) }).snapshot();
fs.writeFileSync(path.join(ai, "index.json"), JSON.stringify(snap));
const cards = new Cards({ root: ai });
const waiting = (await cards.waiting()).filter(w => w.kind === "task");
t.eq(waiting.filter(w => /Review what stayed open/.test(w.title)).length, 3, "list_waiting lists the three closeout tasks filed above, once each (f1, f4, f5)");
t.ok(waiting.every(w => /open/.test(w.ask)), "each row says what stayed open");
const none = waiting.filter(w => /Only|Finished|The only/.test(w.title));
t.eq(none.length, 0, "nothing is listed for the session closed at 100%");

// 7. The real write path: a stop sent through the item tool (page_tools write_line) files the waiting task in the same call, and a second stop files no second.
const { run_item } = await import("./agents/page_tools.js");
const f7 = make("session-ffff6666", [{ session: { id: "ffff6666-1111-4222-8333-444455556666", kind: "vscode-tab", at: at(0) } }, { tasks: { add: { type: "Task", id: "left", title: "Left undone" } }, ts: at(1) }]);
const url7 = "/framework/ai/sessions/2026/11/06/session-ffff6666/";
let r7 = await run_item({ path: url7, delta: { stop: { why: "done for the day" } } }, { caller: "t-open-items" });
t.ok(r7.ok, "the item tool takes the stop" + (r7.ok ? "" : ": " + r7.why));
t.eq(nested(f7).length, 1, "item tool: the close filed one waiting task");
r7 = await run_item({ path: url7, delta: { stop: { why: "again" } } }, { caller: "t-open-items" });
t.eq(nested(f7).length, 1, "item tool: a second stop files no second one");
r7 = await run_item({ path: url7 }, { caller: "t-open-items" });
t.ok(JSON.stringify(r7.state).includes("Review what stayed open"), "item tool: the next read shows the waiting task (the cached root was refreshed)");

// 8. TaskLoop.close_task (and Dropped, which writes through the same write_line): closing a task record with one open and one done task files exactly one.
const { default: TaskLoop } = await import("./TaskLoop.js");
const loop = new TaskLoop({ root: sess, servex: { lifecycle: { closeout: async () => ({ ok: true, closed: [], left: [] }) } }, quiet_min: 9999 });
const f8 = make("session-gggg7777", [{ assign: { now: "x", agent: "minion-y", role: "minion", requested_at: at(0) }, id: "gggg7777", title: "Close me" },
	{ tasks: { add: { type: "Task", id: "open8", title: "Still open 8" } }, ts: at(1) },
	{ tasks: { add: { type: "Task", id: "done8", title: "Finished 8" } }, ts: at(2) }, { tasks: { done8: done }, ts: at(3) }]);
fs.renameSync(f8, path.join(path.dirname(f8), "task.jsonl"));
const r8 = await loop.close_task({ dir: "2026/11/06/session-gggg7777", by: "t-open-items", why: "dropped" });
t.ok(r8.ok, "close_task takes the dir");
const rec8 = OpenItems.replay(lines_of(path.join(path.dirname(f8), "task.jsonl")));
t.eq([...rec8._tasks].filter(x => Task.is_closeout(x)).length, 1, "close_task: one open + one done files exactly one open-items");
await loop.close_task({ dir: "2026/11/06/session-gggg7777", by: "t-open-items", why: "again" });
t.eq([...OpenItems.replay(lines_of(path.join(path.dirname(f8), "task.jsonl")))._tasks].filter(x => Task.is_closeout(x)).length, 1, "close_task: a second close files no second one");

// 9. The switch: off (the default) a close files nothing but after_write still says what it WOULD file; on, it files one. The dry run lists the same node.
const f9 = make("session-hhhh8888", [{ session: { id: "hhhh8888", kind: "vscode-tab", at: at(0) } }, { tasks: { add: { type: "Task", id: "left9", title: "Left 9" } }, ts: at(1) }]);
const dry = await import("./OpenItems.mjs");
const before9 = fs.readFileSync(f9, "utf8");
delete process.env.SERVEX_OPEN_ITEMS;
t.eq(OpenItems.on, false, "unset: the filing is off");
t.eq(append(f9, { stop: { why: "tab closed" }, ts: at(2) }), ["open-items"], "off: after_write returns what it WOULD file");
t.eq(nested(f9).length, 0, "off: nothing was written (no closeout task in the record)");
t.eq(fs.readFileSync(f9, "utf8"), before9 + JSON.stringify({ stop: { why: "tab closed" }, ts: at(2) }) + "\n", "off: the record holds only the close line that was appended");
const rep = dry.dry_run([f9], tmp);
t.eq([rep.records, rep.would_file, rep.list[0]?.id], [1, 1, "open-items"], "the dry run reports the same filing and writes nothing");
t.eq(nested(f9).length, 0, "the dry run wrote nothing");
process.env.SERVEX_OPEN_ITEMS = "on";
t.eq(OpenItems.after_write(f9, { stop: { why: "tab closed" }, ts: at(3) }), ["open-items"], "on: the same close files one");
t.eq(nested(f9).length, 1, "on: the closeout task is in the record");

t.done();
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(t.failures.length ? 1 : 0);
