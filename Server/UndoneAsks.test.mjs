// node Server/UndoneAsks.test.mjs — UndoneAsks on a throwaway repo: the join, the three states, and the two totals agreeing.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import AskIndex from "./AskIndex.mjs";
import UndoneAsks from "./UndoneAsks.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "undone-"));
const mk = p => fs.mkdirSync(path.join(root, p), { recursive: true });
const put = (p, lines) => fs.writeFileSync(path.join(root, p), lines.map(o => JSON.stringify(o)).join("\n") + "\n");
mk("public/framework/ux/Dictate/tasks/mic-dot"); mk("public/framework/ai/doc"); mk("public/framework/ai/sessions/2026/10/14/session-aaaaaaaa");
put("public/framework/ai/doc/asks-outcomes.jsonl", []);
put("public/framework/ux/Dictate/tasks/mic-dot/task.jsonl", [{ id: "mic-dot", title: "Show a mic indicator dot on every dictation surface", module: "ux/Dictate" }, { complete: { at: "2026-10-14" } }]);

const session = "aaaaaaaa-0000-4000-8000-000000000000", at = "2026-10-14T10:00:00Z";
const idx = new AskIndex({ root });
idx.after_refine({ session, line: 7, at }, { asks: [
	{ id: "a1", text: "Show a mic indicator dot on every dictation surface", module: "ux/Dictate" },
	{ id: "a2", text: "Stream raw sentences into a three-line area", module: "ux/Dictate" },
	{ id: "a3", text: "Make the whole site faster", module: "site" }] });
mk("public/framework/ext/Refine/queue");
put("public/framework/ext/Refine/queue/asks.jsonl", ["a1", "a2", "a3"].map(id => ({ session, line: 7, at, id })));   // the prompt's own time: a folded record only has its last update
put("public/framework/ai/asks.jsonl", [
	{ ask: { at, title: "Dictate: a landed thing", words: "x", owner: "m", card: "", status: "landed" } },
	{ ask: { at, title: "Dictate: a thing still being built", words: "x", owner: "m", card: "", status: "building" } }]);
put("public/framework/ai/cards.jsonl", []);

const d = await new UndoneAsks({ root, now: Date.parse("2026-10-17T00:00:00Z") }).build();
assert.equal(d.counted, 5, "3 refined + 2 routed");
assert.equal(d.classified, 5);
assert.ok(d.agree, "the two numbers agree");
assert.deepEqual(d.totals, { done: 2, undone: 2, unroutable: 1 }, "a1 done by its complete task, a landed ledger ask; a2 + the building ask undone; a3 has no module");
const dict = d.modules.find(m => m.module === "ux/Dictate");
assert.equal(dict.asks.find(a => a.text.startsWith("Stream")).where.kind, "inbox", "an undone refined ask sits in its module inbox");
assert.equal(dict.asks.find(a => a.text.startsWith("Stream")).days, 2);
// keep_owned: a rebuild over a file holding verdicts and task links keeps both; an ask that vanished lands in `retired`
const file = path.join(root, "undone.json");
const first = JSON.parse(JSON.stringify(d)), gone = { id: "gone000001", state: "undone", text: "An ask whose prompt was edited away", verified: "undone", task: "public/framework/x/tasks/gone/" };
const stream = first.modules.find(m => m.module === "ux/Dictate").asks.find(a => a.text.startsWith("Stream"));
Object.assign(stream, { verified: "undone", verified_evidence: "looked in Dictate", verified_by: "test", task: "public/framework/ux/Dictate/tasks/stream/" });
first.modules.find(m => m.module === "ux/Dictate").asks.push(gone);
fs.writeFileSync(file, JSON.stringify(first));
const again = await new UndoneAsks({ root, now: Date.parse("2026-10-18T00:00:00Z") }).build();
const res = UndoneAsks.keep_owned(again, file);
const kept = again.modules.find(m => m.module === "ux/Dictate").asks.find(a => a.text.startsWith("Stream"));
assert.equal(kept.verified, "undone", "the verdict survives the rebuild");
assert.equal(kept.task, "public/framework/ux/Dictate/tasks/stream/", "the task link survives the rebuild");
assert.deepEqual(res, { kept: 1, retired: 1 });
assert.equal(again.retired[0].id, "gone000001", "the vanished ask is kept, not dropped");
assert.equal(again.retired[0].task, gone.task);
assert.equal(again.retired[0].retired_at, again.generated_at, "with the date it left");
assert.equal(again.retired[0].module, "ux/Dictate");
assert.equal(UndoneAsks.keep_owned(again, file).retired, 1, "a second pass keeps the retired row once");
fs.writeFileSync(file, JSON.stringify(again));
assert.equal(UndoneAsks.keep_owned(await new UndoneAsks({ root, now: Date.parse("2026-10-19T00:00:00Z") }).build(), file).retired, 1, "retired rows survive the next rebuild too");
// settle(): what became of each open ask. A task (open -> tasked, complete -> done), a found-built or not-work verdict -> closed, a note -> noted.
const sd = { counted: 5, modules: [{ module: "m", asks: [
	{ state: "undone", task: "/t/open/" }, { state: "undone", task: "/t/done/" }, { state: "undone", verified: "done" },
	{ state: "unroutable", verified: "retired" }, { state: "unroutable", note: { file: "x/readme.md" } }] }] };
const st = UndoneAsks.settle(sd, [{ url: "/t/open/", state: "open" }, { url: "/t/done/", state: "complete" }]);
assert.deepEqual(st, { done: 1, tasked: 1, closed: 2, noted: 1, undone: 0, unroutable: 0 });
assert.equal(sd.agree, true, "settling never loses an ask: the two numbers still agree");
console.log("UndoneAsks: ok");
