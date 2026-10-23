/* node Servex/TaskLoop-chase.test.mjs — the chase (core/Task/doc/resolution.md section 8): fake clock, temp store, fake servex.
 * A started task quiet 5 min gets one ask; three asks with no new line, then a flag; a new line resets; an accepted (idle) task is never asked. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-chase-test-"));
process.env.SERVEX_HOME = dir;
process.env.LEDGER_ROOT = dir;
const { default: TaskLoop } = await import("./TaskLoop.js");

const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const store = path.join(dir, "public", "framework", "ai", "sessions", y, m, d);
let T = Date.now();                                   // the fake clock, ms
const line = o => JSON.stringify(o) + "\n";
function make(name, lines){
	const t = path.join(store, name); fs.mkdirSync(t, { recursive: true });
	const f = path.join(t, "task.jsonl");
	fs.writeFileSync(f, lines.map(line).join(""));
	touch(f); return f;
}
const touch = f => { const x = new Date(T); fs.utimesSync(f, x, x); };   // a write "now" on the fake clock
const head = { assign: { agent: "minion-x", session_id: "s1", title: "Chase me", requested_at: new Date(T).toISOString() } };
const started = [head, { start: { at: new Date(T).toISOString() } }];

const sent = [], cards = [];
const servex = {
	say(){}, heartbeat: { opted_in: () => false },   // no opt-in: the chase must not need it
	agents: { registry_list: () => [{ id: "minion-x", state: "working", session_id: "s1" }], send: (id, text) => sent.push({ id, text }) },
	assistant: { card_reply: async c => (cards.push(c), { ok: true }) },
	log: { append: async () => {} },
};
const loop = new TaskLoop({ root: dir, servex, clock: () => T });
const min = n => { T += n * 60000; };
const about = slug => sent.filter(s => s.text.startsWith(`Task ${slug} `));
const count = (f, key) => fs.readFileSync(f, "utf8").split("\n").filter(l => l.includes(`"${key}":`) && l.includes('"log"')).length;

const run = make("run", started), idle = make("idle", [head, { approve: { by: "owner", at: new Date(T).toISOString() } }]);
const prop = make("proposed", [head, { wait: { on: "owner", what: "verdict", at: new Date(T).toISOString() } }]);

await loop.tick();
assert.equal(sent.length, 0, "fresh: nothing quiet yet");

min(6); await loop.tick();
assert.equal(about("run").length, 1, "a started task quiet 5+ min gets one ask");
assert.match(about("run")[0].text, /Chase me.*no line on your log for 6 min.*complete or stop/);
assert.equal(about("idle").length + about("proposed").length, 0, "accepted and proposed tasks are never asked");

await loop.tick();
assert.equal(about("run").length, 1, "no second ask inside the next 5 minutes");

min(5); await loop.tick(); assert.equal(about("run").length, 2, "second ask");
min(5); await loop.tick(); assert.equal(about("run").length, 3, "third ask");
assert.equal(cards.length, 0, "no flag yet");

const fresh = new TaskLoop({ root: dir, servex, clock: () => T });   // a restart reads the counts back from the log
min(5); await fresh.tick();
assert.equal(cards.length, 1, "three asks with no new line: one red flag");
assert.equal(about("run").length, 3, "flagging replaces the asks");
assert.equal(count(run, "flag"), 1);

min(30); await fresh.tick(); assert.equal(cards.length, 1, "no second flag inside the hour");
min(31); await fresh.tick(); assert.equal(cards.length, 2, "flagged again after an hour of silence");

// a new line resets the count
fs.appendFileSync(run, line({ log: { at: new Date(T).toISOString(), msg: "working on step 2" } })); touch(run);
min(6); await fresh.tick();
assert.equal(about("run").length, 4, "after a new line the asking starts again from one");
assert.equal(cards.length, 2, "and no flag");
min(5); await fresh.tick(); min(5); await fresh.tick();
assert.equal(about("run").length, 6);
assert.equal(cards.length, 2, "two asks since the reset: still no flag");

// an agent that says it is blocked is flagged at once
const blk = make("blocked", [...started, { log: { at: new Date(T).toISOString(), msg: "blocked: need the API key" } }]);
await fresh.tick();
assert.equal(cards.length, 3, "a blocked line flags without waiting for three asks");
assert.equal(about("blocked").length, 0);

// complete: left alone
fs.appendFileSync(run, line({ complete: { outcome: "done", evidence: ["x"], confidence: "high", at: new Date(T).toISOString() } })); touch(run);
const n = sent.length; min(20); await fresh.tick();
assert.equal(about("run").length, 6, "a finished task is not asked");
void n;

try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
console.log("TaskLoop-chase.test.mjs: all checks passed");
process.exit(0);
