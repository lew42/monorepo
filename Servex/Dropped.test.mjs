/* node Servex/Dropped.test.mjs — the red flag for dropped work (Servex/Dropped.js): temp store, fake clock, fake registry.
 * An open task is flagged once (one line in its parent's log) when its owner is stopped, gone, dormant or never assigned; a working owner,
 * a queued task, a recent log, a settled task and an owner wait are not; a deferral with no home or past decide_by is. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Dropped from "./Dropped.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dropped-test-"));
const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const session = path.join(root, "public", "framework", "ai", "sessions", y, m, d, "session-aaaa1111");
let T = Date.now();
const iso = ms => new Date(ms).toISOString(), line = o => JSON.stringify(o) + "\n";
const head = (agent, extra = {}) => ({ assign: { agent, session_id: agent && "s-" + agent, title: "T " + (agent ?? "nobody"), requested_at: iso(T), ...extra } });
function make(name, lines, age_min = 120){
	const dir = path.join(session, name); fs.mkdirSync(dir, { recursive: true });
	const file = path.join(dir, "session.jsonl"); fs.writeFileSync(file, lines.map(line).join(""));
	const t = new Date(T - age_min * 60000); fs.utimesSync(file, t, t);
	return dir;
}
fs.mkdirSync(session, { recursive: true });
fs.writeFileSync(path.join(session, "session.jsonl"), line({ assign: { agent: "parent-p", title: "parent" } }) + line({ start: {} }));

const rows = ["working", "dormant", "stopped"].map(s => ({ id: "a-" + s, state: s, session_id: "s-a-" + s }));
make("works", [head("a-working"), { start: {} }]);
make("sleeps", [head("a-dormant"), { start: {} }]);
make("dead", [head("a-stopped"), { start: {} }]);
make("gone", [head("a-vanished"), { start: {} }]);
make("nobody", [head(null), { start: {} }]);
make("fresh", [head("a-stopped"), { start: {} }], 5);
make("queued", [head(null), { wait: { on: "owner" } }, { approve: {} }, { priority: 3 }]);
make("done", [head("a-stopped"), { start: {} }, { complete: { evidence: ["x"], outcome: "y" } }]);
make("owner-wait", [head("a-stopped"), { start: {} }, { wait: { on: "owner", what: "a key" } }]);
make("defer-ok", [head("a-working"), { start: {} }, { wait: { on: "core/Task", what: "after the merge", decide_by: iso(T + 864e5), deferred: true } }]);
make("defer-homeless", [head("a-working"), { start: {} }, { wait: { what: "later", deferred: true } }]);
make("defer-late", [head("a-working"), { start: {} }, { wait: { on: "core/Task", what: "after the merge", decide_by: iso(T - 3600e3), deferred: true } }]);

const written = [];
const dropped = new Dropped({ root, clock: () => T, write: async (f, o) => { written.push({ f, o }); fs.appendFileSync(f, line(o)); } });
const r1 = await dropped.tick(rows, T);
const by = Object.fromEntries(r1.rows.map(r => [path.basename(r.url.replace(/\/$/, "")), r.code]));
assert.deepEqual(by, { sleeps: "owner-dormant", dead: "owner-stopped", gone: "owner-gone", nobody: "never-assigned", "defer-homeless": "deferral-no-home", "defer-late": "deferral-overdue" });
assert.equal(r1.queued, 1, "the prioritised idle task is queued, not dropped");
assert.equal(r1.flagged, 6, "one parent line per dropped task");
assert.ok(written.every(w => w.f === path.join(session, "session.jsonl") && w.o.log.dropped && w.o.log.reason));
const snap = JSON.parse(fs.readFileSync(path.join(root, "public/framework/ai/queue/dropped.json"), "utf8"));
assert.equal(snap.dropped, 6);

const r2 = await dropped.tick(rows, T + 60000);
assert.equal(r2.flagged, 0, "a second tick writes nothing new");

rows.find(r => r.id === "a-stopped").state = "working";
const r3 = await dropped.tick(rows, T + 120000);
assert.equal(r3.rows.find(r => r.code === "owner-stopped"), undefined, "a revived owner clears the flag");
// a tab session (no assign): 6 filed owner asks, 2 stopped = 33% > 20% -> red-flagged once in its own log; 1 of 6 stopped (17%) is not
const tab = (name, stopped) => { const dir = path.join(root, "public", "framework", "ai", "sessions", y, m, d, name); fs.mkdirSync(dir, { recursive: true });
	const ids = "abcdef".split(""); fs.writeFileSync(path.join(dir, "session.jsonl"), line({ session: name }) + ids.map(id => line({ tasks: { add: { type: "Task", id, title: id, source: { session: name, line: 1, part: id } } } })).join("") + ids.slice(0, stopped).map(id => line({ tasks: { [id]: { stop: { note: "noise" } } } })).join(""));
	return path.join(dir, "session.jsonl"); };
const red_file = tab("session-bbbb2222", 2), calm_file = tab("session-cccc3333", 1);
const r4 = await dropped.tick(rows, T + 180000);
const red_lines = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.includes('"red":"rate"')).length;
assert.deepEqual(r4.red.map(r => path.basename(r.url.replace(/\/$/, ""))), ["session-bbbb2222"]);
assert.equal(r4.red[0].rates.owner.rate, 0.333);
assert.equal(red_lines(red_file), 1);
assert.equal(red_lines(calm_file), 0);
await dropped.tick(rows, T + 240000);
assert.equal(red_lines(red_file), 1, "flagged once, not every tick");
console.log("PASS Dropped: 6 flagged once, queued/working/fresh/settled/owner-wait left alone, revived owner clears, a session over 20% stopped is red-flagged once");
fs.rmSync(root, { recursive: true, force: true });
