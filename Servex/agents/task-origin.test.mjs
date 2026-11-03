// task_origin() / handoff_note() (ask1-origin, 2026-11-03): a task filed with `tasks.add` on a session carries `from: {prompt,
// sentence}` and raw `text`; it survives Task.replay, a Ref lands in session.messages after the owner's own bubble, and the
// fields outlive a handoff move. `node Servex/agents/task-origin.test.mjs`.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item, task_origin, move_item, hooks } from "./page_tools.js";
import { handoff_note } from "./handoff-note.js";
import Session from "../../public/framework/core/Session/Session.js";
import Ref from "../../public/framework/core/Item/Ref.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/11/03/.ask1-origin-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "session.jsonl"), URL = "/" + REL.slice("public/".length) + "/";
const MOVED_REL = REL + "-moved", MOVED_URL = "/" + MOVED_REL.slice("public/".length) + "/";

const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const item = (delta, caller) => run_item({ path: URL, delta }, { caller });

const FROM = { prompt: "p-abc123", sentence: "2026-11-03T13:50:00-06:00" };
const TEXT = "The tab bar is broken on my phone.";

fs.mkdirSync(DIR, { recursive: true });
try {
	fs.writeFileSync(FILE, JSON.stringify({ session: { id: "v-ask1-origin-test", kind: "voice", at: "2026-11-03T13:49:00-06:00" } }) + "\n");
	// The owner's own bubble (a Prompt message), the way ChatWriter.owner() would write one, holding FROM.sentence's prompt id.
	fs.appendFileSync(FILE, JSON.stringify({ messages: { add: { type: "Prompt", id: FROM.prompt, by: "owner", at: FROM.sentence, sentences: ["s-1"] } } }) + "\n");

	// 1. A root tasks.add on a voice session carries `from`/`text` through, and the task.jsonl line shows both verbatim.
	const add = await item({ tasks: { add: { title: "Fix the mobile tab bar", from: FROM, text: TEXT } } }, "voice-assistant");
	ok(add.ok && add.ids.length === 1, "tasks.add on the session root writes a nested subtask");
	const id = add.ids[0];
	const added_line = read(FILE).find(l => l.tasks?.add?.id === id);
	ok(added_line && JSON.stringify(added_line.tasks.add.from) === JSON.stringify(FROM), "the written line keeps `from` as the object it was given, not an asker string");
	ok(added_line.tasks.add.text === TEXT, "the written line keeps `text` verbatim");

	// 1b. Two more tasks, same session, same burst — a Ref per add, each as its own call (the voice assistant files one task at a time).
	const add2 = await item({ tasks: { add: { title: "Also the logo", from: { prompt: FROM.prompt, sentence: "2026-11-03T13:50:05-06:00" }, text: "Also we need a new logo." } } }, "voice-assistant");
	const add3 = await item({ tasks: { add: { title: "And the phone number", from: { prompt: FROM.prompt, sentence: "2026-11-03T13:50:10-06:00" }, text: "Call me at the number on file." } } }, "voice-assistant");
	const id2 = add2.ids[0], id3 = add3.ids[0];

	// 2. It survives Session/Task.replay (deliverable 1: `from` is a recognized Task field).
	const session = Session.replay(read(FILE));
	const task = session._tasks.find(id);
	ok(task && JSON.stringify(task.get_one("from")) === JSON.stringify(FROM), "Task.replay keeps `from` as the object (Task.FIELDS already lists it)");

	// 3. Deliverable 3: a Ref for EACH root task add reaches session.messages, in the order they were added, after the owner's own
	// bubble (the Prompt holding from.sentence's prompt) — never before it, never reordered.
	const items = session.messages.items;
	const bubble_at = items.findIndex(m => m.id === FROM.prompt);
	ok(bubble_at !== -1, "the owner's own bubble (the Prompt holding from.sentence's prompt) is in session.messages");
	const ref_ids = items.filter(m => m instanceof Ref).map(m => m.data?.path);
	ok(JSON.stringify(ref_ids) === JSON.stringify([`tasks.${id}`, `tasks.${id2}`, `tasks.${id3}`]), `a Ref per task, in the order added: got ${JSON.stringify(ref_ids)}`);
	const first_ref_at = items.findIndex(m => m instanceof Ref);
	ok(first_ref_at > bubble_at, "every Ref comes after the owner's bubble, never before it");

	// 4. task_origin() reads the raw `from`/`text` back off disk, the way a handoff reads them before the move.
	const origin = task_origin(URL, id);
	ok(origin && JSON.stringify(origin.from) === JSON.stringify(FROM) && origin.text === TEXT, "task_origin() answers {from, text} straight off the file");

	// 5. handoff_note() turns that into the one-line quote for the new agent's first message, naming the sentence and the raw words.
	const note = handoff_note(origin);
	ok(note.includes(TEXT) && note.includes(FROM.sentence), "handoff_note() quotes the raw words and names the sentence's `at`, never retyped");
	ok(handoff_note(null) === "" && handoff_note({}) === "", "no origin, or an origin with nothing to say, adds nothing");

	// 6. A handoff (move_item) still leaves `from`/`text` in the moved task's own task.jsonl.
	const moved = await move_item({ from: URL, id, to: MOVED_URL, by: "spawn" });
	ok(!moved.why, `move_item did not refuse: ${moved.why}`);
	const moved_text = fs.readFileSync(moved.file, "utf8");
	ok(moved_text.includes(TEXT) && moved_text.includes(FROM.prompt) && moved_text.includes(FROM.sentence), "the moved task.jsonl still has the raw text and the from object, unchanged");

	// 7. Finding 1 (review.md): `from` is overloaded — the asker's agent id for a request is also `from`, always a string. An object
	// origin must never reach hooks.answered as `to`, and completing a task with one must never throw.
	const answered = [];
	hooks.answered = r => answered.push(r);
	await item({ [id2]: { complete: { outcome: "logo done", evidence: ["test"] } } }, "mastermind-voice-system");   // id2's `from` is FROM (an object), not an asker string
	ok(answered.length === 0, "a task whose `from` is an object (a voice origin, not an asker) never notifies anyone on completion");
	hooks.answered = null;
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(path.join(ROOT, MOVED_REL), { recursive: true, force: true });
}
console.log(`${n} passing`);
process.exit(0);
