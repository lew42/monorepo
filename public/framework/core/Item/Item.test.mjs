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
	t(JSON.stringify(lines[1]) === '{"kids":{"#k":{"set":{"title":"hello"}}}}', "the child's delta names its list, then its id (every hop names its list)");

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

// The plan review (2026-10-28): (1) a member id that spells a method; (2) a List kept behind a getter; (9) a move's `from` is dotted.
{
	const { default: List } = await import("../List/List.js");
	const lines = [];
	const store = new Item.Store({ url: "/x/review.jsonl" });
	store.append = line => lines.push(line);
	class Holder extends Item {   // its lists live behind getters, like Page's `pages` and Task's `tasks`
		get kids(){ return this._kids ??= new List({ owner: this, name: "kids" }); }
		get done(){ return this._done ??= new List({ owner: this, name: "done" }); }
		constructor(...a){ super(...a); void this.kids; void this.done; }
	}
	Item.register(Holder, "Holder-test");
	const live = new Holder({ id: "h" });
	store.attach(live);
	for (const id of ["save", "root", "at"]) live.kids.add({ id, title: id });
	live.kids.find("save").set({ title: "saved" });
	live.done.move("root", { after: null, from: live.kids });
	t(JSON.stringify(lines.at(-2)) === '{"kids":{"#save":{"set":{"title":"saved"}}}}', "(1) a member named \"save\" is written under its list like any other");
	t(lines.at(-1).done?.move?.from === "kids", "(9) a cross-list move writes its `from` as a dotted path (here one name)");

	const again = new Holder({ id: "h" });
	for (const line of JSON.parse(JSON.stringify(lines))) again.replay_line(line);
	t(again.kids.find("save")?.get("title") === "saved", "(1) replay walks into the member \"save\" instead of calling the method save()");
	t(again.done.find("root") && !again.kids.find("root"), "(9) the dotted `from` replays: root moved from kids to done");
	t(again.get("kids") === again.kids && again.data.kids === undefined, "(2) get(\"kids\") finds a List kept behind a getter, so its lines never land as data");
	again.replay_line({ kids: { remove: "at" } });
	t(!again.kids.find("at"), "(1) a list verb is still a verb: {\"kids\":{\"remove\":\"at\"}}");
	again.replay_line({ done: { move: { id: "save", after: null, from: "kids" } } });
	again.replay_line({ kids: { move: { id: "save", after: null, from: "done" } } });
	t(again.kids.find("save"), "(9) a one-name `from` reads the same either way");
}

// (2) with the real Page: a {"pages":{"add":…}} line reaches page.pages on replay (seat g, B7), not page data.
{
	const { register } = await import("node:module");
	register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
	const { default: Page } = await import("../Page/Page.class.js");
	const page = Page.replay([{ title: "P" }, { pages: { add: { id: "kid", name: "kid", stub: true } } }]);
	t(page.pages.find("kid") && page.data.pages === undefined, "(2) a page's {\"pages\":{\"add\":…}} line adds a sub-page on replay");
}

// A registered class that is not an Item (View): hydrate keeps a plain Item wearing its type, and it saves the same line back.
{
	await import("../List/List.js");
	const page = Item.hydrate({ id: "p", content: [{ id: "hello-div", type: "View", content: "Hello world" }] });
	const kid = page.content.items[0];
	t(Item.types.has("View") && kid.constructor === Item && kid.wire() === "View", "a {type:\"View\"} member hydrates as a plain Item named View");
	t(JSON.stringify(kid.toJSON()) === '{"type":"View","id":"hello-div","data":{"content":"Hello world"}}', "it saves back the same type and data");
	t(Item.foreign(new Item({})) === null, "Item.foreign builds nothing for an ordinary Item");
}

// page.items: embedded vs file vs path, and dedup (one object per url, Item.open — Ref.test.mjs covers the cross-file read itself).
{
	const fs = await import("node:fs");
	const os = await import("node:os");
	const path = await import("node:path");
	const http = await import("node:http");
	const { default: List } = await import("../List/List.js");

	const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "item-items-test-"));
	const write = (file, lines) => { fs.mkdirSync(path.dirname(path.join(DIR, file)), { recursive: true }); fs.writeFileSync(path.join(DIR, file), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
	const server = http.createServer((req, res) => {
		const file = path.join(DIR, decodeURIComponent(new URL(req.url, "http://x").pathname));
		if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); return res.end(); }
		res.writeHead(200, { "content-type": "application/x-ndjson" });
		res.end(fs.readFileSync(file));
	});
	await new Promise(ok => server.listen(0, "127.0.0.1", ok));
	const BASE = `http://127.0.0.1:${server.address().port}`;

	write("page-a/thing.jsonl", [{ title: "Thing" }]);
	write("page-a/sub/page.jsonl", [{ title: "Sub" }]);

	const page = Item.hydrate({ id: "pg", title: "Page", items: [] });
	page.url = BASE + "/page-a/";
	const embedded = page.items.add({ title: "Note" });
	t(embedded.file_url() === null, "page.items: neither file nor path = embedded (no file_url)");
	t((await embedded.load()) === embedded, "and load() answers the item itself (a Promise, like a file member's)");

	const byFile = page.items.add({ file: "thing.jsonl" });
	t(byFile.default_id() === "thing", "default_id(): the file name, minus .jsonl (Page.items uses it as the id; Page.test)");
	t(byFile.file_url() === BASE + "/page-a/thing.jsonl", "file resolves against the folder of the page that lists it (this.parent), not root()");
	const loadedA = await byFile.load();
	t(loadedA.get_one("title") === "Thing", "load() opens that file's root");

	const byPath = page.items.add({ path: "sub" });
	t(byPath.default_id() === "sub", "path-only: default_id() is the path's last segment");
	t(byPath.file_url() === BASE + "/page-a/sub/page.jsonl", "path alone means <path>/page.jsonl");

	// Dedup: a second page listing the SAME file gets the SAME live object (Item.open, one Store per url).
	const page2 = Item.hydrate({ id: "pg2", title: "Page 2", items: [] });
	page2.url = BASE + "/page-a/";
	const also = page2.items.add({ file: "thing.jsonl" });
	const loadedB = await also.load();
	t(loadedA === loadedB, "two pages that list the same file share one loaded object (dedup)");

	server.close();
	fs.rmSync(DIR, { recursive: true, force: true });
}

console.log(`ok — ${n} assertions passed`);
