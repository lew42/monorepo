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
		const list = path.join(MOD, "tasks", "task.jsonl"), list_lines = () => fs.readFileSync(list, "utf8").trim().split(String.fromCharCode(10)).map(l => JSON.parse(l));
		ok(list_lines()[0].id === "tasks" && list_lines()[0].path === app(path.join(MOD, "tasks")) && list_lines()[0].title === "fakemod tasks" && list_lines()[0].mode === "parallel", "module list: line 1 once");
		ok(list_lines().length === 2 && list_lines()[1].task === app(home), "module list: one reference per child");
		ok(/TaskPage/.test(fs.readFileSync(path.join(home, "page.js"), "utf8")), "child folder gets a TaskPage page.js");
		await add({ tasks: { add: { title: "Second job", module: "fakemod" } } });
		ok(list_lines().filter(l => l.id === "tasks").length === 1 && list_lines().length === 3, "second child: no second line 1, one more reference");

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
		ok(r.state.completion === 1 / 5, "parent completion changes after the child completes");

		fs.appendFileSync(FILE, JSON.stringify({ task: "/framework/ai/sessions/2026/10/16/no-such-" + process.pid + "/" }) + "\n");
		r = await call("item", { path: URL });
		ok(r.ok && r.state.tasks.some(t => t.state === "missing"), "a missing child file is a stub, no throw");
	} finally { fs.rmSync(MODS, { recursive: true, force: true }); }

		// ---- step 16: caller's own log, module from the path, rules ----
		const MODN = "zz-item-tool-test-" + process.pid, MDIR = path.join(ROOT, "public", "framework", MODN);
		const CLOG_DIR = DIR + "-caller", CLOG = path.join(CLOG_DIR, "task.jsonl");
		fs.mkdirSync(path.join(MDIR, "sub"), { recursive: true });
		fs.mkdirSync(CLOG_DIR, { recursive: true });
		fs.writeFileSync(path.join(MDIR, "readme.md"), "# fixture\n");
		fs.writeFileSync(path.join(MDIR, "sub", "task.jsonl"), JSON.stringify({ id: "sub", title: "Sub" }) + "\n");
		fs.writeFileSync(CLOG, JSON.stringify({ id: "caller" }) + "\n");
		try {
			const run = (url, delta, ctx = {}) => run_item({ path: url, delta }, { caller: "t1", ...ctx }).then(x => JSON.parse(JSON.stringify(x)));
			const clines = () => fs.readFileSync(CLOG, "utf8").trim().split("\n").map(l => JSON.parse(l));
			r = await run(URL, { tasks: { add: { title: "Ref job" } } }, { caller_log: CLOG });
			ok(clines().length === 2 && clines()[1].task === r.homes[0].path && clines()[1].by === "t1" && clines()[1].ts, "caller log: exactly one reference line");
			r = await run(URL, { tasks: { add: { title: "Resolver job" } } }, { resolve_log: id => id === "t1" ? CLOG : null });
			ok(clines().length === 3 && clines()[2].task === r.homes[0].path, "resolve_log(caller) finds the log");
			const n0 = clines().length, f0 = lines().length;
			r = await run(URL, { tasks: { add: { title: "No log job" } } });
			ok(r.ok && clines().length === n0 && lines().length === f0 + 1, "no caller log: nothing extra written");
			r = await run(URL, { tasks: { add: { title: "Self job" } } }, { caller_log: FILE });
			ok(r.ok && lines().length === f0 + 2, "caller log is the parent: no duplicate line");
			r = await run(URL, { tasks: { add: { title: "Broken log job" } } }, { caller_log: path.join(CLOG_DIR, "no", "such", "x.jsonl") });
			ok(r.ok, "an unwritable caller log never errors");

			r = await run(`/framework/${MODN}/sub/`, { tasks: { add: { title: "Module from path" } } });
			ok(r.ok && fs.existsSync(path.join(MDIR, "tasks", "module-from-path", "task.jsonl")), "path inside a module, no module field: homes under <module>/tasks/");
			// Step 17: a call on a path inside a tasks/ folder keeps the child in the parent's folder, and the module list gets no second reference.
			const GOAL = path.join(MDIR, "tasks", "module-from-path");
			const list_refs = () => fs.readFileSync(path.join(MDIR, "tasks", "task.jsonl"), "utf8").trim().split(String.fromCharCode(10)).filter(l => JSON.parse(l).task).length;
			const refs0 = list_refs();
			r = await run(`/framework/${MODN}/tasks/module-from-path/`, { tasks: { add: { title: "Goal child" } } });
			ok(r.ok && fs.existsSync(path.join(GOAL, "goal-child", "task.jsonl")) && !fs.existsSync(path.join(MDIR, "tasks", "goal-child")) && list_refs() === refs0, "a call inside tasks/: the child homes in the parent's folder, not the module list");
			r = await run(URL, { tasks: { add: { title: "Dated outside" } } });
			ok(fs.existsSync(path.join(DIR, "dated-outside", "task.jsonl")), "a dated ai/sessions path keeps the parent's folder");

			r = await call("item", { path: URL, delta: { help: {} } }, "rules-caller");
			ok(Array.isArray(r.instructions.rules) && r.instructions.rules.length === 5, "first-call instructions include rules");
		} finally {
			fs.rmSync(MDIR, { recursive: true, force: true });
			fs.rmSync(CLOG_DIR, { recursive: true, force: true });
		}
	// ---- Task.rank: recency x weight ----
	{
		const { Task } = await import("../../public/framework/core/Task/Task.js");
		const day = 864e5, now = Date.parse("2026-10-16T12:00:00Z"), at = d => new Date(now - d * day).toISOString();
		const mk = (id, ts, score, kids) => Task.replay([{ id, ts }, ...(score ? [{ priority: { score } }] : []), ...Array.from({ length: kids ?? 0 }, (_, i) => ({ tasks: { add: { id: id + i, type: "Task" } } }))]);
		const old_heavy = mk("old", at(9), 8), fresh = mk("fresh", at(0.5)), mid_kids = mk("mid", at(3), 1, 3);
		// old: 8 x 0.5^3 = 1; fresh: ~0.89; mid: (1+3) x 0.5 = 2
		ok(Task.rank([old_heavy, fresh, mid_kids], now).map(t => t.id).join() === "mid,old,fresh", "Task.rank: weight x recency order");
	}
	console.log(`item_tool: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
