// The line format (D13), both shapes. `node public/framework/core/Item/line-format.test.mjs`
//   name       data, or a step into a child        {"title": "Hi"}
//   name()     call the method `name`              {"bump()": 2}
//   #id        the list item with that id          {"cards": {"#c1": {...}}}
// Old lines (bare method names, bare ids) still replay; new keys are read always. What act() and a list-item change WRITE is
// switched by Store.marked_lines (off by default until the readers named in doc/line-format.md are updated); both are tested.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import List from "../List/List.js";
import Store from "./Store.js";
import Task from "../Task/Task.js";

// Page: /framework/core/Test/view/?file=core/Item/line-format.test.mjs (the tool test needs node and is only listed there).
const quiet = fn => { const w = console.warn, said = []; console.warn = (...a) => said.push(a.join(" ")); try { fn(); } finally { console.warn = w; } return said; };
const record = host => { const lines = []; const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(host); return lines; };

class Counter extends Item {
	bumped = [];
	bump(n){ this.bumped.push(n); }
}
class Board extends Item {
	constructor(...args){ super(...args); this.cards = new List({ owner: this, name: "cards" }); }
}
Item.register(Counter, "Counter");
Item.register(Board, "Board");

// ---- reading the new keys ----
test("name() calls a method and #id picks a list item, and a wrong one is refused with a warning", t => {
	const c = new Counter({ id: "c" });
	c.set({ "bump()": 2 });
	t.eq(c.bumped, [2], "name() calls the method with the value");
	const said = quiet(() => c.set({ "nope()": 1 }));
	t.eq(c.get("nope()"), undefined, "name() with no such method is not stored as data");
	t.ok(said.some(s => s.includes("nope()")), "and a warning names it: " + JSON.stringify(said));
	t.eq(c.bumped, [2], "and nothing else ran");

	const b = new Board({ id: "b" });
	b.cards.add({ id: "c1", title: "one" });
	b.set({ cards: { "#c1": { title: "uno" } } });
	t.eq(b.cards.find("c1").get("title"), "uno", "{cards: {#c1: {...}}} sets that list item's data");
	b.cards.set({ "#c1": { title: "eins" } });
	t.eq(b.cards.find("c1").get("title"), "eins", "a list reads #id itself");
	b.set({ "#c1": { title: "un" } });
	t.eq(b.cards.find("c1").get("title"), "un", "an Item reads #id as a member of one of its lists");
	b.set({ cards: { "add()": { id: "c2", title: "two" } } });
	t.ok(b.cards.find("c2"), "a list item added by name(): {cards: {add(): {...}}}");
	quiet(() => b.set({ cards: { "#c2": { "bump()": 1, title: "deux" } } }));   // data and a call in one line; an Item has no bump(), so the call is refused and the data lands
	t.eq(b.cards.find("c2").get("title"), "deux", "data and a refused call in one line: the data still lands");
	const said2 = quiet(() => b.set({ cards: { "#zz": { title: "x" } } }));
	t.eq(b.get("#zz"), undefined, "#id with no such list item is not stored as data");
	t.ok(said2.some(s => s.includes("#zz")), "and a warning names it");
	t.eq(b.cards.length, 2, "and no member appeared");
	t.view(c, "the Counter");
	return b;
});

// ---- reading the old shapes ----
test.optional("edge: old lines (a bare method name, a bare id) still replay", t => {
	const c = new Counter({ id: "c" });
	c.set({ bump: 3 });
	t.eq(c.bumped, [3], "old: a bare method name is still called");
	const b = new Board({ id: "b" });
	b.cards.add({ id: "c1", title: "one" });
	b.set({ cards: { c1: { title: "uno" } } });
	t.eq(b.cards.find("c1").get("title"), "uno", "old: a bare id inside the list's own name still hops");
	Item.old_hops.clear();
	quiet(() => b.set({ c1: { title: "ein" } }));
	t.eq(b.cards.find("c1").get("title"), "ein", "old: a bare id hop with no list name still hops");
	t.eq(Item.old_hops.get("cards.c1"), 1, "old: and Item.old_hops counts it");
	b.cards.set({ c1: { set: { title: "um" } } });
	t.eq(b.cards.find("c1").get("title"), "um", "old: {id: {set: {...}}} on the list still works");
	return b;
});

// ---- strict reading: a bare key is always data (for after the old logs are migrated) ----
test.optional("edge: strict reading makes a bare key always data", t => {
	const was = Item.bare_calls;
	Item.bare_calls = false;
	try {
		const c = new Counter({ id: "c" });
		c.set({ bump: 3 });
		t.eq(c.bumped, [], "strict: a bare name is not a call");
		t.eq(c.get("bump"), 3, "strict: it is data, so a field named like a method can finally be saved");
		c.set({ "bump()": 4 });
		t.eq(c.bumped, [4], "strict: name() still calls");
	} finally { Item.bare_calls = was; }
	t.eq(was, true, "by default old bare method names are still read as calls");
});

// ---- writing: off by default (the old shape), on with Store.marked_lines ----
const written = (marked) => {
	const was = Store.marked_lines;
	Store.marked_lines = marked;
	try {
		const root = new Task({ id: "root", title: "root" });
		const lines = record(root);
		root.start();
		lines.length = 0;
		const kid = root.tasks.add({ id: "c3", title: "kid" });
		lines.length = 0;
		kid.set({ title: "renamed" });
		const changed = lines.splice(0);
		kid.act("start");
		return { root, kid, changed, acted: lines.splice(0) };
	} finally { Store.marked_lines = was; }
};
test("act() and a list-item change save the bare shape by default and the marked shape when switched on, and both replay", t => {
	const old = written(false);
	t.eq(old.changed, [{ tasks: { c3: { set: { title: "renamed" } } } }], "written (default): a list item's change names its id bare");
	t.eq(old.acted, [{ tasks: { c3: { start: {} } } }], "written (default): act() saves the bare verb");
	const marked = written(true);
	t.eq(marked.changed, [{ tasks: { "#c3": { set: { title: "renamed" } } } }], "written (marked): a list item's change names it #c3");
	t.eq(marked.acted, [{ tasks: { "#c3": { "start()": {} } } }], "written (marked): act() saves start()");

	// Each shape replays to the same tree.
	for (const [name, w] of [["default", old], ["marked", marked]]){
		const lines = [{ id: "root", title: "root" }, { start: {} }, { tasks: { add: { id: "c3", title: "kid" } } }, ...w.changed, ...w.acted];
		const again = Task.replay(lines);
		t.eq(again.tasks.find("c3").get("title"), "renamed", `${name}: the replayed list item has the change`);
		t.eq(again.tasks.find("c3").state, "running", `${name}: and the replayed verb ran`);
	}
	// A top-level verb line, marked, on a Task and in a tape
	t.eq(Task.replay([{ id: "x", title: "x" }, { "start()": {} }]).state, "running", "a Task replays a marked verb line {start(): {}}");
	const nested = Task.replay([{ id: "x", title: "x" }, { tasks: { "add()": { id: "k", title: "k" } } }, { tasks: { "#k": { "start()": {} } } }]);
	t.eq(nested.tasks.find("k")?.state, "running", "a Task replays {tasks: {#k: {start(): {}}}}");
	t.view({ "written, default": [...old.changed, ...old.acted], "written, marked": [...marked.changed, ...marked.acted] }, "the saved lines, both shapes");
	return nested;
});

// ---- the item tool (Servex/agents/page_tools.js) takes the marks at its door and writes the bare spelling ----
test.node("the item tool takes the marks at its door and writes the bare spelling", async t => {
	const { default: fs } = await import("node:fs");
	const { default: path } = await import("node:path");
	const { fileURLToPath } = await import("node:url");
	const { run_item } = await import("../../../../Servex/agents/page_tools.js");
	const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
	const REL = "public/framework/ai/sessions/2026/10/22/.line-format-test-" + process.pid;
	const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl"), url = "/" + REL.slice("public/".length) + "/";
	fs.mkdirSync(DIR, { recursive: true });
	fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "lf", title: "Line format" } }) + "\n");
	try {
		const added = await run_item({ path: url, delta: { tasks: { "add()": { id: "k1", title: "kid" } } } }, { caller: "owner" });
		t.ok(added.ok, "the tool accepts {tasks: {add(): {...}}}: " + JSON.stringify(added.why));
		const started = await run_item({ path: url, delta: { "start()": {} } }, { caller: "owner" });
		t.ok(started.ok, "the tool accepts {start(): {}}: " + JSON.stringify(started.why));
		const kid_started = await run_item({ path: url, delta: { tasks: { "#k1": { "start()": {} } } } }, { caller: "owner" });
		t.ok(kid_started.ok, "the tool accepts {tasks: {#k1: {start(): {}}}}: " + JSON.stringify(kid_started.why));
		const lines = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
		t.ok(lines.some(l => l.start) && lines.every(l => !JSON.stringify(Object.keys(l)).includes("()")), "and writes the bare spelling it always wrote");
		const again = Task.replay(lines);
		t.eq([again.state, again.tasks.find("k1")?.state], ["running", "running"], "a fresh replay of that file has both running");
	} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
});
