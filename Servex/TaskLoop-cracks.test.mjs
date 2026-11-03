/* node Servex/TaskLoop-cracks.test.mjs — cracks rows 1 and 5 (core/Task/doc/cracks.md): temp store, fake clock, fake servex.
 * Row 1: a live agent gets its unread inbox lines once (marked read); a stopped agent's inbox makes ONE card; lines over 7 days old are marked read, not delivered.
 * Row 5: a task waiting on an agent gets one reminder per interval, a flag after 3. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-cracks-test-"));
process.env.SERVEX_HOME = dir;
process.env.LEDGER_ROOT = dir;
const { default: TaskLoop } = await import("./TaskLoop.js");

const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const store = path.join(dir, "public", "framework", "ai", "sessions", y, m, d);
let T = Date.now();
const iso = ms => new Date(ms).toISOString();
const line = o => JSON.stringify(o) + "\n";
const head = (agent, extra = {}) => ({ assign: { agent, session_id: "s-" + agent, title: "T " + agent, requested_at: iso(T), ...extra } });
function make(name, lines){
	const t = path.join(store, name); fs.mkdirSync(t, { recursive: true });
	fs.writeFileSync(path.join(t, "task.jsonl"), lines.map(line).join(""));
	return t;
}
const sent = [], cards = [];
const rows = [{ id: "live-a", state: "working", session_id: "s-live-a" }, { id: "dead-b", state: "stopped", session_id: "s-dead-b" }, { id: "helper-h", state: "working", session_id: "s-helper-h" }];
const servex = {
	say(){}, heartbeat: { opted_in: () => false },
	agents: { registry_list: () => rows, send: (id, text) => sent.push({ id, text }) },
	assistant: { card_reply: async c => (cards.push(c), { ok: true }) },
	log: { append: async () => {} },
};
const loop = new TaskLoop({ root: dir, servex, clock: () => T });
const min = n => { T += n * 60000; };
const reads = t => fs.readFileSync(path.join(t, "inbox.jsonl"), "utf8").split("\n").filter(Boolean).map(JSON.parse);

/* row 1 */
const live = make("live", [head("live-a"), { start: { at: iso(T) } }]);
const dead = make("dead", [head("dead-b"), { start: { at: iso(T) } }]);
const old = make("old", [head("live-a"), { start: { at: iso(T) } }]);
fs.writeFileSync(path.join(live, "inbox.jsonl"), line({ at: iso(T), from: "kid", kind: "result", text: "done one" }) + line({ at: iso(T), from: "kid2", kind: "result", text: "done two" }));
fs.writeFileSync(path.join(dead, "inbox.jsonl"), line({ at: iso(T), from: "kid", kind: "result", text: "lost" }));
fs.writeFileSync(path.join(old, "inbox.jsonl"), line({ at: iso(T - 9 * 864e5), from: "kid", kind: "result", text: "ancient" }));

await loop.tick();
const inboxMsgs = () => sent.filter(s => s.text.startsWith("Unread lines"));
assert.equal(inboxMsgs().length, 1, "a live agent gets ONE message for its unread lines");
assert.equal(inboxMsgs()[0].id, "live-a");
assert.match(inboxMsgs()[0].text, /done one[\s\S]*done two/);
assert.ok(!sent.some(s => /ancient/.test(s.text)), "a backlog over 7 days is never delivered");
assert.ok(reads(live).at(-1).read_upto === 2, "marked read: a read_upto line");
assert.match(reads(old).at(-1).note, /older than 7 days/, "stale backlog marked read with a note");
assert.equal(cards.filter(c => /lost|unread/.test(c.text)).length, 1, "a stopped agent's inbox makes one card");

await loop.tick(); min(5); await loop.tick();
assert.equal(inboxMsgs().length, 1, "read lines are not delivered again");
assert.equal(cards.filter(c => /unread/.test(c.text)).length, 1, "and the card is not repeated per tick");
fs.appendFileSync(path.join(live, "inbox.jsonl"), line({ at: iso(T), from: "kid3", kind: "result", text: "done three" }));
await loop.tick();
assert.equal(inboxMsgs().length, 2); assert.doesNotMatch(inboxMsgs()[1].text, /done one/, "only the new line");

/* row 5 */
const w = make("waiter", [head("live-a"), { start: { at: iso(T) } }, { wait: { on: "helper-h", what: "the schema", at: iso(T) } }]);
const wsent = () => sent.filter(s => /is waiting on you for the schema/.test(s.text));
const f = path.join(w, "task.jsonl");
const nflag = () => cards.filter(c => /reminders on helper-h/.test(c.text)).length;
await loop.tick(); assert.equal(wsent().length, 0, "not before the interval");
min(121); await loop.tick(); assert.equal(wsent().length, 1); assert.equal(wsent()[0].id, "helper-h", "reminder goes to the agent waited on");
await loop.tick(); assert.equal(wsent().length, 1, "one per interval");
min(121); await loop.tick(); assert.equal(wsent().length, 2);
min(121); await loop.tick(); assert.equal(wsent().length, 3); assert.equal(nflag(), 0);
min(121); await loop.tick(); assert.equal(wsent().length, 3, "after 3 reminders: no fourth"); assert.equal(nflag(), 1, "a flag");
min(121); await loop.tick(); assert.equal(nflag(), 1, "flagged once");
assert.ok(fs.readFileSync(f, "utf8").includes('"flag":true'));

/* waiting on a task path -> that task's agent */
const target = make("target", [head("helper-h"), { start: { at: iso(T) } }]);
make("waiter2", [head("live-a"), { start: { at: iso(T) } }, { wait: { on: path.relative(dir, target).split(path.sep).join("/"), what: "its output", at: iso(T) } }]);
min(121); await loop.tick();
assert.ok(sent.some(s => s.id === "helper-h" && /for its output/.test(s.text)), "a task path resolves to that task's agent");

try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
console.log("TaskLoop-cracks.test.mjs: all checks passed");
process.exit(0);
