// One saved line per user action (spec T2, persistence-sync object-model.md) and the source of every change (T1).
// Node: `node public/framework/core/Item/batch.test.mjs`.
//  1. Store.merge folds the data lines (set / unset) that name the same item into one; a verb line, or a line on the item's
//     ancestor or descendant, closes the fold, so the order a replay sees never changes.
//  2. A real page edit (a card's title and text, then the page's title) saves 2 lines, not 3; Task.wait() saves 1, not 7.
//     Each file replays to the same state as the live object.
//  3. item.batch(fn) holds the store until fn ends, also across an await: one line per item touched.
//  4. Every "change" event ends with {source}: "local" for code, "replay" while lines are replayed, "remote" for a line read live.
//  5. (edge) A reaction to a line read live (a "read" listener that sets data) saves nothing: the tab that wrote the line owns it.
import { register } from "node:module";
register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
const { test } = await import("../Test/Test.js");
const { default: Item } = await import("./Item.js");
const { default: Store } = await import("./Store.js");
const { default: List } = await import("../List/List.js");
const { default: Task } = await import("../Task/Task.js");
const { default: Page } = await import("../Page/Page.class.js");
await import("../Page/parts/kinds.js");

const J = x => JSON.stringify(x);
const tick = () => new Promise(r => setTimeout(r, 0));
let n = 0;
// A store whose flush really runs (as on localhost) and hands what it would send to `sent`; `queued` counts the lines before the fold.
const wired = host => {
	const store = new Store({ url: `/batch-test/${++n}.jsonl` }), sent = [], queued = [];
	Object.defineProperty(store, "writable", { value: true });
	store.deliver = async (path, lines) => { sent.push(...JSON.parse(J(lines))); return true; };
	const append = store.append.bind(store);
	store.append = line => { queued.push(line); return append(line); };
	store.attach(host);
	return { store, sent, queued };
};

test("Store.merge folds data lines per item and keeps every verb in place", t => {
	const m = lines => J(Store.merge(lines));
	t.eq(m([{ set: { a: 1 } }, { set: { b: 2 } }]), J([{ set: { a: 1, b: 2 } }]), "two sets on the host: one line");
	t.eq(m([{ k: { set: { a: 1 } } }, { j: { set: { b: 1 } } }, { k: { set: { c: 3 } } }]), J([{ k: { set: { a: 1, c: 3 } } }, { j: { set: { b: 1 } } }]), "two items: one line each");
	t.eq(m([{ set: { a: 1 } }, { unset: ["a"] }]), J([{ unset: ["a"] }]), "set then unset: the unset wins");
	t.eq(m([{ unset: ["a"] }, { set: { a: 2 } }]), J([{ set: { a: 2 } }]), "unset then set: the set wins");
	t.eq(m([{ set: { a: 1 } }, { start: {} }, { set: { b: 2 } }]), J([{ set: { a: 1 } }, { start: {} }, { set: { b: 2 } }]), "a verb between two sets keeps three lines");
	t.eq(Store.merge([{ k: { set: { x: 1 } } }, { set: { k: null } }, { k: { set: { y: 2 } } }]).length, 3, "a set on the parent between two sets on its child keeps them apart");
	const line = { set: { a: 1 } };
	Store.merge([line, { set: { b: 2 } }]);
	t.eq(J(line), J({ set: { a: 1 } }), "the lines handed in are not changed");
});

test("a real page edit saves one line per item, and replays the same", async t => {
	const page = Page.replay([{ title: "Notes" }]);
	page.content.add({ id: "card", type: "part-card", title: "A card", text: "Body." });
	const { sent, queued } = wired(page);
	// The edit: the owner renames a card and rewrites its text, then renames the page (one click handler).
	page.content.find("card").set({ title: "Renamed", text: "New body." });
	page.set({ title: "Notes, edited" });
	await tick();
	t.eq(queued.length, 3, "three changes were made (title, text, page title)");
	t.eq(sent.length, 2, "two lines saved: one for the card, one for the page");
	const back = Page.replay([{ title: "Notes" }, { content: { add: { id: "card", type: "part-card", data: { title: "A card", text: "Body." } } } }, ...sent]);
	t.eq(back.content.find("card")?.get("text"), "New body.", "replayed card text");
	t.eq(back.content.find("card")?.get("title"), "Renamed", "replayed card title");
	t.eq(back.get("title"), "Notes, edited", "replayed page title");
});

test("Task.wait() called directly saves one line, not seven", async t => {
	const task = Task.replay([{ id: "t1" }, { start: {} }]);
	const { sent, queued } = wired(task);
	task.wait({ on: "owner", what: "the merge" });
	await tick();
	t.ok(queued.length > 1, `wait() made ${queued.length} changes`);
	t.eq(sent.length, 1, "one line saved");
	const back = Task.replay([{ id: "t1" }, { start: {} }, ...sent]);
	t.eq(back.state, "waiting", "replayed state");
	t.eq(back.get("waiting_what"), "the merge", "replayed what");
});

test("batch(fn) holds the store until fn ends, also across an await", async t => {
	const a = new Item({ id: "a" });
	const { sent } = wired(a);
	await a.batch(async () => { a.set({ x: 1 }); await tick(); a.set({ y: 2 }); await tick(); a.set({ x: 3 }); });
	await tick();
	t.eq(J(sent), J([{ set: { x: 3, y: 2 } }]), "one line, the last value of x");
	a.batch(() => a.set({ z: 1 }));
	await tick();
	t.eq(sent.length, 2, "a sync batch flushes on the next tick");
});

test("every change event says where the change came from", t => {
	const seen = [];
	const a = new Item({ id: "a" });
	a.on("change", (key, value, old, meta) => seen.push(meta?.source));
	a.set({ x: 1 });
	t.eq(seen.at(-1), "local", "code: local");
	class Watched extends Item { constructor(...x){ super(...x); this.on("change", (k, v, o, meta) => seen.push(meta?.source)); } }
	Item.register(Watched, "BatchWatched");
	Watched.replay([{ id: "w" }, { set: { y: 1 } }]);
	t.eq(seen.at(-1), "replay", "a replay: replay");
	const b = new Item({ id: "b" }), store = new Store({ url: `/batch-test/${++n}.jsonl` });
	store.attach(b);
	b.on("change", (k, v, o, meta) => seen.push(meta?.source));
	store.read([{ set: { z: 1 } }]);
	t.eq(seen.at(-1), "remote", "a line read after the store attached: remote");
});

test.optional("edge: a reaction to a line read live saves nothing", async t => {
	const a = new Item({ id: "a" });
	const { store, sent } = wired(a);
	a.on("read", () => a.set({ derived: true }));
	store.read([{ set: { x: 1 } }]);
	await tick();
	t.eq(a.get("derived"), true, "the reaction ran");
	t.eq(sent.length, 0, "and saved nothing");
});
