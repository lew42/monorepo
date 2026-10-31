// The Item core's small safety fixes (Brief B part 1). `node public/framework/core/Item/item-core.test.mjs`
// Real Item, Task and Store; the Store's disk write is replaced by a list (`store.append`), nothing else is faked.
import Test from "../Test/Test.js";
import Item from "./Item.js";
import Store from "./Store.js";
import Task from "../Task/Task.js";

const t = new Test("core/Item: the core's safety fixes");
// Runs fn with console.warn and console.error captured; a throw out of fn is captured too (it is what a test wants to see).
const quiet = fn => { const w = console.warn, e = console.error, said = []; console.warn = console.error = (...a) => said.push(a.join(" ")); try { fn(); } catch (err){ said.push("THREW " + err.message); } finally { console.warn = w; console.error = e; } return said; };

// A store whose lines go into an array instead of a file.
const record = host => { const lines = []; const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(host); return lines; };

// 1a. A view listener that throws must not stop the save.
{
	const item = new Item({ id: "a" });
	const lines = record(item);
	item.on("change", () => { throw new Error("a view broke"); });
	const said = quiet(() => item.set({ title: "hello" }));
	t.ok(!said.some(s => s.startsWith("THREW")), "1a: set() does not throw because a view listener did");
	t.eq(item.get("title"), "hello", "1a: the value is set even though a view listener threw");
	t.eq(lines, [{ set: { title: "hello" } }], "1a: the line is still saved when a view listener throws");
	t.ok(said.some(s => s.includes("change")), "1a: the broken listener is reported by console, naming the event: " + JSON.stringify(said));
}

// 1b. act() mutes only the item it is called on (and what sits under it), not every Store.
{
	class Poker extends Item {
		poke(){ this.set({ poked: true }); this.other.set({ touched: "by a poke" }); }
	}
	const a = new Poker({ id: "a" }), other = new Item({ id: "other" });
	a.other = other;   // reached by the verb, not an argument (an argument would be the saved line)
	const a_lines = record(a), other_lines = record(other);
	a.act("poke");
	t.eq(a_lines, [{ poke: {} }], "1b: act saves the verb once, not the set lines the verb made");
	t.eq(other_lines, [{ set: { touched: "by a poke" } }], "1b: an unrelated item's write during act() is still saved");
	a.set({ after: 1 });
	t.eq(a_lines.at(-1), { set: { after: 1 } }, "1b: the mute is released after act()");
	// a child under the acting item is part of its tree: its changes are muted too
	class Parent extends Item { touch_child(){ this.child.set({ n: 1 }); } }
	const parent = new Parent({ id: "p" }); parent.child = new Item({ id: "kid" }); parent.child.parent = parent;
	const p_lines = record(parent);
	parent.act("touch_child");
	t.eq(p_lines, [{ touch_child: {} }], "1b: a change below the acting item is muted too (the verb is the one line)");
}

// 1c. set() refuses a value that cannot be saved (a function, a DOM node, a cycle), and says which key.
{
	const item = new Item({ id: "c" });
	const lines = record(item);
	const loop = { name: "loop" }; loop.self = loop;
	const fake_node = { nodeType: 1, nodeName: "DIV" };   // node has no DOM; a real browser Node has these two
	const said = quiet(() => {
		item.set({ handler: () => 1 });
		item.set({ deep: { list: [1, { fn(){} }] } });
		item.set({ loop });
		item.set({ el: fake_node });
	});
	t.eq(item.get("handler"), undefined, "1c: a function is not stored");
	t.eq(item.get("deep"), undefined, "1c: a function nested in an object or array is not stored");
	t.eq(item.get("loop"), undefined, "1c: a cycle is not stored");
	t.eq(item.get("el"), undefined, "1c: a DOM node is not stored");
	t.eq(lines, [], "1c: nothing refused reaches the file");
	for (const key of ["handler", "deep", "loop", "el"]) t.ok(said.some(s => s.includes(`"${key}"`)), `1c: a warning names the key "${key}"`);
	quiet(() => item.set({ plain: { a: [1, 2, { b: "c" }], n: null } }));
	t.eq(item.get("plain"), { a: [1, 2, { b: "c" }], n: null }, "1c: plain objects and arrays are fine");
	t.eq(lines, [{ set: { plain: { a: [1, 2, { b: "c" }], n: null } } }], "1c: and are saved");
	const child = new Item({ id: "kid" });
	quiet(() => item.set({ child }));
	t.ok(item.get("child") === child, "1c: an Item as a value is still adopted");
}

// 1e. A child's line replayed from its OWN file lets the parent derive its completion (old logs rely on it), but a replay never
// saves anything: before, the parent's store wrote the derived line again, in every tab that read the child's file.
{
	const parent = new Task({ id: "p", title: "parent" });
	const parent_lines = record(parent);
	parent.start();
	const kid = parent.tasks.add(new Task({ id: "k", title: "kid" }));
	parent_lines.length = 0;   // only what happens from here counts
	kid._own_file = "/x/k/";   // a child living in its own file (Task.from_ref sets this)
	const kid_store = new Store({ url: "/x/k/task.jsonl" });
	kid_store.append = () => {};
	kid_store.attach(kid);
	quiet(() => kid_store.read([{ start: {} }, { complete: { evidence: ["a test"], outcome: "done" } }]));
	t.eq(kid.state, "complete", "1e: the child's own file replayed (the child is complete)");
	t.eq(parent.state, "complete", "1e: the parent still derives its completion from the replayed child (old logs rely on it)");
	t.eq(parent_lines, [], "1e: but the parent's store saved nothing: a replay writes no line");
}

t.done();
