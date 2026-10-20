// `static fields` is a code-only convenience (owner, 2026-10-03, second pass on
// the data decision): a name that collides with any real method, accessor or
// property already on the prototype chain must THROW at register() time, not
// be silently skipped. Run: node public/framework/core/Item/Item.test.mjs
import assert from "node:assert";
import Item from "./Item.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

// A fresh field name gets a working accessor.
class Foo extends Item { bar(){ return 1; } }
Foo.fields = ["title"];
Item.register(Foo, "Foo-test");
const f = new Foo({});
f.title = "x";
t(f.title === "x", "a declared field reads/writes through the accessor");
t(f.get("title") === "x", "get() sees the same value");

// A field name that collides with a real method throws, naming the class and
// the kind of thing it collided with.
class Bad extends Item { move(){ return 1; } }
Bad.fields = ["move"];
assert.throws(
	() => Item.register(Bad, "Bad-test"),
	/field "move" on Bad collides with method Bad\.move/,
	"a field colliding with a method throws, not silently skips",
);
n++;

// Re-registering the SAME class (its own prior accessor) is still safe —
// idempotent, not a collision.
assert.doesNotThrow(() => Item.register(Foo, "Foo-test"), "re-registering the same class does not throw");
n++;

// A subclass whose field collides with an INHERITED method (not just its own)
// also throws — the whole chain is checked, not just the class's own prototype.
class Base extends Item { shared(){ return 1; } }
class Sub extends Base {}
Sub.fields = ["shared"];
assert.throws(
	() => Item.register(Sub, "Sub-test"),
	/field "shared" on Sub collides with method Base\.shared/,
	"a field colliding with an inherited method throws too",
);
n++;

// A change from a child that has its OWN store belongs to that store: the parent's Store skips it.
{
	const { default: List } = await import("../List/List.js");
	const parent = new Foo({ id: "p" }), kid = new Foo({ id: "k" });
	parent.kids = new List({ owner: parent, name: "kids" });
	parent.kids.insert(kid);
	const seen = [];
	const mine = new Item.Store({ url: "/x/p.jsonl" }), theirs = new Item.Store({ url: "/x/k.jsonl" });
	mine.append = line => seen.push(line);
	mine.attach(parent);
	theirs.host = kid; kid.store = theirs;
	kid.set({ title: "own file" });
	t(seen.length === 0, "a child with its own store: the parent's Store appends nothing");
	parent.set({ title: "mine" });
	t(seen.length === 1, "a change on the parent itself is still appended");
	kid.store = undefined;
	kid.set({ title: "no store" });
	t(seen.length === 2, "a child with no store of its own still bubbles to the parent's Store");
}

// An item ADDED to a parent's List logs its deltas to the PARENT's store, with the child's id as the path;
// a reload (replay) of the parent's lines rebuilds the child. (doc/architecture.md, "Items save through their parent")
{
	const { default: List } = await import("../List/List.js");
	const lines = [];
	const store = new Item.Store({ url: "/x/parent.jsonl" });
	store.append = line => lines.push(line);
	const parent = new Foo({ id: "p" });
	store.attach(parent);
	parent.kids = new List({ owner: parent, name: "kids" });
	const kid = new Foo({ id: "k" });
	parent.kids.add(kid);
	kid.set({ title: "hello" });
	t(kid.parent === parent, "adding to a List makes the owner the child's parent");
	t(lines.length === 2, "the add and the child's later set both reached the parent's store");
	t(JSON.stringify(lines[1]) === '{"k":{"set":{"title":"hello"}}}', "the child's delta is nested under the child's id");

	const reloaded = new Foo({ id: "p" });
	reloaded.kids = new List({ owner: reloaded, name: "kids" });
	for (const line of lines) reloaded.replay_line(line);
	t(reloaded.kids.find("k")?.get("title") === "hello", "replaying the parent's lines rebuilds the child and its data");
}

// NOT built: item.set("prop", anotherItem) only stores a snapshot. The child is not adopted, so its later changes are not logged.
{
	const lines = [];
	const store = new Item.Store({ url: "/x/p2.jsonl" });
	store.append = line => lines.push(line);
	const parent = new Foo({ id: "p2" });
	store.attach(parent);
	const child = new Foo({ id: "c" });
	parent.set("child", child);
	child.set({ title: "lost" });
	t(lines.length === 1 && lines[0].set?.child?.id === "c", "set(prop, item) logs one snapshot line of the item");
	t(child.parent === undefined, "set(prop, item) does not adopt the child (known gap, core/Item/readme.md)");
	t(lines.length === 1, "so the child's later delta is NOT logged to the parent's store (known gap)");
}

console.log(`ok — ${n} assertions passed`);
