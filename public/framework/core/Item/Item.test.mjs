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
	t(JSON.stringify(lines[1]) === '{"kids":{"k":{"set":{"title":"hello"}}}}', "the child's delta names its list, then its id (every hop names its list)");

	const reloaded = new Foo({ id: "p" });
	reloaded.kids = new List({ owner: reloaded, name: "kids" });
	for (const line of lines) reloaded.replay_line(line);
	t(reloaded.kids.find("k")?.get("title") === "hello", "replaying the parent's lines rebuilds the child and its data");

	reloaded.replay_line({ k: { set: { title: "old line" } } });
	t(reloaded.kids.find("k").get("title") === "old line", "an old line that names the member by its id alone still replays");
	reloaded.replay_line({ "kids.k": { set: { title: "dotted" } } });
	t(reloaded.kids.find("k").get("title") === "dotted" && reloaded.get("kids.k") === reloaded.kids.find("k"), "a dotted path key walks the same hops, and get() reads the same path");
}

// Two lists on one owner, each with a member "s1" (seat a, E2): the edit lands on the right one, written and replayed.
{
	const { default: List } = await import("../List/List.js");
	const lines = [];
	const store = new Item.Store({ url: "/x/two.jsonl" });
	store.append = line => lines.push(line);
	const make = () => { const o = new Foo({ id: "o" }); o.a = new List({ owner: o, name: "a" }); o.b = new List({ owner: o, name: "b" }); return o; };
	const live = make();
	store.attach(live);
	live.a.add({ id: "s1", title: "sentence" });
	live.b.add({ id: "s1", title: "card" });
	live.b.find("s1").set({ title: "card edited" });
	const again = make();
	for (const line of JSON.parse(JSON.stringify(lines))) again.replay_line(line);
	t(again.a.find("s1").get("title") === "sentence" && again.b.find("s1").get("title") === "card edited", "a member of list b is edited in b on replay, never in a");
}

// item.set("prop", anotherItem) ADOPTS it (seat a, E7/E9): one line saves its shape, its later changes are written under the
// property's name, and a replay makes it an Item again that the next line walks into.
{
	const lines = [];
	const store = new Item.Store({ url: "/x/p2.jsonl" });
	store.append = line => lines.push(line);
	const parent = new Foo({ id: "p2" });
	store.attach(parent);
	const child = new Foo({ id: "c" });
	parent.set("child", child);
	child.set({ title: "kept" });
	t(lines.length === 2 && lines[0].set?.child?.id === "c", "set(prop, item) logs one line of the item, then its own change");
	t(child.parent === parent && child._slot === "child", "set(prop, item) adopts the child under the property's name");
	t(JSON.stringify(lines[1]) === '{"child":{"set":{"title":"kept"}}}', "the child's change is written under the property, not flat on the parent");
	const reloaded = new Foo({ id: "p2" });
	for (const line of JSON.parse(JSON.stringify(lines))) reloaded.replay_line(line);
	t(reloaded.get("child") instanceof Foo && reloaded.get("child").get("title") === "kept" && reloaded.get("title") === undefined, "replay makes it a Foo again, with its title, and leaves the parent's title alone");
}

// A field passed to the constructor lands in data, so a later set() of it is read back (it used to become a shadowing own property).
{
	const g = new Foo({ title: "first" });
	g.set({ title: "second" });
	t(g.title === "second" && g.get_one("title") === "second", "new Foo({title}) then set({title}) reads back the new title");
}

console.log(`ok — ${n} assertions passed`);
