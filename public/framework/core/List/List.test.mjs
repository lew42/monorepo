// List: add, remove, move and order each survive a save and a replay. Plain node: `node public/framework/core/List/List.test.mjs`
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../Test/Test.js";
import Item from "../Item/Item.js";
import Store from "../Item/Store.js";
import "./List.js";

const t = new Test("core/List");
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "list-test-"));
const FILE = path.join(DIR, "list.jsonl");
const base = () => ({ id: "root", title: "Root", kids: [{ id: "a" }, { id: "b" }, { id: "c" }] });
const ids = root => [...root.kids].map(k => k.id);
const lines = () => fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];

// Each step: do it on a live root whose Store appends to FILE, then replay FILE onto a fresh root and compare.
const root = Item.hydrate(base());
const store = new Store({ url: "/list.jsonl" });
store.append = line => fs.appendFileSync(FILE, JSON.stringify(line) + "\n");
store.attach(root);

const replayed = () => {
	const fresh = Item.hydrate(base());
	const reader = new Store({ url: "/list.jsonl" });
	reader.read(reader.parse(fs.readFileSync(FILE, "utf8")));
	reader.attach(fresh);
	return fresh;
};
const step = (name, fn, want) => {
	const before = lines().length;
	fn();
	t.eq(lines().length, before + 1, `${name}: exactly one line saved`);
	t.eq(ids(root), want, `${name}: live order`);
	t.eq(ids(replayed()), want, `${name}: replay rebuilds the same order`);
};

try {
	step("add", () => root.kids.add({ id: "d" }), ["a", "b", "c", "d"]);
	step("add after", () => root.kids.add({ id: "e" }, { after: "a" }), ["a", "e", "b", "c", "d"]);
	step("remove", () => root.kids.remove("b"), ["a", "e", "c", "d"]);
	step("move", () => root.kids.move("d", { after: null }), ["d", "a", "e", "c"]);
	step("order", () => root.kids.order(["c", "e", "a", "d"]), ["c", "e", "a", "d"]);
	t.eq(JSON.stringify(replayed()), JSON.stringify(root), "the whole replayed root equals the live one");

	// add([a, b]) adds two members (fixed on worktree/qf-5; fails on michael/dev until that merges)
	const pair = Item.hydrate({ id: "p", kids: [] });
	pair.kids.add([{ id: "x" }, { id: "y" }]);
	t.eq(ids(pair), ["x", "y"], "add([a, b]) adds two members");

	// Phase 0 fix 5 (T3/T4, fixes.md): add() writes an envelope {id, type, data, <lists>}, not flat data — a data field named
	// "after" or "type" must not clobber the list's own metadata, and a child list must survive the round trip.
	{
		const DIR2 = fs.mkdtempSync(path.join(os.tmpdir(), "list-test-envelope-"));
		const FILE2 = path.join(DIR2, "list.jsonl");
		const root2 = Item.hydrate({ id: "root2", kids: [] });
		const store2 = new Store({ url: "/list2.jsonl" });
		store2.append = line => fs.appendFileSync(FILE2, JSON.stringify(line) + "\n");
		store2.attach(root2);

		const kid = Item.hydrate({ id: "k2", data: { after: "lunch", type: "bug", title: "T" }, notes: [{ id: "n1", text: "hi" }] });
		root2.kids.add(kid);

		const added = JSON.parse(fs.readFileSync(FILE2, "utf8").trim()).kids.add;
		t.eq(added.after, null, "add: the real position (first) is not clobbered by a data field named 'after'");
		t.ok(!("notes" in (added.data ?? {})), "add: the envelope's data does not swallow the child list");
		t.eq(added.notes?.[0]?.id, "n1", "add: the child list is written as its own top-level list, not lost");

		const fresh2 = Item.hydrate({ id: "root2", kids: [] });
		const reader2 = new Store({ url: "/list2.jsonl" });
		reader2.read(reader2.parse(fs.readFileSync(FILE2, "utf8")));
		reader2.attach(fresh2);
		const k2 = fresh2.kids.find("k2");
		t.eq(k2.get("after"), "lunch", "replay: data named 'after' survives under the real key");
		t.eq(k2.get_one("type"), "bug", "replay: data named 'type' survives (no 'unknown type' Item fallback)");
		t.eq(k2.notes?.find("n1")?.get_one("text"), "hi", "replay: the child list (notes) survives the add");
		fs.rmSync(DIR2, { recursive: true, force: true });
	}

	// Fix 5 regression (found replaying Task.steps.test.mjs after this fix landed, chat-model step 1 review round 2): the
	// envelope's `data` and child lists must be a SNAPSHOT taken at announce time, not a live reference onto the member
	// itself — otherwise a later mutation of the member (a subtask started, then completed) silently rewrites the line
	// already "recorded" for its `add`, because `toJSON()`'s `data` is the member's own live `.data` object. A real
	// `Store` queues a line (`queueMicrotask`) rather than writing it synchronously, so this needs a store that keeps the
	// raw line OBJECT across that gap — `ScratchStore` (what core/Test's Steps.js and Task.steps.test.mjs both use) — not
	// the synchronous `fs.appendFileSync` override above, which stringifies (and so snapshots) before this bug could show.
	{
		const { default: ScratchStore } = await import("../Item/watch/ScratchStore.js");
		const root3 = Item.hydrate({ id: "root3", kids: [] });
		const store3 = new ScratchStore({ url: "/list3.jsonl" });
		store3.attach(root3);

		const kid3 = Item.hydrate({ id: "k3", title: "before", notes: [{ id: "n1", text: "before" }] });
		const added3 = root3.kids.add(kid3);
		added3.set({ title: "after" });                   // mutate the member's own data in the same tick, before any flush
		added3.notes.find("n1").set({ text: "after" });    // mutate a child-list member too

		await new Promise(r => queueMicrotask(r));         // let the queued "add" line (and these two "set" lines) actually flush
		const add_line = store3.lines.find(l => l.kids?.add)?.kids.add;
		t.eq(add_line?.data?.title, "before", "add: the recorded line's data is a snapshot — a same-tick set() on the member does not rewrite it");
		t.eq(add_line?.notes?.[0]?.data?.text, "before", "add: a child-list member's data is a snapshot too — a same-tick set() on IT does not rewrite the add line either");
	}

	// F7 evidence (persistence-sync/design/fixes.md, "Adding an item that already has a parent") — plan.md decision 2,
	// reworded 2026-11-02: `add()`'s own default is UNCHANGED (still re-parents, as michael/dev), so no existing caller
	// breaks; `list.ref(x)` is the new, explicit way to LINK an item some other list already owns, same file -> {path},
	// another file -> {url, path}. `item.move_to(dest)` stays the only real move.
	{
		const { default: RefClass } = await import("../Item/Ref.js");
		const two = Item.hydrate({ id: "two-lists", kids: [{ id: "k1", title: "K1" }, { id: "k2", title: "K2" }], box: [] });
		const k1 = two.kids.find("k1"), k2 = two.kids.find("k2");

		t.eq(two.box.add(k1), k1, "add()'s own default is unchanged (F7 evidence, plan.md decision 2): adding an already-owned item still hands back the item itself, never a Ref");

		const ref = two.box.ref(k2);   // a second, untouched item, so this case never crosses the add() case above
		t.ok(ref instanceof RefClass, "ref(): links an item owned by ANOTHER list with a Ref, instead of moving it");
		t.eq(ref.path, "kids.k2", "ref(): the Ref's path is the item's own dotted address");
		t.eq(two.kids.find("k2"), k2, "ref(): the item itself never left its first list");
		t.eq(two.box.length, 2, "ref(): the add() item and the Ref both landed in the second list");

		const throws = fn => { try { fn(); return false; } catch { return true; } };
		t.ok(throws(() => two.box.ref(new Item({ id: "loose" }))), "ref(): an unattached item throws (it has no address to point at)");
		const other = Item.hydrate({ id: "no-store", kids: [{ id: "k9" }] });
		t.ok(throws(() => two.box.ref(other.kids.find("k9"))), "ref(): an item in another tree with no store url throws");

		const DIR3 = fs.mkdtempSync(path.join(os.tmpdir(), "list-test-f7-"));
		try {
			const rootA = Item.hydrate({ id: "a-root", kids: [{ id: "shared", title: "Shared" }] });
			const storeA = new Store({ url: "/a/a.jsonl" });
			storeA.append = line => fs.appendFileSync(path.join(DIR3, "a.jsonl"), JSON.stringify(line) + "\n");
			storeA.attach(rootA);
			const rootB = Item.hydrate({ id: "b-root", box: [] });
			const storeB = new Store({ url: "/b/b.jsonl" });
			storeB.append = line => fs.appendFileSync(path.join(DIR3, "b.jsonl"), JSON.stringify(line) + "\n");
			storeB.attach(rootB);

			const shared = rootA.kids.find("shared");
			const fref = rootB.box.ref(shared);
			t.ok(fref instanceof RefClass, "ref(): across files also makes a Ref");
			t.eq([fref.url, fref.path], ["/a/a.jsonl", "kids.shared"], "ref(): the Ref names the other file's url and the item's path there");
			t.eq(rootA.kids.find("shared"), shared, "ref(): and the item stayed in its own file");
		} finally { fs.rmSync(DIR3, { recursive: true, force: true }); }
	}

	// render(): nothing until the browser wires List.View; then that view, given the list, open one level (build B's default view)
	const { default: ListClass } = await import("./List.js");
	t.eq(pair.kids.render(), undefined, "render() with no List.View draws nothing (node, or before the view is wired)");
	ListClass.View = class { constructor(o){ Object.assign(this, o); } };
	const v = pair.kids.render();
	t.ok(v instanceof ListClass.View && v.subject === pair.kids && v.open === 1, "render() makes List.View with the list as its subject, open one level");
	delete ListClass.View;
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
