// Owner prompts become proposed tasks on their session. `node Servex/agents/prompt-tasks.test.mjs`. Doc: core/Session/doc/prompt-tasks.md.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools, hooks, ledgers } from "./page_tools.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import PromptTasks from "./PromptTasks.js";
import Session from "../../public/framework/core/Session/Session.js";
import Task from "../../public/framework/core/Task/Task.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SLUG = ".prompt-tasks-test-" + process.pid;
const PAGE_DIR = path.join(ROOT, "public/framework/ai/2026/10/22", SLUG), REC_DIR = path.join(ROOT, "public/framework/ai/sessions/2026/10/22", SLUG);
const REC = path.join(REC_DIR, "session.jsonl");
const MOD = "ai/prompt-tasks-test-" + process.pid, MOD_DIR = path.join(ROOT, "public/framework", MOD);
ledgers.task_moves = path.join(REC_DIR, "task-moves.jsonl"); TaskHomes.INDEX = path.join(REC_DIR, "homes.jsonl");   // never the real ledgers
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

fs.mkdirSync(PAGE_DIR, { recursive: true }); fs.mkdirSync(REC_DIR, { recursive: true });
fs.writeFileSync(REC, JSON.stringify({ session: { id: "00000000-0000-4000-8000-000000000001", kind: "vscode-tab", at: "2026-10-22T20:00:00Z" } }) + "\n");
try {
	// 1. page_add of an owner Prompt calls hooks.prompted with where it landed.
	const heard = [];
	hooks.prompted = p => heard.push(p);
	const page_add = page_tools().find(t => t.name === "page_add").handler;
	await page_add({ path: `/framework/ai/2026/10/22/${SLUG}/`, item: { type: "Prompt", text: "Build the session menu, and why is the readme page a 404?" } }, { caller: "owner" });
	await page_add({ path: `/framework/ai/2026/10/22/${SLUG}/`, item: { type: "part-text", text: "not a prompt" } }, { caller: "owner" });
	hooks.prompted = null;
	ok(heard.length === 1 && heard[0].file === path.join(PAGE_DIR, "page.jsonl") && heard[0].line === 1 && heard[0].text.startsWith("Build"), "an owner Prompt on a page tells Servex where it landed; other items do not");

	// 2. The prompt page maps to the session's own record, and line 1's id is read from a VS Code tab's object.
	// The model is stubbed: the live process's parts call answers one main ask (with a nested detail) and one question.
	const pt = new PromptTasks({ say: m => console.log("say:", m), off: () => false });   // never the machine's own on/off switch
	const rec = pt.record_for(heard[0].file);
	const live = await pt.live(rec);
	live.call = async (msg) => (pt.asked = msg, pt.asked_n = (pt.asked_n ?? 0) + 1, { usd: 0, text: JSON.stringify({ subject: "session menu", parts: [
		{ cites: [0], kind: "ask", text: "Build the session menu", module: MOD, parts: [{ cites: [0], kind: "ask", text: "settings first" }] },
		{ cites: [1], kind: "question", text: "Why is the readme page a 404?" },
	] }) });
	ok(rec?.file === REC && rec.uuid === "00000000-0000-4000-8000-000000000001", "the prompt page maps to ai/sessions/<same day>/<same folder>/session.jsonl, uuid from line 1");

	// 3. Each task-kind ask is filed as an open idle task, not on the owner, in the session's record; a question is not.
	const out = await pt.prompted(heard[0]);
	const plog = read(path.join(REC_DIR, "prompts.jsonl"));
	ok(["raw", "clean", "parts"].every(st => plog.some(l => l.stage === st)) && plog.find(l => l.stage === "parts").parts[0].parts[0].text === "settings first", "the prompt's record (raw, sentences, parts with nested details) is in the session's prompts.jsonl");
	const adds = read(REC).filter(l => l.tasks?.add); 
	ok(adds.length === 1 && adds[0].tasks.add.state === "idle" && !("waiting_on" in adds[0].tasks.add) && adds[0].tasks.add.from === "owner", "one open (idle) task per task-kind ask, not waiting on the owner; the question stays on the card");
	fs.mkdirSync(MOD_DIR, { recursive: true });
	ok(!fs.existsSync(path.join(MOD_DIR, "tasks")), "a proposed task drafts in the session: no module folder is made before approval");
	await pt.prompted(heard[0]);
	ok(read(REC).filter(l => l.tasks?.add).length === 1, "the same prompt is never filed twice");
	ok(adds[0].tasks.add.description.includes("settings first") && adds[0].tasks.add.module_hint === MOD, "a main ask carries its nested details and its module hint");
	ok(adds[0].tasks.add.source.session === rec.uuid && adds[0].tasks.add.source.line === 1 && adds[0].tasks.add.source.part === "a1", "source names the session, the prompt's line and the part, so the receiver can read the raw words");
	ok(adds[0].by === "prompt-tasks" && adds[0].tasks.add.from === "owner", "written by caller prompt-tasks, from the owner");

	// 3b. Only the owner's own VS Code tab, only while switched on.
	const calls = () => pt.asked_n;
	pt.asked_n = 0;
	await pt.prompted({ ...heard[0], line: 2, by: "minion-x" });
	ok(calls() === 0, "a prompt not written by the owner is never refined");
	pt.off = () => true;
	await pt.prompted({ ...heard[0], line: 3 });
	ok(calls() === 0, "switched off: nothing is refined");
	pt.off = () => false;
	const SDK_PAGE = path.join(path.dirname(PAGE_DIR), SLUG + "-sdk"), SDK_REC = path.join(path.dirname(REC_DIR), SLUG + "-sdk");
	fs.mkdirSync(SDK_PAGE, { recursive: true }); fs.mkdirSync(SDK_REC, { recursive: true });
	fs.writeFileSync(path.join(SDK_REC, "session.jsonl"), JSON.stringify({ session: { id: "00000000-0000-4000-8000-000000000002", kind: "servex" } }) + "\n");
	try {
		ok(pt.record_for(path.join(SDK_PAGE, "page.jsonl")) === null, "an SDK agent's session (line 1 not vscode-tab) has no record here, so nothing is filed");
		fs.writeFileSync(path.join(SDK_REC, "session.jsonl"), JSON.stringify({ session: "bare-string" }) + "\n");
		ok(pt.record_for(path.join(SDK_PAGE, "page.jsonl")) === null, "no id on line 1: skipped, never a made-up session path");
		ok(PromptTasks.module_of("public/framework/ext/Refine/Prompt.js") === "ext/Refine" && PromptTasks.module_of("Server/x.mjs") === null, "no module hint: the module that holds its file_hint, else none (it stays in its session)");
} finally { fs.rmSync(SDK_PAGE, { recursive: true, force: true }); fs.rmSync(SDK_REC, { recursive: true, force: true }); }

	// 3c. Only a turn a person typed: the transcript's turnOrigin. A scheduled check-in (CronCreate) is not the owner's words.
	const TR = path.join(REC_DIR, "transcript.jsonl"), CHECK = "Mastermind check: status of the architect and whether the branch merged", TYPED = "Build the merge button on the session page, please";
	const user = (text, turnOrigin) => JSON.stringify({ type: "user", turnOrigin, message: { role: "user", content: text } });
	fs.writeFileSync(TR, [user(CHECK, "scheduled"), user(TYPED, "human")].join("\n") + "\n");
	pt.transcript = () => TR; pt.asked_n = 0;
	await pt.prompted({ ...heard[0], line: 4, text: CHECK });
	ok(calls() === 0, "a scheduled check-in (turnOrigin scheduled) is never refined");
	await pt.prompted({ ...heard[0], line: 5, text: TYPED });
	ok(calls() === 1, "a turn a person typed (turnOrigin human) is refined");
	pt.transcript = null;
	PromptTasks.OFF_FILE = () => path.join(REC_DIR, "prompt-tasks.off");   // never the real Servex home
	const off_now = (PromptTasks.set(false), PromptTasks.off()); PromptTasks.set(true);
	ok(off_now === true && PromptTasks.off() === false, "the runtime switch file turns it off and back on");

	// 4. The session replays it as idle open work; a decide line from the page approves it.
	let s = Session.replay(read(REC));
	const t = [...s.tasks][0];
	ok(s.id === rec.uuid && t.state === "idle" && t.get_one("waiting_on") == null && !PromptTasks.accepted(t) && t.get_one("title") === "Build the session menu", "the session reads it as open work: idle, not waiting on the owner, not yet started");
	s = Session.replay([...read(REC), { tasks: { [t.id]: { start: {} } } }]);
	ok([...s.tasks][0].state === "running" && PromptTasks.accepted([...s.tasks][0]), "a tab or agent that starts it (item tool start) accepts it");

	// 5. Started and naming a module: the TaskLoop sweep moves it to <module>/tasks/<slug>/, and the session references it there.
	ok((await pt.sweep()).length === 0, "an idle task nobody started is not moved");
	fs.appendFileSync(REC, JSON.stringify({ tasks: { [t.id]: { start: {} } } }) + String.fromCharCode(10));
	const moved = await pt.sweep();
	const home = path.join(MOD_DIR, "tasks", t.id, "task.jsonl");
	ok(moved.length === 1 && fs.existsSync(home) && (h => h.get_one("title") === "Build the session menu" && h.state === "running")(Task.replay(read(home))), "started: it moves to <module>/tasks/<slug>/ with its data and state");
	s = Session.replay(read(REC));
	ok(s.tasks.length === 1 && [...s.tasks][0].data.path === `/framework/${MOD}/tasks/${t.id}/`, "the session now references the moved task (same id replaces the nested one)");
	ok((await pt.sweep()).length === 0 && fs.readFileSync(ledgers.task_moves, "utf8").includes(t.id), "moved once, and the move is in the ledger");
} finally {
	fs.rmSync(PAGE_DIR, { recursive: true, force: true });
	fs.rmSync(REC_DIR, { recursive: true, force: true });
	fs.rmSync(MOD_DIR, { recursive: true, force: true });
}
console.log(`${n} passing`);
