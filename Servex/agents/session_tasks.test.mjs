// A Session is a Task, and a task added to it is there at once (session-is-a-task, 2026-10-24). `node Servex/agents/session_tasks.test.mjs`
// Add through the item tool (a string, an object, a typed child), read the session back through the tool and by a fresh replay of its file.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";
import Task from "../../public/framework/core/Task/Task.js";
import Session from "../../public/framework/core/Session/Session.js";
import "../../public/framework/core/Task/Process.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.session-tasks-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "session.jsonl"), URL = "/" + REL.slice("public/".length) + "/";
const ID = "0f0f0f0f-1111-4222-8333-444455556666";
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("PASS —", m); };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ session: { id: ID, kind: "vscode-tab", at: "2026-10-24T20:00:00.000Z" } }) + "\n");
try {
	ok(new Session("s") instanceof Task, "Session extends Task");
	const plain = new Task({ id: "p" });
	plain.tasks.add("Fix the tab bar");
	ok(plain.tasks.find("fix-the-tab-bar")?.get_one("title") === "Fix the tab bar", "tasks.add(\"a string\") makes a Task titled by it");

	let r = await run_item({ path: URL, delta: { tasks: { add: "Fix the tab bar" } } }, { caller: "t1" });
	ok(r.ok && r.state.class === "Session" && r.state.tasks.some(t => t.title === "Fix the tab bar"), "the item tool takes a string; the answer already lists the task");
	const written = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l)).find(l => l.tasks?.add);
	ok(written?.tasks.add.title === "Fix the tab bar" && typeof written.tasks.add.id === "string", "the line written is an object with an id, never a bare string");

	r = await run_item({ path: URL, delta: { tasks: { add: { title: "Name the module", expected: "a name" } } } }, { caller: "t1" });
	r = await run_item({ path: URL, delta: { tasks: { add: { type: "Process", title: "Build it", id: "build-it" } } } }, { caller: "t1" });
	ok(r.ok, "an object, and an object with a type, are taken");

	r = await run_item({ path: URL }, { caller: "t1" });
	ok(r.state.counts.direct.created === 3 && r.state.tasks.length === 3, "read back through the tool: 3 own tasks, counted on read");

	const s = Session.replay(fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l)));
	ok(s instanceof Session && s.tasks.length === 3 && s.tasks.find("build-it")?.constructor.name === "Process", "a fresh replay of the file has them, the typed one as its class");
	ok([...s.tasks].every(t => t.created_at), "each has the time of the line that added it (for newest-first lists)");
	ok(s.completion === 0 && s.progress().total === 3, "completion is computed from the tasks");
	console.log(`session_tasks: ${n} checks passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
