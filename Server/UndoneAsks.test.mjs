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
console.log("UndoneAsks: ok");
