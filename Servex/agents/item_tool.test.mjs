// The item tool (page_tools.js), on a fixture task folder under public/. `node Servex/agents/item_tool.test.mjs`
// Cleanup retries (maxRetries): a dev server watching public/ writes files.jsonl into a fixture folder while it is removed (ENOTEMPTY, 2026-10-24), which used to skip the next cleanup and leave the -caller folder behind.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools, run_item } from "./page_tools.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import SessionRecord from "../../Server/SessionRecord.mjs";
const SessionRecord_file = d => SessionRecord.file(d);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.item-tool-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
TaskHomes.INDEX = DIR + "-homes/task.jsonl";   // never the real /tasks/ index
const URL = "/" + REL.slice("public/".length) + "/";
const tools = Object.fromEntries(page_tools().map(t => [t.name, t]));
// A write answers {ok, ids, line, now} (session-is-a-task item 12): the picture after it is a separate read, done here so the checks see it.
const read_back = async (r, url, caller) => r?.ok && r.line && r.state === undefined && url ? { ...r, state: JSON.parse(JSON.stringify(await run_item({ path: url }, { caller }))).state } : r;
const call = async (name, args, caller = "t1") => { const r = JSON.parse(await tools[name].handler(args, { caller })); return name === "item" && args.delta !== undefined ? read_back(r, args.path ?? URL, caller) : r; };
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
	ok(lines()[1].by === "t1" && lines()[1].ts, "one stamped line");
	ok(lines().length === 3 && JSON.stringify(lines()[2].sessions) === JSON.stringify([{ id: "t1", task: URL }]), "the first call by a new caller appends ONE sessions line");
	await call("item", { path: URL, delta: { now: "again" } });
	ok(lines().filter(l => l.sessions).length === 1, "the same caller is never added twice");

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
		await call("item", { path: SURL, delta: { a: { complete: { evidence: ["test"] } } } });   // a nested task: addressed by its id
		r = await call("item", { path: SURL, delta: { tasks: { add: { type: "Task", title: "b" } } } });
		// A session folder's log is a Task now (SessionRecord.log_file), so its nested tasks are subtasks.
		ok(r.ok && r.state.completion === 0.5 && r.state.tasks.length === 2, "session.jsonl: tasks.add, a child completed by its id, completion 1/2");
		// Walking into the tasks list by a child's id calls the child's verb (List.get finds members; 2026-10-22 it stored the delta as data).
		r = await call("item", { path: SURL, delta: { tasks: { b: { start: {} } } } });
		ok(r.ok && r.state.tasks.find(t => t.id === "b").state === "running" && !r.warning, "{tasks:{<id>:{start:{}}}} starts that child");
		r = await call("item", { path: SURL, delta: { tasks: { b: { start: {} } } } });
		ok(r.ok && /changed nothing/.test(r.warning ?? ""), "a verb that changes nothing says so");
		r = await call("item", { path: SURL, delta: { tasks: { nobody: { start: {} } } } });
		ok(r.ok && /changed nothing/.test(r.warning ?? ""), "a verb sent to a missing child says so");
		r = await call("item", { path: SURL, delta: { nonsense_key: 1 } });
		ok(r.ok === false && /names no method/.test(r.why), "a session log refuses unknown keys");
	} finally { fs.rmSync(SDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }

	// ---- step 14a: task homes ----
	const MODS = DIR + "-modules", MOD = path.join(MODS, "fakemod");
	fs.mkdirSync(MOD, { recursive: true });
	const app = d => "/" + path.relative(path.join(ROOT, "public"), d).split(path.sep).join("/") + "/";
	try {
		const add = async (delta, ctx = {}) => read_back(JSON.parse(JSON.stringify(await run_item({ path: URL, delta }, { caller: "t1", module_root: MODS, ...ctx }))), URL, "t1");
		const before = lines().length;
		r = await add({ tasks: { add: { type: "Task", title: "Module job", module: "fakemod", expected: "it works" } } });
		const home = path.join(MOD, "tasks", "module-job");
		ok(r.ok && fs.existsSync(path.join(home, "task.jsonl")), "module task: <module>/tasks/<slug>/task.jsonl");
		ok(TaskHomes.listed().has(app(path.join(MOD, "tasks"))), "a new module list joins the /tasks/ index");
		const l1 = JSON.parse(fs.readFileSync(path.join(home, "task.jsonl"), "utf8").split("\n")[0]);
		ok(l1.id === "module-job" && l1.path === app(home) && l1.parent === URL && l1.module === "fakemod" && l1.expected === "it works", "line 1 has id, path, parent, fields");
		ok(l1.source === "servex:t1" && JSON.stringify(l1.sessions) === JSON.stringify([{ id: "t1", task: app(home) }]), "node fills source and sessions on line 1 of a new task");
		ok(lines().length === before + 1 && lines().filter(l => l.task === app(home)).length === 1, "the parent gains one {task} line (t1 is already in sessions)");
		ok(lines().length === before + 1 && lines().find(l => l.task === app(home)) && !lines().at(-1).tasks, "the parent gains exactly one {task} line");
		ok(r.state.tasks.length === 2 && r.state.tasks.find(t => t.id === "module-job").title === "Module job" && r.state.tasks.find(t => t.id === "module-job").state === "idle", "reading the parent lists the child with its own state");
		ok(!fs.existsSync(path.join(MODS, "nomod")), "no module folder made");
		const list = path.join(MOD, "tasks", "task.jsonl"), list_lines = () => fs.readFileSync(list, "utf8").trim().split(String.fromCharCode(10)).map(l => JSON.parse(l));
		ok(list_lines()[0].id === "tasks" && list_lines()[0].path === app(path.join(MOD, "tasks")) && list_lines()[0].title === "fakemod tasks" && list_lines()[0].mode === "parallel", "module list: line 1 once");
		ok(list_lines().length === 2 && list_lines()[1].task === app(home), "module list: one reference per child");
		ok(/TaskPage/.test(fs.readFileSync(path.join(home, "page.js"), "utf8")), "child folder gets a TaskPage page.js");
		await add({ tasks: { add: { title: "Second job", module: "fakemod" } } });
		ok(list_lines().filter(l => l.id === "tasks").length === 1 && list_lines().length === 3, "second child: no second line 1, one more reference");

		r = await add({ tasks: { add: { title: "Plain job", module: "nomod" } } });
		ok(r.ok && !fs.existsSync(path.join(DIR, "plain-job")) && !fs.existsSync(path.join(MODS, "nomod")) && lines().at(-1).tasks.add.id === "plain-job", "no module folder: the subtask nests in the parent's file, no folder, module folder not created");
		const n_before = lines().length;
		r = await add({ tasks: { add: { title: "Plain job" } } });
		ok(r.ok === false && r.suggest === "plain-job-2" && /plain-job-2/.test(r.why) && lines().length === n_before, "a repeated subtask id is refused, offers -2, writes nothing");
		r = await add({ tasks: { add: { title: "Module job", module: "fakemod" } } });
		ok(r.ok === false && r.suggest === "module-job-2", "an existing module slug is refused with a -2 offer");
		ok(fs.existsSync(path.join(MOD, "tasks", "module-job", "task.jsonl")) && !fs.existsSync(path.join(MOD, "tasks", "module-job-2")), "refusal overwrote nothing and made nothing");

		r = await call("item", { path: app(home), delta: { start: {} } });
		ok(r.state.state === "running", "start the child through its own path");
		r = await call("item", { path: URL });
		ok(r.state.tasks.find(t => t.id === "module-job").state === "running" && r.state.completion === 0, "parent sees the child running");
		await call("item", { path: app(home), delta: { complete: { evidence: ["test"] } } });
		r = await call("item", { path: URL });
		ok(r.state.completion === 1 / 4, "parent completion changes after the child completes");

		fs.appendFileSync(FILE, JSON.stringify({ task: "/framework/ai/sessions/2026/10/16/no-such-" + process.pid + "/" }) + "\n");
		r = await call("item", { path: URL });
		ok(r.ok && r.state.tasks.some(t => t.state === "missing"), "a missing child file is a stub, no throw");
	} finally { fs.rmSync(MODS, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }

		// ---- step 16: caller's own log, module from the path, rules ----
		const MODN = "zz-item-tool-test-" + process.pid, MDIR = path.join(ROOT, "public", "framework", MODN);
		const CLOG_DIR = DIR + "-caller", CLOG = path.join(CLOG_DIR, "task.jsonl");
		fs.mkdirSync(path.join(MDIR, "sub"), { recursive: true });
		fs.mkdirSync(CLOG_DIR, { recursive: true });
		fs.writeFileSync(path.join(MDIR, "readme.md"), "# fixture\n");
		fs.writeFileSync(path.join(MDIR, "sub", "task.jsonl"), JSON.stringify({ id: "sub", title: "Sub" }) + "\n");
		fs.writeFileSync(CLOG, JSON.stringify({ id: "caller" }) + "\n");
		try {
			const run = (url, delta, ctx = {}) => run_item({ path: url, delta }, { caller: "t1", ...ctx }).then(x => read_back(JSON.parse(JSON.stringify(x)), url, "t1"));
			const clines = () => fs.readFileSync(CLOG, "utf8").trim().split("\n").map(l => JSON.parse(l));
			r = await run(URL, { tasks: { add: { title: "Ref job", module: MODN } } }, { caller_log: CLOG });
			ok(clines().length === 2 && clines()[1].task === r.homes[0].path && clines()[1].by === "t1" && clines()[1].ts, "caller log: exactly one reference line");
			r = await run(URL, { tasks: { add: { title: "Resolver job", module: MODN } } }, { resolve_log: id => id === "t1" ? CLOG : null });
			ok(clines().length === 3 && clines()[2].task === r.homes[0].path, "resolve_log(caller) finds the log");
			const n0 = clines().length, f0 = lines().length;
			r = await run(URL, { tasks: { add: { title: "No log job", module: MODN } } });
			ok(r.ok && clines().length === n0 && lines().length === f0 + 1, "no caller log: nothing extra written");
			r = await run(URL, { tasks: { add: { title: "Self job", module: MODN } } }, { caller_log: FILE });
			ok(r.ok && lines().length === f0 + 2, "caller log is the parent: no duplicate line");
			r = await run(URL, { tasks: { add: { title: "Broken log job", module: MODN } } }, { caller_log: path.join(CLOG_DIR, "no", "such", "x.jsonl") });
			ok(r.ok, "an unwritable caller log never errors");

			r = await run(`/framework/${MODN}/sub/`, { tasks: { add: { title: "Module from path" } } });
			ok(r.ok && fs.existsSync(path.join(MDIR, "tasks", "module-from-path", "task.jsonl")), "path inside a module, no module field: homes under <module>/tasks/");
			// Step 17: a call on a path inside a tasks/ folder keeps the child in the parent's folder, and the module list gets no second reference.
			const GOAL = path.join(MDIR, "tasks", "module-from-path");
			const list_refs = () => fs.readFileSync(path.join(MDIR, "tasks", "task.jsonl"), "utf8").trim().split(String.fromCharCode(10)).filter(l => JSON.parse(l).task).length;
			const refs0 = list_refs();
			r = await run(`/framework/${MODN}/tasks/module-from-path/`, { tasks: { add: { title: "Goal child" } } });
			ok(r.ok && !fs.existsSync(path.join(GOAL, "goal-child")) && !fs.existsSync(path.join(MDIR, "tasks", "goal-child")) && list_refs() === refs0 && r.state.tasks.some(t => t.id === "goal-child"), "a call inside tasks/: the subtask nests in the goal's own file, no folder, no module-list reference");
			r = await run(URL, { tasks: { add: { title: "Dated outside" } } });
			ok(!fs.existsSync(path.join(DIR, "dated-outside")) && r.state.tasks.some(t => t.id === "dated-outside"), "a dated ai/sessions path: the subtask nests, no folder");

			r = await call("item", { path: URL, delta: { help: {} } }, "rules-caller");
			ok(Array.isArray(r.instructions.rules) && r.instructions.rules.length === 5, "first-call instructions include rules");
		} finally {
			fs.rmSync(MDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
			fs.rmSync(CLOG_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
		}
	// ---- step 3c: one live instance per file, nested subtasks, a folder on demand ----
	{
		const { Task } = await import("../../public/framework/core/Task/Task.js");
		const { link_refs } = await import("./page_tools.js");
		link_refs(Task);
		const NDIR = DIR + "-live", NURL = URL.replace(/\/$/, "") + "-live/", NFILE = path.join(NDIR, "task.jsonl");
		fs.mkdirSync(NDIR, { recursive: true });
		fs.writeFileSync(NFILE, JSON.stringify({ id: "live-parent", path: NURL, title: "Live parent" }) + "\n");
		const nlines = () => fs.readFileSync(NFILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
		const stored = () => Task.Store.instances.get(NURL + "task.jsonl")?.host;
		try {
			await call("item", { path: NURL, delta: { start: {} } });
			const first = stored();
			await call("item", { path: NURL, delta: { expected: "same object" } });
			await call("item", { path: NURL });
			ok(first && stored() === first && first.data.expected === "same object", "two calls on one path reach the same instance");

			fs.appendFileSync(NFILE, JSON.stringify({ title: "edited outside" }) + "\n");
			r = await call("item", { path: NURL });
			ok(r.state.data.title === "edited outside" && stored() !== first, "a change made outside the tool is re-read, never served stale");

			r = await call("item", { path: NURL, delta: { tasks: { add: { title: "Nested one" } } } });
			ok(r.ok && !r.homes && nlines().at(-1).tasks.add.id === "nested-one" && !fs.existsSync(path.join(NDIR, "nested-one")), "a subtask nests in the parent's file: {tasks:{add}}, no folder");
			await call("item", { path: NURL, delta: { "nested-one": { start: {} } } });
			ok(nlines().at(-1)["nested-one"].start && stored().tasks.find("nested-one").state === "running", "a later change is written as {<child id>:{…}} and applied to the live child");
			const replayed = Task.replay(nlines());
			ok(replayed.tasks.find("nested-one")?.state === "running" && replayed.tasks.find("nested-one").get_one("title") === "Nested one", "the nested add + change replay the same way from the file (node)");

			r = await call("item", { path: NURL, delta: { folder: "nested-one" } });
			const kid_file = path.join(NDIR, "nested-one", "task.jsonl");
			ok(r.ok && fs.existsSync(kid_file) && nlines().at(-1).file === "nested-one/task.jsonl", "a folder on demand: the parent records {file}");
			const again = Task.replay(nlines());
			ok(again.tasks.find("nested-one")?.state === "running" && [...again.tasks].length === 1, "the folder variant replays: same child, same state, not doubled");
			await call("item", { path: NURL + "nested-one/", delta: { complete: { evidence: ["test"] } } });
			r = await call("item", { path: NURL });
			ok(r.state.tasks[0].state === "complete", "after the folder move, the parent sees the child's own file");

			// page_set / page_call / page_log on a task folder (task.jsonl, no page.jsonl) never make a stray page.jsonl.
			await call("page_set", { path: NURL, delta: { title: "via page_set" } });
			await call("page_log", { path: NURL, text: "now doing" });
			await call("page_call", { path: NURL, method: "pause", args: {} });
			ok(!fs.existsSync(path.join(NDIR, "page.jsonl")) && stored().data.title === "via page_set", "page tools on a task folder go to the task, no stray page.jsonl");
		} finally { fs.rmSync(NDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
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
	// ---- queries: a delta whose keys all READ answers and writes no line ----
	{
		const { Task } = await import("../../public/framework/core/Task/Task.js");
		const QDIR = DIR + "-query", QURL = URL.replace(/\/$/, "") + "-query/", qfile = path.join(QDIR, "session.jsonl");
		const kid_dir = path.join(QDIR, "child-session"), kid_url = QURL + "child-session/", plain_dir = path.join(QDIR, "plain-task");
		const was = Task.cost_resolver;
		Task.cost_resolver = p => p === QURL ? 0.5 : p === kid_url ? 1.5 : 0;
		fs.mkdirSync(kid_dir, { recursive: true });
		fs.mkdirSync(plain_dir, { recursive: true });
		try {
			fs.writeFileSync(qfile, JSON.stringify({ session: { id: "sum-1", kind: "agent", at: "2026-10-16T10:00:00Z" } }) + "\n");
			fs.writeFileSync(path.join(kid_dir, "session.jsonl"), JSON.stringify({ session: { id: "kid-1", kind: "agent" } }) + "\n" + JSON.stringify({ tasks: { add: { id: "k1", title: "Kid task" } } }) + "\n");
			fs.writeFileSync(path.join(plain_dir, "task.jsonl"), JSON.stringify({ assign: { slug: "plain-task", title: "Plain" } }) + "\n");
			await call("item", { path: QURL, delta: { tasks: { add: { id: "a", title: "A" } } } });
			await call("item", { path: QURL, delta: { tasks: { add: { id: "b", title: "B" } } } });
			await call("item", { path: QURL, delta: { tasks: { add: [{ id: "c", title: "C" }, { id: "d", title: "D" }] } } });
			let r = await call("item", { path: QURL, delta: { a: { tasks: { add: { id: "a1", title: "Nested A1" } } } } });
			ok(r.ok, "a nested task is added under a");
			await call("item", { path: QURL, delta: { a: { start: {} } } });
			await call("item", { path: QURL, delta: { b: { start: {} } } });
			await call("item", { path: QURL, delta: { b: { complete: { outcome: "done", evidence: ["a test"], confidence: "high" } } } });
			fs.appendFileSync(qfile, JSON.stringify({ tasks: { add: { type: "Task", id: "kid-1", title: "Child session", path: kid_url, state: "running" } } }) + "\n");
			fs.appendFileSync(qfile, JSON.stringify({ tasks: { add: { type: "Task", id: "plain", title: "Plain task", path: QURL + "plain-task/" } } }) + "\n");

			const size = fs.statSync(qfile).size;
			r = await call("item", { path: QURL, delta: { progress: {}, cost: {} } });
			// A record whose line 1 is {session:{id,kind}} replays as a Session (core/Session): its cost is its own Claude cost plus its child
			// agents, and the tasks' costs beside them (session_state), so the kid-1 task's 1.5 shows as cost.tasks.
			ok(r.ok && r.answer.progress.total >= 5 && r.answer.cost.tasks === 1.5 && r.answer.cost.total === 0, "a query delta answers {ok, answer:{key:value}}");
			ok(fs.statSync(qfile).size === size, "a query writes no line (file size before = after)");

			r = await call("item", { path: QURL, delta: { cost: {}, title: "x" } });
			ok(r.ok === false && /ask/.test(r.why) && /Nothing was written/.test(r.why) && fs.statSync(qfile).size === size, "a mixed delta (query + assign) is refused, nothing written");
			r = await call("item", { path: QURL, delta: { summary: {}, tasks: { add: { title: "z" } } } });
			ok(r.ok === false && fs.statSync(qfile).size === size, "a mixed delta (query + list add) is refused, nothing written");

			// a line that would break replay is refused before it is written (a getter-only field in a child add once made a log unreadable)
			{
				r = await call("item", { path: QURL, delta: { tasks: { add: { id: "getter", title: "Has commits", commits: ["abc123"] } } } });
				ok(r.ok === false && /commits/.test(r.why) && /Nothing was written/.test(r.why) && fs.statSync(qfile).size === size, "a child add with a getter-only field (commits) is refused by name, nothing written");
				r = await call("item", { path: QURL, delta: { tasks: { add: [{ id: "fine-1", title: "Fine" }, { id: "getter-2", title: "Bad", commits: ["x"] }] } } });
				ok(r.ok === false && fs.statSync(qfile).size === size, "an array add with one bad member writes none of them");
				r = await call("item", { path: QURL });
				ok(r.ok && r.state.tasks.length >= 5, "the file still reads after the refusals");
			}

			for (const bad of ["some text", 5, false]){
				r = await call("item", { path: QURL, delta: { summary: bad } });
				ok(r.ok === false && /summary is a query/.test(r.why) && /Nothing was written/.test(r.why) && !r.answer && fs.statSync(qfile).size === size, `a query given ${JSON.stringify(bad)} is refused, never answered or written`);
			}
			r = await call("item", { path: QURL, delta: { a: { cost: "x" } } });
			ok(r.ok === false && /a\.cost is a query/.test(r.why) && fs.statSync(qfile).size === size, "a nested query given a value is refused with its path");
			ok((await call("item", { path: QURL, delta: { summary: true } })).ok, "a query given true is still an ask");

			r = await call("item", { path: QURL, target: ["a"], delta: { progress: {} } });
			ok(r.ok && r.answer.progress.total === 1 && fs.statSync(qfile).size === size, "target walks into a child for a query");

			r = await call("item", { path: QURL, delta: { summary: {} } });
			const s = r.answer.summary;
			ok(s.class === "Session" && s.id === "sum-1", "summary: a session record answers as a Session, with its session id");
			ok(s.counts.direct.complete === 1 && s.counts.direct.started >= 3 && s.progress.done === 1, "summary: task counts by state");
			ok(s.cost.tasks === 1.5 && Array.isArray(s.children) && Math.abs(s.completion - s.progress.done / s.progress.total) < 1e-9, "summary: cost, child agents and completion");
			ok(fs.statSync(qfile).size === size, "summary writes nothing");

			// A Task answers summary itself (Task.summary): counts by state, the open tasks only, its cost and child sessions.
			r = await call("item", { path: QURL, target: ["a"], delta: { summary: {} } });
			const ts = r.answer?.summary;
			ok(r.ok && ts.id === "a" && ts.kind === "task" && ts.progress.total === 1 && Array.isArray(ts.open) && typeof ts.duration === "number", "summary on a task: its id, progress, open tasks and duration (Task.summary)");

			r = await call("item", { path: QURL, delta: { tasks: { add: [{ id: "e", title: "E" }, { id: "f", title: "F" }] } } });
			ok(r.ok && ["e", "f"].every(id => r.state.tasks.some(t => t.id === id)) && !r.state.tasks.some(t => t.id === "task"), "an array tasks.add is two tasks, never one Array child");
		} finally { Task.cost_resolver = was; fs.rmSync(QDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
	}
	// ---- move_item: a nested task moves home with id and history, one reference left behind ----
	{
		const { ledgers } = await import("./page_tools.js");
		const { Task } = await import("../../public/framework/core/Task/Task.js");
		const { default: Session } = await import("../../public/framework/core/Session/Session.js");
		const MDIR = DIR + "-move", MURL = URL.replace(/\/$/, "") + "-move/", pfile = path.join(MDIR, "session.jsonl");
		const plines = () => fs.readFileSync(pfile, "utf8").trim().split("\n").map(l => JSON.parse(l));
		ledgers.task_moves = path.join(MDIR, "task-moves.jsonl");
		const ledger = () => fs.existsSync(ledgers.task_moves) ? fs.readFileSync(ledgers.task_moves, "utf8").trim().split("\n").filter(Boolean) : [];
		fs.mkdirSync(MDIR, { recursive: true });
		try {
			fs.writeFileSync(pfile, JSON.stringify({ id: "mv-parent", title: "Parent" }) + "\n");
			await call("item", { path: MURL, delta: { tasks: { add: { id: "x", title: "X task" } } } });
			await call("item", { path: MURL, delta: { x: { start: {} } } });
			await call("item", { path: MURL, delta: { x: { expected: "a field" } } });
			const before = plines().filter(l => l.x || l.tasks?.add).map(l => l.ts);

			// refusals write nothing
			const size = fs.statSync(pfile).size;
			let r = await call("item", { path: MURL, delta: { nope: { move: { to: MURL + "agent-a/" } } } });
			ok(r.ok === false && /not a task/.test(r.why) && fs.statSync(pfile).size === size && !fs.existsSync(path.join(MDIR, "agent-a")) && !ledger().length, "unknown id: refused, nothing written");

			r = await call("item", { path: MURL, delta: { tasks: { x: { move: { to: MURL + "agent-a/" } } } } });
			ok(r.ok && r.moved.to === MURL + "agent-a/" && r.state.tasks.length === 1, "moved through the tool key");
			const nf = path.join(MDIR, "agent-a", "task.jsonl"), nl = fs.readFileSync(nf, "utf8").trim().split("\n").map(l => JSON.parse(l));
			ok(nl[0].id === "x" && nl[0].set.title === "X task" && nl[1].start && nl[2].expected === "a field", "new file: x's lines in order");
			ok(JSON.stringify(nl.map(l => l.ts)) === JSON.stringify(before), "original ts kept");
			ok(fs.existsSync(path.join(MDIR, "agent-a", "page.js")), "page.js made");
			const last = plines().at(-1);
			ok(last.task === MURL + "agent-a/" && last.as === "x" && last.moved_from === MURL + "#x", "the parent's last line is the one reference with as:x");
			const p = Session.replay(plines());
			ok([...p.tasks].length === 1 && p.tasks.find("x") && p.tasks.find("x").state === "running", "Session replay: ONE child x, running");
			ok(Task.replay(plines()).tasks.find("x")?.id === "x", "Task replay: the reference keeps id x");
			ok(ledger().length === 1 && JSON.parse(ledger()[0]).kind === "task", "one ledger line");

			// already a reference: refused, nothing written
			const size2 = fs.statSync(pfile).size;
			r = await call("item", { path: MURL, delta: { x: { move: { to: MURL + "agent-b/" } } } });
			ok(r.ok === false && /own file/.test(r.why) && fs.statSync(pfile).size === size2 && !fs.existsSync(path.join(MDIR, "agent-b")) && ledger().length === 1, "a reference cannot move again");

			// destination already holds a log: history goes after it
			await call("item", { path: MURL, delta: { tasks: { add: { id: "y", title: "Y task" } } } });
			await call("item", { path: MURL, delta: { y: { start: {} } } });
			fs.mkdirSync(path.join(MDIR, "agent-c"));
			const af = path.join(MDIR, "agent-c", "session.jsonl");
			fs.writeFileSync(af, JSON.stringify({ assign: { session_id: "s-c", agent: "agent-c" } }) + "\n");
			r = await call("item", { path: MURL, delta: { y: { move: { to: MURL + "agent-c/" } } } });
			const cl = fs.readFileSync(af, "utf8").trim().split("\n").map(l => JSON.parse(l));
			ok(r.ok && cl[0].assign && cl[1].id === "y" && cl[2].start && !fs.existsSync(path.join(MDIR, "agent-c", "task.jsonl")), "appended after the assign line, in the existing log");
			ok([...Session.replay(plines()).tasks].length === 2, "two children after two moves");

			// open_task handoff: task {dir, from, id} moves the subtask into the new agent's folder, by the spawner; a refusal is logged there
			const open_task = await import("./Agents.js").then(m => m.open_task, e => { console.log("open_task handoff checks skipped: " + e.code); return null; });   // a worktree has no Servex/node_modules
			if (open_task){
				await call("item", { path: MURL, delta: { tasks: { add: { id: "z", title: "Z task" } } } });
				const settle = async f => { for (let i = 0; i < 50 && !f(); i++) await new Promise(res => setTimeout(res, 20)); };
				open_task({ dir: path.join(MDIR, "agent-d"), from: MURL, id: "z" }, { session_id: "s-d", agent: "agent-d", by: "spawner" });
				await settle(() => plines().at(-1).as === "z");
				const dl = fs.readFileSync(SessionRecord_file(path.join(MDIR, "agent-d")), "utf8").trim().split("\n").map(l => JSON.parse(l));
				ok(dl[0].assign && dl[1].id === "z" && plines().at(-1).as === "z" && plines().at(-1).by === "spawner" && JSON.parse(ledger().at(-1)).by === "spawner", "open_task hands the subtask to the new folder, by the spawner");
				open_task({ dir: path.join(MDIR, "agent-e"), from: MURL, id: "nobody" }, { session_id: "s-e", agent: "agent-e", by: "spawner" });
				const ef = SessionRecord_file(path.join(MDIR, "agent-e"));
				await settle(() => fs.readFileSync(ef, "utf8").includes("refused"));
				ok(/"handoff".*"refused"/.test(fs.readFileSync(ef, "utf8")), "a refused handoff is written into the new log");
			}
		} finally { fs.rmSync(MDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
	}
	// part types: part-view and part-file are accepted on a page, part-nope is refused with the list
	{
		const PDIR = DIR + "-page", PURL = URL.replace(/\/$/, "-page/");
		fs.mkdirSync(PDIR, { recursive: true });
		fs.writeFileSync(path.join(PDIR, "page.jsonl"), JSON.stringify({ title: "Parts" }) + "\n");
		try {
			for (const part of [{ type: "part-view", class: "./A.js", data: { value: 1 } }, { type: "part-file", file: "./r.md" }]){
				const r = await call("item", { path: PURL, delta: { content: { add: part } } });
				ok(r.ok, `a ${part.type} line is accepted`);
			}
			const r = await call("item", { path: PURL, delta: { content: { add: { type: "part-nope" } } } });
			ok(r.ok === false && /part-view/.test(r.why) && /part-file/.test(r.why), "part-nope is refused and the refusal lists the types");
		} finally { fs.rmSync(PDIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
	}

	// Prompt and Question through the real tool: a Question completes bare once answered, and the unread query lists it (core/Task/doc/prompt.md)
	{
		let r = await call("item", { path: URL, delta: { tasks: { add: { type: "Prompt", id: "pq1", raw: ["Why is the sky blue? Also fix it."], paragraphs: [{ id: "a", text: "Why is the sky blue? Also fix it." }] } } } });
		ok(r.ok, "tasks.add type Prompt is accepted");
		r = await call("item", { path: URL, delta: { pq1: { tasks: { add: { type: "Question", id: "qq1", text: "Why is the sky blue?", from: "pq1" } } } } });
		ok(r.ok, "a Question nests under its Prompt");
		r = await call("item", { path: URL, delta: { pq1: { tasks: { qq1: { complete: {} } } } } });
		ok(r.ok === false && /answer/.test(r.why), "an unanswered Question refuses a bare complete, and says why");
		r = await call("item", { path: URL, delta: { pq1: { tasks: { qq1: { answer: { text: "Rayleigh scattering.", by: "t1" } } } } } });
		ok(r.ok, "the answer is set");
		r = await call("item", { path: URL, delta: { unread: {} } });
		ok(r.ok && JSON.stringify(r).includes("qq1"), "unread lists the answered, not-yet-read Question");
		r = await call("item", { path: URL, delta: { pq1: { tasks: { qq1: { complete: {} } } } } });
		ok(r.ok, "an answered Question completes with a bare complete");
		r = await call("item", { path: URL, delta: { unread: {} } });
		ok(r.ok && !JSON.stringify(r).includes("qq1"), "once read it leaves the unread list");
	}

	console.log(`item_tool: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); fs.rmSync(DIR + "-homes", { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
