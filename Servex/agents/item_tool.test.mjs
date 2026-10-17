// The item tool (page_tools.js), on a fixture task folder under public/. `node Servex/agents/item_tool.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.item-tool-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
const URL = "/" + REL.slice("public/".length) + "/";
const tools = Object.fromEntries(page_tools().map(t => [t.name, t]));
const call = async (name, args, caller = "t1") => JSON.parse(await tools[name].handler(args, { caller }));
const lines = () => fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
fs.writeFileSync(path.join(DIR, "page.jsonl"), "");   // a page beside the task: the folder is still a task
try {
	let r = await call("item", { path: URL, delta: { start: {} } });
	ok(r.ok && r.state.state === "running", "start -> running");
	ok(r.instructions?.methods.some(m => m.name === "start"), "first call has instructions");
	ok(lines().length === 2 && lines()[1].by === "t1" && lines()[1].ts, "one stamped line");

	r = await call("item", { path: URL, delta: { tasks: { add: { title: "x" } } } });
	ok(r.state.completion === 0 && r.state.tasks.length === 1, "tasks.add -> one child, completion 0");
	ok(!r.instructions, "second call: no instructions");

	for (const bad of [{ _secret: 1 }, { nonsense_method_or_field: 1 }]){
		const before = lines().length;
		r = await call("item", { path: URL, delta: bad });
		ok(r.ok === false && r.exists.includes("start") && lines().length === before, "refused: " + Object.keys(bad));
	}

	r = await call("item", { path: URL, delta: { "now.preview": "x" } });
	ok(JSON.stringify(lines().at(-1).now) === '{"preview":"x"}', "dot path expands");

	r = await call("item", { path: URL, delta: { help: {} } });
	ok(r.instructions && lines().length >= 3, "help returns instructions, writes nothing");
	r = await call("item", { path: URL, delta: { help: {} } }, "t2");
	ok(r.instructions, "help for a new caller too");

	r = await call("item", { path: URL });
	ok(r.state.class === "Task" && r.state.state === "running", "no delta = state");

	const before = lines().length;
	r = await call("page_set", { path: URL, delta: { pause: {} } });
	ok(r.ok && lines().length === before + 1 && lines().at(-1).pause, "page_set is the same function");
	r = await call("item", { path: URL, delta: { expected: "a field line" } });
	ok(r.state.data.expected === "a field line", "a plain field line replays through Task.replay");
	console.log(`item_tool: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
