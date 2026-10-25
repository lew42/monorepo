/* node Server/CloseoutWalk.test.mjs — the closeout walk (Server/CloseoutWalk.mjs): fake judge, temp session record.
 * A done verdict needs evidence that exists; a bad home falls back; duplicates need a known id; apply writes one pass and is idempotent. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import CloseoutWalk from "./CloseoutWalk.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "closeout-test-"));
fs.mkdirSync(path.join(root, "public/framework/ai"), { recursive: true });
fs.writeFileSync(path.join(root, "public/framework/ai/real.md"), "x");
const folder = path.join(root, "session"); fs.mkdirSync(folder);
const log = path.join(folder, "session.jsonl"), line = o => JSON.stringify(o) + "\n";
const add = (id, ln) => ({ tasks: { add: { type: "Task", id, title: "ask " + id, source: { session: "S", line: ln, part: id } } } });
fs.writeFileSync(log, line({ session: "S" }) + ["a", "b", "c", "d", "e"].map((id, i) => line(add(id, i < 4 ? 10 : 20))).join(""));

const answers = { 10: { verdicts: [
	{ id: "a", verdict: "done", why: "built", evidence: ["public/framework/ai/real.md", "nope/none.md"] },
	{ id: "b", verdict: "done", why: "claimed", evidence: ["nope/none.md"] },
	{ id: "c", verdict: "duplicate", why: "same as a", of: "a" },
	{ id: "d", verdict: "open", why: "later", home: "/framework/not-a-module/" } ] },
	20: { verdicts: [{ id: "e", verdict: "noise", why: "a remark" }] } };
let calls = 0;
const ask = async p => { calls++; const ln = p.includes("ask a") ? 10 : 20; return { text: JSON.stringify(answers[ln]), usd: 0.1 }; };
const T = Date.parse("2026-10-25T00:00:00Z");
const w = new CloseoutWalk("S", { located: { id: "S", folder, transcript: "none" }, root, ask, clock: () => T, parallel: 2 });
assert.equal(w.groups().length, 2);
const c = await w.run();
assert.equal(calls, 2);
assert.deepEqual([c.done, c.open, c.duplicate, c.noise], [1, 2, 1, 1]);
const by = Object.fromEntries(w.verdicts().map(v => [v.id, v]));
assert.deepEqual(by.a.evidence, ["public/framework/ai/real.md"], "only evidence that exists is kept");
assert.equal(by.b.verdict, "open", "done with no real evidence is not done");
assert.equal(by.d.home, "/framework/ai/", "an unknown home falls back");
await w.run(); assert.equal(calls, 2, "judged asks are not judged again");

assert.equal(w.apply().written, 5);
assert.equal(w.apply().written, 0, "apply is one pass");
const lines = w.lines().filter(l => l.by === "closeout-walk");
assert.ok(lines.find(l => l.tasks.a).tasks.a.complete.evidence.length === 1);
assert.ok(lines.find(l => l.tasks.d).tasks.d.wait.deferred);
assert.equal(w.groups().length, 0, "nothing idle is left");
console.log("PASS CloseoutWalk: evidence-checked done, home fallback, duplicate/noise stop, deferral with decide_by, apply once");
fs.rmSync(root, { recursive: true, force: true });
