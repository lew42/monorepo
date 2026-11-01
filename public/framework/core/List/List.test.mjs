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

	// render(): nothing until the browser wires List.View; then that view, given the list, open one level (build B's default view)
	const { default: ListClass } = await import("./List.js");
	t.eq(pair.kids.render(), undefined, "render() with no List.View draws nothing (node, or before the view is wired)");
	ListClass.View = class { constructor(o){ Object.assign(this, o); } };
	const v = pair.kids.render();
	t.ok(v instanceof ListClass.View && v.subject === pair.kids && v.open === 1, "render() makes List.View with the list as its subject, open one level");
	delete ListClass.View;
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
