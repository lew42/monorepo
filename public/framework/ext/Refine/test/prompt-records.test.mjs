// node test/prompt-records.test.mjs — a prompt's completion, computed from its parts (doc/prompt-records.md).
import assert from "node:assert/strict";
import Prompt from "../Prompt.js";
import PromptLog from "../../../ai/AISession/PromptLog.js";

const lines = [
	{ prompt: "p1", stage: "raw", text: "Build X. Also Y. Thanks." },
	{ prompt: "p1", stage: "clean", sentences: ["Build X.", "Also Y.", "Thanks."], final: true },
	{ prompt: "p1", stage: "parts", process: "review", parts: [
		{ id: "a1", cites: [0], kind: "ask", text: "Build X", outcome: { is: "task", ref: "t-x" } },
		{ id: "a2", cites: [1], kind: "ask", text: "Y", outcome: { is: "documented", ref: "readme.md" } } ] },
];
let row = PromptLog.fold(lines).p1;
let p = Prompt.from_log(row, "s");
assert.deepEqual(p.parts[0].cites, [1], "cites become 1-based sentence numbers");
assert.deepEqual(p.uncovered, [3], "the uncited sentence is uncovered");
assert.deepEqual(p.progress(() => "running"), { done: 1, total: 3 });
assert.equal(p.complete(() => "complete"), false, "an uncovered sentence keeps it open");
lines.push({ prompt: "p1", stage: "parts", process: "review", parts: [...lines[2].parts, { id: "c1", cites: [2], kind: "conversation", text: "Thanks", outcome: { is: "no-action", why: "conversation" } }] });
p = Prompt.from_log(PromptLog.fold(lines).p1, "s");
assert.equal(p.completion(() => "running"), 2 / 3);
assert.equal(p.complete(id => id === "t-x" ? "complete" : null), true, "complete once the carrying task is");
assert.equal(new Prompt().complete(), false, "no parts: not complete");
assert.ok(PromptLog.STAGES.parts({ parts: [{ text: "a", cites: [0], parts: [{ text: "b", cites: [1] }] }] }));
assert.ok(!PromptLog.STAGES.parts({ parts: [{ text: "a", cites: ["x"] }] }));
lines.push({ prompt: "p1", stage: "handled", to: "/framework/x/tasks/y/", note: "routed", by: "m", at: "t" });
assert.equal(PromptLog.fold(lines).p1.handled.to, "/framework/x/tasks/y/");
console.log("prompt-records: 10 of 10 pass");
