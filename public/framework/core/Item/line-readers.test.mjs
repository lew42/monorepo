// Every reader of a saved line understands the marked spelling (D13), so Store.marked_lines can be switched on.
// `node public/framework/core/Item/line-readers.test.mjs`   The list of readers and the switch: doc/line-format.md.
// Each test feeds one reader a bare line and the same line marked (`start()`, `#c3`) and wants the same answer.
// Server scripts need node (fs), so those tests are test.node: the page lists them and does not run them.
import { test } from "../Test/Test.js";
import Store from "./Store.js";
import Session from "../Session/Session.js";

// Mark a bare line the way Store writes it with marked_lines on: a verb becomes `verb()`, a list item id becomes `#id`.
const VERBS = new Set(["start", "stop", "pause", "resume", "complete", "finish", "approve", "reject", "wait"]);
const mark_verbs = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [VERBS.has(k) ? k + "()" : k, v]));
const mark = line => Object.fromEntries(Object.entries(line).map(([k, v]) => {
	if (VERBS.has(k)) return [k + "()", v];                                             // {"start": {}}
	if (k === "tasks" && v && !v.add) return [k, Object.fromEntries(Object.entries(v).map(([id, d]) => ["#" + id, mark_verbs(d)]))];   // {"tasks": {"c3": {…}}}
	return [k, v];
}));
const show = x => JSON.stringify(x);
const finish = { outcome: "it works", evidence: ["a test"], confidence: "high", caveats: [] };

test("the helper marks the way Store writes (checked against the real Store)", t => {
	Store.marked_lines = true;
	try {
		const session = new Session({ id: "s" }), lines = [];
		const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(session);
		session.set({ tasks: { add: { id: "c3", type: "Task", title: "T" } } });
		session._tasks.find("c3").act("start");
		t.eq(lines.at(-1), mark({ tasks: { c3: { start: {} } } }), "Store writes {tasks: {#c3: {start(): {}}}}");
	} finally { Store.marked_lines = false; }
});

test("LineKey.deep takes the marks off at every depth and leaves a clean line alone", async t => {
	const { default: LineKey } = await import("./LineKey.js");
	const marked = { tasks: { "#c3": { "start()": {}, "tasks": { "#d1": { "complete()": { outcome: "x" } } } } }, by: "owner" };
	t.eq(LineKey.deep(marked), { tasks: { c3: { start: {}, tasks: { d1: { complete: { outcome: "x" } } } } }, by: "owner" }, "start() is start, #c3 is c3, at every level");
	const clean = { tasks: { c3: { start: {} } } };
	t.ok(LineKey.deep(clean) === clean, "a line with no marks comes back as the same object");
	t.eq(LineKey.deep([{ "start()": 1 }, "text", 3, null]), [{ start: 1 }, "text", 3, null], "arrays and plain values pass through");
});

// ---- the browser readers -------------------------------------------------------------------------------------------------

test("ChatV2Model folds a marked line like the bare one", async t => {
	const { default: Model } = await import("../../ext/Chat/v2/ChatV2Model.js");
	const add = { tasks: { add: { id: "p1", type: "Prompt", title: "P", tasks: [{ id: "c3", type: "Task", title: "T" }] } } };
	const bare = [add, { p1: { c3: { start: {} } } }, { p1: { c3: { complete: finish } } }];
	const marked = [add, { "#p1": { "#c3": { "start()": {} } } }, { "#p1": { "#c3": { "complete()": finish } } }];
	const a = Model.fold(bare), b = Model.fold(marked);
	t.eq(show(b.root), show(a.root), "the same nodes");
	t.eq(b.by_id.get("c3").state, "complete", "and the task ended complete, not idle");
});

test("SessionTimelineRows makes the same rows from marked lines", async t => {
	const { default: Rows } = await import("../../ai/AISession/SessionTimelineRows.js");
	const bare = [
		{ tasks: { add: { id: "c3", title: "Build it" } }, at: "2026-10-31T10:00:00Z" },
		{ tasks: { c3: { complete: { outcome: "built" } } }, at: "2026-10-31T11:00:00Z" },
		{ stop: { why: "tired" }, at: "2026-10-31T12:00:00Z" },
		{ start: {}, at: "2026-10-31T13:00:00Z" },
	];
	const marked = bare.map(mark);
	t.eq(marked[1], { tasks: { "#c3": { "complete()": { outcome: "built" } } }, at: "2026-10-31T11:00:00Z" }, "the marked line is what Store writes");
	t.eq(show(Rows.rows(marked)), show(Rows.rows(bare)), "same rows: the task done, the session stopped, the session resumed");
});

// ---- the server scripts --------------------------------------------------------------------------------------------------

test.node("AIIndex folds a marked task log to the same state and outcome", async t => {
	const { default: AIIndex } = await import("../../../../Server/AIIndex.mjs");
	const bare = [{ assign: { title: "T" } }, { start: {} }, { complete: finish }];
	const marked = bare.map(mark);
	const a = AIIndex.fold(bare), b = AIIndex.fold(marked);
	t.eq(b.state, a.state, "same state (" + a.state + ")");
	t.eq(b.outcome, a.outcome, "same landing text (" + a.outcome + ")");
	t.eq(AIIndex.landed_by_lines(marked) === null, AIIndex.landed_by_lines(bare) === null, "same answer to: did it land");
	t.eq(AIIndex.parse(marked.map(show).join("\n")), AIIndex.parse(bare.map(show).join("\n")), "parse hands every reader the bare spelling");
});

test.node("UndoneAsks reads a marked complete and stop", async t => {
	const { default: UndoneAsks } = await import("../../../../Server/UndoneAsks.mjs");
	t.eq(UndoneAsks.task_state([{ "complete()": {} }]), UndoneAsks.task_state([{ complete: {} }]), "complete()");
	t.eq(UndoneAsks.task_state([{ "stop()": {} }]), UndoneAsks.task_state([{ stop: {} }]), "stop()");
});

test.node("PromptRecords.tasks finds a task's state from marked lines", async t => {
	const { default: fs } = await import("node:fs"), { default: os } = await import("node:os"), { default: path } = await import("node:path");
	const { default: PromptRecords } = await import("../../../../Server/PromptRecords.mjs");
	const states = lines => {
		const folder = fs.mkdtempSync(path.join(os.tmpdir(), "line-readers-pr-"));
		fs.writeFileSync(path.join(folder, "session.jsonl"), lines.map(show).join("\n") + "\n");
		const r = new PromptRecords("x", { folder }); r._prompts = [{ line: 5, id: "u1", text: "t" }];
		try { return r.tasks().map(x => x.id + ":" + x.state); } finally { fs.rmSync(folder, { recursive: true, force: true }); }
	};
	const add = id => ({ tasks: { add: { id, type: "Task", title: id, source: { prompt: "u1" } } } });
	const bare = [add("c1"), add("c2"), add("c3"), { tasks: { c1: { start: {} } } }, { tasks: { c2: { complete: finish } } }, { tasks: { c3: { stop: {} } } }];
	t.eq(states(bare), ["c1:running", "c2:complete", "c3:stopped"], "the bare lines (the control)");
	t.eq(states(bare.map(mark)), states(bare), "the marked lines");
});

test.node("CloseoutWalk sees its own marked lines and does not file them twice", async t => {
	const { default: fs } = await import("node:fs"), { default: os } = await import("node:os"), { default: path } = await import("node:path");
	const { default: CloseoutWalk } = await import("../../../../Server/CloseoutWalk.mjs");
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "line-readers-cw-"));
	try {
		const folder = path.join(root, "session"); fs.mkdirSync(folder);
		const log = path.join(folder, "session.jsonl");
		fs.writeFileSync(log, show({ session: "S" }) + "\n" + show({ tasks: { add: { type: "Task", id: "n", title: "ask n", source: { session: "S", line: 10, part: "n" } } } }) + "\n");
		const ask = async () => ({ text: JSON.stringify({ verdicts: [{ id: "n", verdict: "noise", why: "a remark" }] }), usd: 0 });
		const walk = new CloseoutWalk("S", { located: { id: "S", folder, transcript: "none" }, root, ask, clock: () => Date.parse("2026-10-25T00:00:00Z") });
		await walk.run();
		t.eq(walk.apply().written, 1, "first pass files the one verdict");
		const lines = fs.readFileSync(log, "utf8").trim().split("\n").map(l => JSON.parse(l));
		fs.writeFileSync(log, lines.map(l => show(l.by === "closeout-walk" ? mark(l) : l)).join("\n") + "\n");
		t.ok(fs.readFileSync(log, "utf8").includes("#n"), "the filed line is now spelled #n / stop()");
		t.eq(walk.apply().written, 0, "second pass sees it and writes nothing");
	} finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test.node("TaskLoop reads who approved a task from a marked approve()", async t => {
	const { default: fs } = await import("node:fs"), { default: os } = await import("node:os"), { default: path } = await import("node:path");
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "line-readers-tl-"));
	process.env.SERVEX_HOME = dir; process.env.LEDGER_ROOT = dir;
	try {
		const { default: TaskLoop } = await import("../../../../Servex/TaskLoop.js");
		const loop = new TaskLoop({ root: dir, servex: {}, quiet_min: 9999 });
		const read = lines => { const f = path.join(dir, "task.jsonl"); fs.writeFileSync(f, lines.map(show).join("\n") + "\n"); return loop.read_task(f); };
		const bare = [{ assign: { title: "T", agent: "a-1" } }, { approve: {}, by: "owner" }, { start: {} }];
		const a = read(bare), b = read(bare.map(mark));
		t.eq(a.approved_by, "owner", "the bare line (the control)");
		t.eq(b.approved_by, a.approved_by, "the marked line");
		t.eq(b.task_state, a.task_state, "and the same state (" + a.task_state + ")");
	} finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test.node("Dropped.read, DatedFiles and TaskMigrate read marked lines like bare ones", async t => {
	const { default: fs } = await import("node:fs"), { default: os } = await import("node:os"), { default: path } = await import("node:path");
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "line-readers-misc-"));
	try {
		const { default: Dropped } = await import("../../../../Servex/Dropped.js");
		const { default: DatedFiles } = await import("../../../../Server/DatedFiles.mjs");
		const { default: TaskMigrate } = await import("../../../../Server/TaskMigrate.mjs");
		const write = (name, lines) => { const f = path.join(dir, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, lines.map(show).join("\n") + "\n"); return f; };

		const bare = [{ assign: { agent: "a", title: "T" } }, { tasks: { add: { id: "c1", type: "Task", title: "one" } } }, { tasks: { add: { id: "c2", type: "Task", title: "two" } } },
			{ tasks: { add: { id: "c3", type: "Task", title: "three" } } }, { tasks: { c1: { start: {} } } }, { tasks: { c2: { complete: finish } } }];
		const states = rec => rec && rec.task._tasks.map(k => k.id + ":" + k.state).join(",");
		const drop = new Dropped({ root: dir, servex: {} });
		t.eq(states(drop.read(write("d-marked/session.jsonl", bare.map(mark)))), states(drop.read(write("d-bare/session.jsonl", bare))), "Dropped: the same task states");

		const done = lines => DatedFiles.sessions.session_row(path.dirname(write("df/" + Math.random() + "/session.jsonl", lines)))?.state;
		t.eq(done([{ assign: { title: "S" } }, { "finish()": {} }]), done([{ assign: { title: "S" } }, { finish: {} }]), "DatedFiles: a finished session is done");

		const parsed = text => TaskMigrate.parse(text).lines;
		t.eq(parsed(bare.map(mark).map(show).join("\n")), parsed(bare.map(show).join("\n")), "TaskMigrate.parse hands back the bare spelling");
	} finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ---- the switch on: the main flows with Store.marked_lines = true ---------------------------------------------------------

test.node("with Store.marked_lines ON: a browser-style write, the item tool, a Task's verbs and a replay all agree", async t => {
	const { default: fs } = await import("node:fs"), { default: path } = await import("node:path"), { fileURLToPath } = await import("node:url");
	const { default: Task } = await import("../Task/Task.js");
	const { default: AIIndex } = await import("../../../../Server/AIIndex.mjs");
	const { run_item } = await import("../../../../Servex/agents/page_tools.js");
	const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
	const REL = "public/framework/ai/sessions/2026/10/22/.line-readers-" + process.pid, DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
	const read = () => fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
	Store.marked_lines = true;
	try {
		// 1. a browser-style write: a Session in a Store; the child's verb is saved marked, and a fresh Session replays it to the same state
		const session = new Session({ id: "s" }), lines = [];
		const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(session);
		session.set({ tasks: { add: { id: "c3", type: "Task", title: "T" } } });
		const child = session._tasks.find("c3");
		child.act("start");
		t.eq(lines.at(-1), { tasks: { "#c3": { "start()": {} } } }, "the browser writes the marked line");
		const again = new Session({ id: "s" }); lines.forEach(l => again.replay_line(l));
		t.eq(again._tasks.find("c3").state, "running", "a fresh Session replays it: running");

		// 2. a Task's verbs: start then complete are saved marked, and Task.replay and AIIndex.fold both end complete
		const task = new Task({ data: { title: "T" } }), saved = [{ assign: { title: "T" } }];
		const own = new Store({ url: "/x/" + Math.random() + ".jsonl" }); own.append = line => saved.push(line); own.attach(task);
		task.act("start");
		task.act("complete", finish);
		t.ok(saved.some(l => "start()" in l) && saved.some(l => "complete()" in l), "the verbs are saved as start() and complete(): " + show(saved.slice(1)));
		t.eq(Task.replay(saved).state, "complete", "Task.replay: complete");
		t.eq(AIIndex.fold(saved).state, "complete", "AIIndex.fold: complete");

		// 3. the item tool: it takes a marked delta and writes the bare spelling; a replay of the file is running
		fs.mkdirSync(DIR, { recursive: true });
		fs.writeFileSync(FILE, show({ assign: { slug: "lr", title: "LR" } }) + "\n");
		const r = await run_item({ path: "/" + REL.slice("public/".length) + "/", delta: { "start()": {} } }, { caller: "owner" });
		t.ok(r.ok, "run_item accepts start(): " + show(r.why));
		const file_lines = read();
		t.ok(file_lines.some(l => l.start) && !file_lines.some(l => "start()" in l), "and writes it bare: " + show(file_lines.at(-1)));
		t.eq(Task.replay(file_lines).state, "running", "a replay of the file is running");
		t.eq(AIIndex.fold(file_lines).state, "running", "AIIndex.fold agrees");
	} finally { Store.marked_lines = false; fs.rmSync(DIR, { recursive: true, force: true }); }
});
