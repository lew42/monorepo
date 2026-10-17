// The item tool (page_tools.js), on a fixture task folder under public/. `node Servex/agents/item_tool.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools, run_item } from "./page_tools.js";

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

	// A session folder: session.jsonl alone means class Session.
	const SDIR = DIR + "-session", SURL = URL.replace(/\/$/, "") + "-session/";
	fs.mkdirSync(SDIR, { recursive: true });
	fs.writeFileSync(path.join(SDIR, "session.jsonl"), JSON.stringify({ session: "fixture-session" }) + "\n");
	try {
		r = await call("item", { path: SURL, delta: { tasks: { add: { type: "Task", title: "a" } } } });
		await call("item", { path: r.homes[0].path, delta: { complete: {} } });
		r = await call("item", { path: SURL, delta: { tasks: { add: { type: "Task", title: "b" } } } });
		ok(r.ok && r.state.class === "Session" && r.state.completion === 0.5 && r.state.progress.total === 2, "session.jsonl -> Session, tasks.add, completion 1/2");
		r = await call("item", { path: SURL, delta: { nonsense_key: 1 } });
		ok(r.ok === false && /Session/.test(r.why), "Session refuses unknown keys");
	} finally { fs.rmSync(SDIR, { recursive: true, force: true }); }

	// ---- step 14a: task homes ----
	const MODS = DIR + "-modules", MOD = path.join(MODS, "fakemod");
	fs.mkdirSync(MOD, { recursive: true });
	const app = d => "/" + path.relative(path.join(ROOT, "public"), d).split(path.sep).join("/") + "/";
	try {
		const add = async (delta, ctx = {}) => JSON.parse(JSON.stringify(await run_item({ path: URL, delta }, { caller: "t1", module_root: MODS, ...ctx })));
		const before = lines().length;
		r = await add({ tasks: { add: { type: "Task", title: "Module job", module: "fakemod", expected: "it works" } } });
		const home = path.join(MOD, "tasks", "module-job");
		ok(r.ok && fs.existsSync(path.join(home, "task.jsonl")), "module task: <module>/tasks/<slug>/task.jsonl");
		const l1 = JSON.parse(fs.readFileSync(path.join(home, "task.jsonl"), "utf8").split("\n")[0]);
		ok(l1.id === "module-job" && l1.path === app(home) && l1.parent === URL && l1.module === "fakemod" && l1.expected === "it works", "line 1 has id, path, parent, fields");
		ok(lines().length === before + 1 && lines().at(-1).task === app(home) && !lines().at(-1).tasks && Object.keys(lines().at(-1)).length === 3, "the parent gains exactly one {task} line");
		ok(r.state.tasks.length === 2 && r.state.tasks.find(t => t.id === "module-job").title === "Module job" && r.state.tasks.find(t => t.id === "module-job").state === "idle", "reading the parent lists the child with its own state");
		ok(!fs.existsSync(path.join(MODS, "nomod")), "no module folder made");

		r = await add({ tasks: { add: { title: "Plain job", module: "nomod" } } });
		ok(fs.existsSync(path.join(DIR, "plain-job", "task.jsonl")) && !fs.existsSync(path.join(MODS, "nomod")), "no module folder: <parent>/<slug>/, module folder not created");
		r = await add({ tasks: { add: { title: "Plain job" } } });
		ok(fs.existsSync(path.join(DIR, "plain-job-2", "task.jsonl")), "repeated title gets -2");

		r = await call("item", { path: app(home), delta: { start: {} } });
		ok(r.state.state === "running", "start the child through its own path");
		r = await call("item", { path: URL });
		ok(r.state.tasks.find(t => t.id === "module-job").state === "running" && r.state.completion === 0, "parent sees the child running");
		await call("item", { path: app(home), delta: { complete: {} } });
		r = await call("item", { path: URL });
		ok(r.state.completion === 1 / 4, "parent completion changes after the child completes");

		fs.appendFileSync(FILE, JSON.stringify({ task: "/framework/ai/sessions/2026/10/16/no-such-" + process.pid + "/" }) + "\n");
		r = await call("item", { path: URL });
		ok(r.ok && r.state.tasks.some(t => t.state === "missing"), "a missing child file is a stub, no throw");
	} finally { fs.rmSync(MODS, { recursive: true, force: true }); }
	console.log(`item_tool: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
