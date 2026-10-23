// Requests are logged items: a task added to another agent's task is a request; the receiver hears once, the asker hears the outcome.
// `node Servex/agents/requests.test.mjs`. Doc: Servex/agents/doc/messaging.md, "Requests are logged items".
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item, hooks } from "./page_tools.js";
import Task from "../../public/framework/core/Task/Task.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/22/.requests-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl"), URL = "/" + REL.slice("public/".length) + "/";
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const asked = [], answered = [];
hooks.requested = r => asked.push(r);
hooks.answered = r => answered.push(r);
const item = (delta, caller) => run_item({ path: URL, delta }, { caller });
const tick = () => new Promise(r => setTimeout(r, 10));

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { agent: "architect", title: "Process system" } }) + "\n");
try {
	await item({ tasks: { add: { title: "Answer a design question" } } }, "vscode-mastermind"); await tick();
	ok(asked.length === 1 && asked[0].to === "architect" && asked[0].from === "vscode-mastermind" && asked[0].id === "answer-a-design-question", "a task another agent adds is a request: the receiver hears once");
	ok(read(FILE).find(l => l.tasks?.add)?.tasks.add.from === "vscode-mastermind", "node stamps `from` on the logged item");

	await item({ tasks: { add: { title: "My own note" } } }, "architect"); await tick();
	ok(asked.length === 1, "a task the owner of the log adds itself is not a request");

	await item({ "answer-a-design-question": { complete: { outcome: "yes, instantiate on the server" } } }, "architect"); await tick();
	ok(answered.length === 1 && answered[0].to === "vscode-mastermind" && answered[0].outcome === "yes, instantiate on the server", "completing it tells the asker the outcome");

	await item({ "my-own-note": { complete: { outcome: "done" } } }, "architect"); await tick();
	ok(answered.length === 1, "completing a task nobody asked for tells nobody");

	const t = Task.replay(read(FILE))._tasks.find("answer-a-design-question");
	ok(t.state === "complete" && t.get_one("from") === "vscode-mastermind", "the record keeps who asked and the answer, for any view to query");
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
console.log(`${n} passing`);
process.exit(0);
