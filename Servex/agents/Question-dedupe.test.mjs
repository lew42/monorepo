// node Servex/agents/Question-dedupe.test.mjs — ask7, item 4: "a repeated question links to its existing card instead of
// making a second one" (ux/Dictate/doc/principles.md). A Question nests under its Prompt's own task (never the session's
// own root), so the item tool's older same-TITLE guard never saw it. Review fix (finding 4): the first version only
// REFUSED the write (dropping every sibling line in the same delta, and making no actual link); this version strips the
// duplicate in place, writes `also_from` onto the existing Question, and leaves everything else in the write untouched —
// strip_duplicate_questions/norm_question/is_question in page_tools.js.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools, run_item } from "./page_tools.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import Task from "../../public/framework/core/Task/Task.js";
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
	// Read the record back for real (like Question.test.mjs), rather than through the item tool's own small answer shape
	// (task_state/row_of drop `also_from` on purpose — never the whole picture on every write).
	const every = (t, out = []) => { out.push(t); for (const k of t._tasks ?? []) every(k, out); return out; };
	const find = id => { const lines = fs.readFileSync(FILE, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)); return every(Task.replay(lines)).find(t => t.id === id); };

	// Two Prompt-shaped tasks, each with its own Question nested under it (the real shape: a Question nests under its
	// Prompt's own task, never the session's own root). A plain Task stands in for a Prompt here — only its own child
	// Question nesting matters to this guard.
	let r = await add({ tasks: { add: { id: "p-1", title: "Can you hear me?" } } });
	ok(r.ok, "p-1 added");
	r = await add({ tasks: { add: { id: "p-2", title: "Are you still there?" } } });
	ok(r.ok, "p-2 added");

	r = await add({ "p-1": { tasks: { add: { type: "Question", id: "q-1", text: "Can you hear me?", from: "p-1" } } } });
	ok(r.ok && r.ids.includes("q-1"), "the first Question is written");

	// The SAME question, worded identically, under a different Prompt: NOT written as a second card — linked instead.
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-2", text: "Can you hear me?", from: "p-2" } } } });
	ok(r.ok, "the write still succeeds (never a refusal)");
	ok(!r.ids.includes("q-2"), "the duplicate itself is not written as a new task");
	ok(r.linked?.[0]?.existing === "q-1" && r.linked[0].id === "q-2" && r.linked[0].from === "p-2", "the answer reports what was linked, to what, and from where");
	let q1 = find("q-1");
	ok(JSON.stringify(q1.also_from) === JSON.stringify(["p-2"]), "the EXISTING Question's own also_from now names the repeating Prompt — the actual link a view draws");

	// Punctuation/case/whitespace differences do not defeat the dedupe (norm_question).
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-3", text: "  CAN you hear me??  ", from: "p-2" } } } });
	ok(r.ok && r.linked?.[0]?.existing === "q-1", "a differently-punctuated repeat is still caught and linked");

	// A SIBLING field in the SAME delta as a duplicate must still be written — the old refusal dropped it (finding 4, part 2).
	r = await add({ "p-2": { title: "Are you still there? (refined)", tasks: { add: { type: "Question", id: "q-3b", text: "Can you hear me?", from: "p-2" } } } });
	ok(r.ok && !r.ids.includes("q-3b") && r.linked?.[0]?.existing === "q-1", "the duplicate in this delta is linked, not written");
	const p2 = find("p-2");
	ok(p2.get_one("title") === "Are you still there? (refined)", "...and the SIBLING field in the same delta (p-2's own title) was still written, not dropped");

	// A genuinely different question is not touched by this guard.
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-4", text: "What time is it?", from: "p-2" } } } });
	ok(r.ok && r.ids.includes("q-4") && !r.linked, "a different question is written, nothing linked");

	// An ANSWERED duplicate is still caught (the guard is about the text, not the phase — "the card that's already answered").
	await add({ "q-1": { answer: { text: "Yes.", by: "smart" } } });
	r = await add({ "p-2": { tasks: { add: { type: "Question", id: "q-5", text: "Can you hear me?", from: "p-2" } } } });
	ok(r.ok && !r.ids.includes("q-5") && r.linked?.[0]?.existing === "q-1", "an answered duplicate is still caught, not just an open one");

	// A SECOND repeat of the same text in the very SAME write links to the first, never both landing. (An array-form
	// `tasks.add` never reports its new ids in `r.ids` — a pre-existing, unrelated quirk of `stamp_ids`'s single-object
	// case only — so this checks the file itself, not `r.ids`.)
	r = await add({ "p-1": { tasks: { add: [
		{ type: "Question", id: "q-6a", text: "Is it cached?", from: "p-1" },
		{ type: "Question", id: "q-6b", text: "is it cached??", from: "p-1" },
	] } } });
	ok(r.ok && r.linked?.[0]?.existing === "q-6a" && r.linked[0].id === "q-6b", "the second of two repeats in one write links to the first, not a third card");
	ok(!!find("q-6a") && !find("q-6b"), "the first repeat is really written, the second really is not");

	// A plain Task (not a Question) with the same words never trips this guard — it is text-matching Questions only.
	r = await add({ "p-2": { tasks: { add: { title: "Can you hear me?" } } } });
	ok(r.ok && !r.linked, "a plain Task with the same words is not a Question, so it is not touched by this guard");

	console.log(`${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(DIR + "-homes", { recursive: true, force: true });
}
