// node Server/UndoneToTasks.test.mjs — UndoneToTasks.plan() on a throwaway repo: only verified-undone asks, folding, dedupe, title, priority.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import UndoneToTasks from "./UndoneToTasks.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "u2t-"));
const put = (p, t) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), t); };
for (const m of ["ux/Dictate", "ai", "ai/sessions"]) put(`public/framework/${m}/readme.md`, "# x\n");
const ask = (id, text, extra = {}) => ({ id, kind: "refined", state: "undone", verified: "undone", verified_evidence: "grep: nothing", text, days: 2, source: "/s#" + id, where: {}, ...extra });
put(UndoneToTasks.DATA, JSON.stringify({ modules: [
	{ module: "ux/Dictate", asks: [
		ask("a1", "Save every raw Whisper reply so the transcript can be audited later. More words follow here."),
		ask("a2", "Place each spoken sentence in the right paragraph of the chat bubble", { days: 9 }),
		ask("a3", "Already done thing", { verified: "done" }),
		ask("a4", "Not sure about this one", { verified: "unclear" }),
		ask("a5", "Wait for the owner", { kind: "routed", status: "stalled", days: 9 }),
		ask("a6", "A very long sentence that goes on and on about nothing in particular so that the title must be cut at a word boundary somewhere")] },
	{ module: "ai/sessions", asks: [ask("b1", "Rename the session log everywhere it is mentioned")] },
	{ module: "(no module folder)", asks: [ask("c1", "Nobody owns this")] },
	{ module: "ux/Gone", asks: [ask("d1", "Module folder does not exist")] }] }));
// an existing task in ux/Dictate with the same ask id, and one with a near-identical title
put("public/framework/ux/Dictate/tasks/x/task.jsonl", JSON.stringify({ id: "x", title: "Place each spoken sentence in the right paragraph of the chat bubble", ask: "zzz" }) + "\n");
put("public/framework/ux/Dictate/tasks/y/task.jsonl", JSON.stringify({ id: "y", title: "Whatever", ask: "a5" }) + "\n");

const u = new UndoneToTasks({ root }), p = u.plan();
const ids = p.create.map(t => t.ask).sort();
assert.deepEqual(ids, ["a1", "a6", "b1"], "only verified-undone asks with a module folder, minus tracked ones");
assert.deepEqual(p.tracked.map(t => [t.ask.id, t.by.split(" ")[0]]).sort(), [["a2", "title"], ["a5", "ask"]], "tracked by title overlap and by ask id");
assert.deepEqual(p.no_module.map(a => a.id).sort(), ["c1", "d1"], "no module folder -> counted, not created");
assert.equal(p.create.find(t => t.ask === "b1").module, "ai", "ai/sessions folds into the ai home");
assert.equal(p.create.find(t => t.ask === "a1").title, "Save every raw Whisper reply so the transcript can be audited later");
assert.ok(p.create.find(t => t.ask === "a6").title.length <= UndoneToTasks.MAX_TITLE && !p.create.find(t => t.ask === "a6").title.endsWith("…"), "a long title is cut at a clause break, whole, with no ellipsis");
assert.equal(UndoneToTasks.title("A very long sentence that goes on and on about nothing in particular so that the title must be cut at a word boundary somewhere"), "A very long sentence that goes on and on about nothing in particular");
assert.ok(UndoneToTasks.title("x".repeat(30) + " " + "y".repeat(70)).endsWith("…"), "no clause break: cut at a word, with an ellipsis");
assert.equal(UndoneToTasks.priority(ask("n", "x", { days: 1 })).score, 5);
assert.equal(UndoneToTasks.priority(ask("n", "x", { days: 9 })).score, 1, "older is lower");
assert.equal(UndoneToTasks.priority(ask("n", "x", { kind: "routed", status: "stalled", days: 9 })).score, 5, "a ledger-pressed ask is not demoted by age");

// record(): writes the manifest and merges `task` by id, nothing else
const made = [{ ask: "a1", task: "/framework/ux/Dictate/tasks/save-every/", module: "ux/Dictate" }];
assert.equal(u.record(made), 1);
assert.equal(u.carrying(), 1);
assert.equal(new UndoneToTasks({ root }).plan().tracked.some(t => t.ask.id === "a1" && t.by === "manifest"), true, "a second plan sees the manifest");
assert.equal(u.record(made), 0, "re-marking changes nothing");
console.log("UndoneToTasks: all assertions passed");
