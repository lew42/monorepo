// Node test for the Events / List / LiveList / Item / Store chain — no DOM, no
// server. Run: `node test.mjs`. Prints one pass/fail line per claim and exits 1 if
// anything failed.
import Events from "../../../../core/Events/Events.js";
import List from "../../../../core/List/List.js";
import LiveList from "../../../../core/List/LiveList.js";
import Item from "../../../../core/Item/Item.js";
import Store from "../../../../core/Item/Store.js";

const results = [];
function check(label, fn){
	try {
		const ok = fn();
		results.push([label, !!ok]);
	} catch (e){
		results.push([label, false, e.stack || e.message]);
	}
}

// ════ Events: on / off / emit / bubble, and bubbles() as a boundary ═══════════

check("emit calls a listener bound on the same object", () => {
	const a = new (Events(Object))();
	let heard;
	a.on("x", v => heard = v);
	a.emit("x", 1);
	return heard === 1;
});

check("emit bubbles the same event to .parent", () => {
	const a = new (Events(Object))(), b = new (Events(Object))();
	b.parent = a;
	let heard;
	a.on("x", v => heard = v);
	b.emit("x", 2);
	return heard === 2;
});

check("off() removes exactly that listener", () => {
	const a = new (Events(Object))();
	let n = 0;
	const fn = () => n++;
	a.on("x", fn).on("x", () => n++);
	a.off("x", fn);
	a.emit("x");
	return n === 1;
});

check("bubbles() false stops the climb at that object", () => {
	class Boundary extends Events(Object) { bubbles(){ return false; } }
	const top = new (Events(Object))();
	const wall = new Boundary();
	const leaf = new (Events(Object))();
	wall.parent = top; leaf.parent = wall;

	let heardTop = 0, heardWall = 0;
	top.on("x", () => heardTop++);
	wall.on("x", () => heardWall++);
	leaf.emit("x");
	return heardWall === 1 && heardTop === 0;
});

// ════ List: plain data, no events ══════════════════════════════════════════════

check("List: append/insert_before/remove, length, iteration, find, index_of, toJSON", () => {
	const list = new List();
	const a = { id: "a" }, b = { id: "b" }, c = { id: "c" };
	list.append(a).append(c).insert_before(b, c);
	const order = [...list].map(x => x.id).join(",");
	if (order !== "a,b,c") return false;
	if (list.length !== 3) return false;
	if (list.find(x => x.id === "b") !== b) return false;
	if (list.index_of(c) !== 2) return false;
	list.remove(b);
	if ([...list].map(x => x.id).join(",") !== "a,c") return false;
	// Not a straight JSON.stringify(list) here: `adopt()` on an owner-LESS list
	// parents each child to the LIST ITSELF (see the test right below this one), so
	// `a.parent === list` and comparing the two whole structures would walk into
	// that cycle. toJSON() on a List is still just the plain array of members.
	return list.toJSON().map(x => x.id).join(",") === "a,c";
});

check("List: forEach / map / at", () => {
	const list = new List();
	[1, 2, 3].forEach(n => list.append({ id: String(n), n }));
	let sum = 0;
	list.forEach(x => sum += x.n);
	const doubled = list.map(x => x.n * 2).join(",");
	return sum === 6 && doubled === "2,4,6" && list.at(1).n === 2;
});

check("List.adopt sets parent to the owner, or the list itself with none", () => {
	const owned = new List({ owner: { name: "owner" } });
	const kid = {};
	owned.append(kid);
	if (kid.parent?.name !== "owner") return false;

	const bare = new List();
	const kid2 = {};
	bare.append(kid2);
	return kid2.parent === bare;
});

// ════ LiveList: the live verbs ═════════════════════════════════════════════════

function fresh_list(){
	// A minimal stand-in for the Item that would really own this list — just
	// enough surface (`lists`, `emit`, `bubbles`) for LiveList's own bubbling and
	// `Item.remove()`-style lookups to work without constructing a whole Item.
	const owner = { id: "owner", lists(){ return { items: list }; }, emit(){ return owner; }, bubbles(){ return true; } };
	const list = new LiveList({ owner, name: "items" });
	return list;
}

check("add(): after absent appends", () => {
	const list = fresh_list();
	list.add({ id: "a" });
	list.add({ id: "b" });
	return [...list].map(x => x.id).join(",") === "a,b";
});

check("add(): after null puts it first", () => {
	const list = fresh_list();
	list.add({ id: "a" });
	list.add({ id: "b" }, { after: null });
	return [...list].map(x => x.id).join(",") === "b,a";
});

check("add(): after an id lands right after it", () => {
	const list = fresh_list();
	list.add({ id: "a" });
	list.add({ id: "b" });
	list.add({ id: "c" }, { after: "a" });
	return [...list].map(x => x.id).join(",") === "a,c,b";
});

check("add(): an unknown after id appends", () => {
	const list = fresh_list();
	list.add({ id: "a" });
	list.add({ id: "b" }, { after: "nope" });
	return [...list].map(x => x.id).join(",") === "a,b";
});

check("add(): an id already present is a no-op and announces nothing", () => {
	const list = fresh_list();
	let adds = 0;
	list.on("add", () => adds++);
	list.add({ id: "a", data: { n: 1 } });
	list.add({ id: "a", data: { n: 2 } });
	return adds === 1 && list.length === 1 && list.at(0).data.n === 1;
});

check("remove(): by id, and by the member itself", () => {
	const list = fresh_list();
	list.add({ id: "a" }); list.add({ id: "b" });
	list.remove("a");
	if (list.length !== 1) return false;
	list.remove(list.at(0));
	return list.length === 0;
});

check("move(): reorders within the same list", () => {
	const list = fresh_list();
	list.add({ id: "a" }); list.add({ id: "b" }); list.add({ id: "c" });
	list.move("c", { after: null });
	return [...list].map(x => x.id).join(",") === "c,a,b";
});

check("move(): crosses lists via `from`, quietly on the source", () => {
	const from = fresh_list(), to = fresh_list();
	const a = from.add({ id: "a" });
	let fromRemoves = 0, toMoves = 0;
	from.on("remove", () => fromRemoves++);
	to.on("move", () => toMoves++);
	to.move(a, { from, after: undefined });
	return fromRemoves === 0 && toMoves === 1 && from.length === 0 && to.length === 1 && to.at(0) === a;
});

check("order(): listed ids win; an unlisted id keeps its place after its old neighbour", () => {
	const list = fresh_list();
	["a", "b", "c", "d"].forEach(id => list.add({ id }));
	list.order(["c", "a"]);   // b was after a, d was after c — both unlisted
	return [...list].map(x => x.id).join(",") === "c,d,a,b";
});

check("order(): unknown ids in the line are dropped quietly", () => {
	const list = fresh_list();
	["a", "b"].forEach(id => list.add({ id }));
	list.order(["b", "ghost", "a"]);
	return [...list].map(x => x.id).join(",") === "b,a";
});

check("each change emits a line-shaped event, plus one uniform delta", () => {
	const list = fresh_list();
	const lines = [];
	list.on("add", line => lines.push(line));
	let deltas = 0;
	list.on("delta", () => deltas++);
	list.add({ id: "a", text: "hi" });
	const line = lines[0];
	return deltas === 1 && line.add?.id === "a" && line.add.after === null && line.add.text === "hi";
});

check("quiet insert() and replace() never emit", () => {
	const list = fresh_list();
	let n = 0;
	list.on("add", () => n++).on("delta", () => n++);
	const a = list.insert({ id: "a" });
	list.replace(a, { id: "a2" });
	return n === 0 && list.length === 1 && list.at(0).id === "a2";
});

// ════ Item: no list methods of its own ═════════════════════════════════════════

check("Item has no add/move/order — lists live on their own named property", () => {
	const item = new Item({ data: {} });
	return item.add === undefined && item.move === undefined && item.order === undefined;
});

check("set() sugar: set(k, v) === set({k: v})", () => {
	const item = new Item({ data: {} });
	item.set("title", "Hi");
	return item.get("title") === "Hi";
});

check("set() emits change only on a real change", () => {
	const item = new Item({ data: {} });
	let n = 0;
	item.on("change", () => n++);
	item.set("n", 1);
	item.set("n", 1);
	item.set("n", 2);
	return n === 2;
});

check("a key naming a method calls it with the value", () => {
	class Thing extends Item { ping(v){ this.pinged = v; } }
	const t = new Thing({ data: {} });
	t.set({ ping: 7 });
	return t.pinged === 7;
});

check("a nested delta reaches a named LiveList property's own set()", () => {
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	host.set({ content: { add: { id: "a", text: "hi" } } });
	return host.content.length === 1 && host.content.at(0).get("text") === "hi";
});

check('"at" locates a path and sets the rest there', () => {
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	host.content.add({ id: "a", text: "hi" });
	host.set({ at: "content/a", set: { text: "bye" } });
	return host.content.at(0).get("text") === "bye";
});

check('"at" to an unknown path warns once and ignores the line, never throws', () => {
	const host = new Item({ id: "root", data: {} });
	host.set({ at: "nowhere/x", set: { text: "bye" } });
	return true;   // didn't throw
});

// ════ Store: one line per live change, nothing during replay ══════════════════

function stub_store(){
	const store = new Store({ url: "test://stub" });
	store.lines = [];
	store.append = line => store.lines.push(line);
	Object.defineProperty(store, "writable", { value: true });
	return store;
}

check("a plain data change on the host records with no `at`", () => {
	const host = new Item({ id: "root", data: {} });
	const store = stub_store();
	store.attach(host);
	host.set("title", "Doc");
	return store.lines.length === 1 && store.lines[0].at === undefined && store.lines[0].set.title === "Doc";
});

check("a change on a named list records with `at` = the list's own name", () => {
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	const store = stub_store();
	store.attach(host);
	host.content.add({ id: "a", text: "hi" });
	const line = store.lines.at(-1);
	return line.at === "content" && line.add.id === "a";
});

check("one line per live change at any depth (a grandchild's own change)", () => {
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	const a = host.content.add({ id: "a", text: "hi" });
	a.replies = new LiveList({ owner: a, name: "replies" });
	const b = a.replies.add({ id: "b", text: "yo" });

	const store = stub_store();
	store.attach(host);
	const before = store.lines.length;
	b.set("text", "yo!");
	const added = store.lines.slice(before);
	return added.length === 1 && added[0].at === "content/a/replies/b" && added[0].set.text === "yo!";
});

check("a cross-list move records `from` as a path, not a live object", () => {
	const host = new Item({ id: "root", data: {} });
	host.a_list = new LiveList({ owner: host, name: "a_list" });
	host.b_list = new LiveList({ owner: host, name: "b_list" });
	const kid = host.a_list.add({ id: "k" });

	const store = stub_store();
	store.attach(host);
	host.b_list.move(kid, { from: host.a_list, after: undefined });
	const line = store.lines.at(-1);
	return line.at === "b_list" && line.move.from === "a_list" && line.move.id === "k";
});

check("nothing is recorded while a store is replaying", () => {
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	const store = stub_store();
	store.attach(host);

	store.read([{ at: "content", add: { id: "a", text: "hi" } }]);
	return store.lines.length === 0 && host.content.length === 1;
});

// A class that gives ITSELF a child list in its own constructor — the real pattern
// (Page will do the same for `pages`/`content`). This is what lets `a.replies` come
// back automatically on replay: `Item.hydrate()` calls `new Thread(...)`, which runs
// this constructor exactly the way the live `new Thread(...)` did.
class Thread extends Item {
	constructor(...args){ super(...args); this.replies = new LiveList({ owner: this, name: "replies" }); }
}
Item.register(Thread, "Thread");

function build_doc(){
	const host = new Item({ id: "root", data: {} });
	host.content = new LiveList({ owner: host, name: "content" });
	return host;
}

check("replaying the recorded lines into a fresh host gives the same toJSON()", () => {
	const live = build_doc();
	const store = stub_store();
	store.attach(live);

	live.set("title", "Doc 2");
	const a = live.content.add({ id: "a", type: "Thread", text: "hi" });
	a.replies.add({ id: "b", text: "yo" });
	live.content.add({ id: "c" });
	live.content.move("c", { after: null });
	live.content.order(["a", "c"]);

	const fresh = build_doc();
	store.lines.forEach(line => fresh.set(line));

	return JSON.stringify(fresh) === JSON.stringify(live);
});

// A cross-list move replays: the line's `from` path is resolved back to the live
// list (the line form of LiveList.move, 2026-10-02).
check("a cross-list move replays into a fresh host", () => {
	const build = () => {
		const host = new Item({ id: "root", data: {} });
		host.a_list = new LiveList({ owner: host, name: "a_list" });
		host.b_list = new LiveList({ owner: host, name: "b_list" });
		return host;
	};
	const live = build();
	const store = stub_store();
	store.attach(live);
	const kid = live.a_list.add({ id: "k" });
	live.b_list.add({ id: "j" });
	live.b_list.move(kid, { from: live.a_list, after: "j" });

	const fresh = build();
	new Store({ url: "test://fresh" }).attach(fresh);   // so `from` finds its host
	store.lines.forEach(line => fresh.set(line));
	return JSON.stringify(fresh) === JSON.stringify(live) && fresh.a_list.length === 0 && fresh.b_list.at(1).id === "k";
});

// The LiveList teaching examples (core/List/LiveList.examples.js): the same array
// the List page shows, run here as tests.
const { default: examples } = await import("../../../../core/List/LiveList.examples.js");
for (const example of examples) check("example: " + example.title, () => { example.run(); return true; });

// ════ Report ════════════════════════════════════════════════════════════════

let fails = 0;
for (const [label, ok, detail] of results){
	console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
	if (!ok){ fails++; if (detail) console.log("     " + detail.split("\n").join("\n     ")); }
}
console.log(`\n${results.length - fails} / ${results.length} passing`);
process.exit(fails ? 1 : 0);
