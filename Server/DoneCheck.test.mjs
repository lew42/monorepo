/* node Server/DoneCheck.test.mjs — DoneCheck with a fake Haiku: a completed owner ask is sent, a not-done verdict or a missing evidence path is
 * flagged once in the log that holds the task, a second run sends nothing. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import DoneCheck from "./DoneCheck.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "donecheck-test-"));
const [y, m, d] = new Date().toISOString().slice(0, 10).split("-");
const dir = path.join(root, "public/framework/ai/sessions", y, m, d, "session-dddd4444");
fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.join(root, "public/framework/core/Task"), { recursive: true });
fs.writeFileSync(path.join(root, "public/framework/core/Task/real.md"), "x");
const src = (n) => ({ session: "s", line: n, part: "a" });
const add = (id, title, o, e) => ({ tasks: { add: { type: "Task", id, title, source: src(id), state: "idle" } } });
const done = (id, outcome, evidence) => ({ tasks: { [id]: { complete: { outcome, evidence, confidence: "high" } } } });
const L = [{ assign: { agent: "x", title: "S" } }, { start: {} }, add("a", "Add a reopen button"), add("b", "Show the stop rate"), add("c", "Name the module"),
	done("a", "reopen button added", ["/framework/core/Task/real.md"]), done("b", "wrote a note about rates", ["/framework/core/Task/real.md"]), done("c", "named it", ["/framework/core/Task/missing.md"])];
const file = path.join(dir, "session.jsonl"); fs.writeFileSync(file, L.map(l => JSON.stringify(l)).join("\n") + "\n");
let calls = 0;
const ask = async prompt => { calls++; const items = JSON.parse(prompt); return { usd: 0.01, text: JSON.stringify({ verdicts: items.map(i => ({ n: i.n, verdict: i.ask.startsWith("Show") ? "not-done" : "ok", why: "only a note" })) }) }; };
const dc = new DoneCheck({ root, ask });
assert.equal(dc.todo().length, 3);
const r = await dc.run();
assert.equal(calls, 1); assert.equal(r.flagged, 2, "b (not-done) and c (missing evidence)");
const flagged = JSON.parse(fs.readFileSync(dc.out, "utf8")).flagged.map(f => f.id).sort();
assert.deepEqual(flagged, ["b", "c"]);
const marks = () => fs.readFileSync(file, "utf8").split("\n").filter(l => l.includes('"done_check"')).length;
assert.equal(marks(), 2);
assert.equal((await new DoneCheck({ root, ask }).run()).asks, 0, "a second run sends nothing");
assert.equal(calls, 1); assert.equal(marks(), 2);
console.log("PASS DoneCheck: 3 sent in one call, not-done and missing evidence flagged once each, rerun is free");
fs.rmSync(root, { recursive: true, force: true });
