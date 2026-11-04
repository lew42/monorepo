// node Servex/agents/Question-dedupe.test.mjs — ask7, item 4: "a repeated question links to its existing card instead of
// making a second one" (ux/Dictate/doc/principles.md). A Question nests under its Prompt's own task (never the session's
// own root), so the item tool's older same-TITLE guard never saw it; this is the new, text-based, session-wide guard in
// page_tools.js (find_question_adds/norm_question/is_question).
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools, run_item } from "./page_tools.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import "../../public/framework/core/Task/Question.js";   // registers "Question" with Item.register — page_tools.js never imports it directly

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.question-dedupe-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
TaskHomes.INDEX = DIR + "-homes/task.jsonl";   // never the real /tasks/ index
const URL = "/" + REL.slice("public/".length) + "/";
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");

try {
	const add = (delta, caller = "t1") => run_item({ path: URL, delta }, { caller });

	// Two Prompt-shaped tasks, each with its own Question nested under it (the real shape: a Question nests under its
	// Prompt's own task, never the session's own root). A plain Task stands in for a Prompt here — only its own child
	// Question nesting matters to this guard.
	let r = await add({ tasks: { add: { id: "p-1", title: "Can you hear me?" } } });
	ok(r.ok, "p-1 added");
	r = await add({ tasks: { add: { id: "p-2", title: "Are you still there?" } } });
	ok(r.ok, "p-2 added");

	r = await add({ "p-1": { tasks: { add: { type: "Question", id: "q-1", text: "Can you hear me?", from: "p-1" } } } });
	ok(r.ok && r.ids.includes("q-1"), "the first Question is written");

	// The SAME question, worded identically, under a different Prompt: refused, with the existing id.
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-2", text: "Can you hear me?", from: "p-2" } } } });
	ok(!r.ok && r.existing === "q-1", "a repeated question (same text, a different Prompt) is refused with the existing id");

	// Punctuation/case/whitespace differences do not defeat the dedupe (norm_question).
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-3", text: "  CAN you hear me??  ", from: "p-2" } } } });
	ok(!r.ok && r.existing === "q-1", "a differently-punctuated repeat is still caught");

	// A genuinely different question is not refused.
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-4", text: "What time is it?", from: "p-2" } } } });
	ok(r.ok && r.ids.includes("q-4"), "a different question is written");

	// An ANSWERED duplicate is still caught (the guard is about the text, not the phase — "the card that's already answered").
	await add({ "q-1": { answer: { text: "Yes.", by: "smart" } } });
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-5", text: "Can you hear me?", from: "p-2" } } } });
	ok(!r.ok && r.existing === "q-1", "an answered duplicate is still caught, not just an open one");

	// A plain Task (not a Question) with the same words never trips this guard — it is text-matching Questions only.
	r = await add({ "p-2": { tasks: { add: { title: "Can you hear me?" } } } });
	ok(r.ok, "a plain Task with the same words is not a Question, so it is not refused by this guard");

	console.log(`${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(DIR + "-homes", { recursive: true, force: true });
}
