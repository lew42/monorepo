// A button's verb is saved as a verb. Node: `node public/framework/core/Item/act.test.mjs`.
// Browser: /framework/core/Test/view/?file=core/Item/act.test.mjs (one block per test, the Task and Store drawn open).
//  1. (node only) run_item as the owner writes {"start":{},"by":"owner","ts":…}; a fresh Task.replay of the file is running.
//  2. Item.act on a Task emits exactly one delta {start:{}} to a Store and none for the `state` set.
//  3. (edge) a refused verb emits nothing.   4. (edge) Store.skip_echo ignores by/ts.
import { test } from "../Test/Test.js";
import Task from "../Task/Task.js";
import Store from "./Store.js";

test.node("run_item writes the owner's verb to the task file, and a fresh replay is running", async t => {
	const { default: fs } = await import("node:fs");
	const { default: path } = await import("node:path");
	const { fileURLToPath } = await import("node:url");
	const { run_item } = await import("../../../../Servex/agents/page_tools.js");
	const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
	const REL = "public/framework/ai/sessions/2026/10/22/.act-test-" + process.pid;
	const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
	fs.mkdirSync(DIR, { recursive: true });
	fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "act", title: "Act" } }) + "\n");
	try {
		const r = await run_item({ path: "/" + REL.slice("public/".length) + "/", delta: { start: {} } }, { caller: "owner" });
		t.ok(r.ok, "run_item answers ok: " + JSON.stringify(r.why));
		const lines = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
		const line = lines.find(l => l.start);
		t.ok(line && line.by === "owner" && line.ts, "the verb line is stamped by owner + ts");
		t.ok(Task.replay(lines).state === "running", "a fresh replay is running");
	} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
});

test("act on a Task saves the verb once, and a Store records only the verb", t => {
	const task = new Task({ data: { title: "t" } });
	t.view(task, "the task");
	const seen = [];
	task.on("delta", (d, origin) => seen.push({ d, origin }));
	task.act("start");
	t.ok(task.state === "running", "act ran the verb locally");
	const verbs = seen.filter(x => x.d.start);
	t.ok(verbs.length === 1 && JSON.stringify(verbs[0].d) === "{\"start\":{}}" && verbs[0].origin === task, "exactly one {start:{}} delta, origin the task");

	// A Store attached records the verb only (not the state set).
	const store = new Store({ url: "/x/task.jsonl" }), queued = [];
	store.append = l => queued.push(l);
	const t2 = new Task({ data: { title: "t2" } });
	store.attach(t2);
	t.view(t2, "a task with a store attached");
	t2.act("start");
	t.ok(queued.length === 1 && JSON.stringify(queued[0]) === '{"start":{}}', "the store got only the verb line: " + JSON.stringify(queued));
	t2.set({ title: "other" });
	t.ok(queued.length === 2 && queued[1].set?.title === "other", "a plain set still records its state (Store.muted back to 0)");
	return t2;
});

test.optional("edge: a refused verb emits nothing", t => {
	const task = new Task({ data: { title: "t" } });
	const seen = [];
	task.on("delta", d => seen.push(d));
	task.act("start");
	const before = seen.filter(d => d.start).length;
	task.act("start");   // already running
	t.ok(seen.filter(d => d.start).length === before, "a refused verb emits nothing");
	return task;
});

test.optional("edge: the store's echo skip ignores by/ts", t => {
	const s = new Store({ url: "/x/task.jsonl" });
	(s.sent ??= []).push('{"start":{}}');
	t.ok(s.skip_echo({ start: {}, by: "owner", ts: "2026-10-22T00:00:00Z" }), "the echo with by/ts is skipped");
});

// A verb on a child makes its parent derive a consequence (the last child completing completes the parent). That derived change is
// the verb's effect, so it is not saved either: the file gets the child's verb and nothing else (review finding 2).
test("act on the last child saves the child's verb only, not the parent's derived completion", t => {
	const parent = Task.replay([{ id: "p", title: "parent" }, { tasks: { add: { id: "c1", title: "kid" } } }]);
	const store = new Store({ url: "/x/task.jsonl" }), queued = [];
	store.append = l => queued.push(l);
	store.attach(parent);
	parent.act("start");
	queued.length = 0;
	const kid = parent.tasks.find("c1");
	kid.act("complete", { auto: true });
	t.eq(kid.state, "complete", "the child completed");
	t.eq(parent.state, "complete", "and the parent derived its own completion, in memory");
	t.eq(queued, [{ tasks: { c1: { complete: { auto: true } } } }], "the store got the child's verb and no line for the parent's derived change");
	const again = Task.replay([{ id: "p", title: "parent" }, { tasks: { add: { id: "c1", title: "kid" } } }, { start: {} }, ...queued]);
	t.eq(again.state, "complete", "and a replay of the saved lines derives the same completion");
	t.view(parent, "the parent after its last child completed");
	return parent;
});

test.optional("edge: a write to an unrelated item during a verb is still saved, and so is a write to the parent afterwards", t => {
	const parent = Task.replay([{ id: "p", title: "parent" }, { tasks: { add: { id: "c1", title: "kid" } } }, { tasks: { add: { id: "c2", title: "kid 2" } } }]);
	const store = new Store({ url: "/x/task.jsonl" }), queued = [];
	store.append = l => queued.push(l);
	store.attach(parent);
	const stranger = new Task({ data: { title: "stranger" } }), theirs = new Store({ url: "/x/other.jsonl" }), other = [];
	theirs.append = l => other.push(l);
	theirs.attach(stranger);
	parent.tasks.find("c1").on("change", () => stranger.set({ saw: "it" }));   // a view-like listener: an unrelated item written during the verb
	parent.tasks.find("c1").act("start");
	t.eq(other, [{ set: { saw: "it" } }], "an unrelated item's write during the verb is saved");
	queued.length = 0;
	parent.set({ title: "renamed" });
	t.eq(queued, [{ set: { title: "renamed" } }], "after the verb the parent saves its own writes again (the mute was released)");
	return parent;
});
