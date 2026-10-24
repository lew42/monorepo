// Store: one .jsonl file = one object's history. Plain node: `node public/framework/core/Item/Store.test.mjs`
//   1. a set() appends exactly one line
//   2. replaying the file rebuilds the same state
//   3. a child with its own file writes its own file, plus the note in the root
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../Test/Test.js";
import Item from "./Item.js";
import "../List/List.js";
import Store from "./Store.js";

const t = new Test("core/Item/Store");
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "store-test-"));
const base = () => ({ id: "root", title: "Root", kids: [{ id: "a", title: "A" }] });

// A store whose "disk" is a real file in a temp folder: append() writes the queued line, one JSON object per line.
const open = (host, file) => {
	const store = new Store({ url: "/" + file });
	store.append = line => fs.appendFileSync(path.join(DIR, file), JSON.stringify(line) + "\n");
	store.attach(host);
	return store;
};
const lines = file => fs.existsSync(path.join(DIR, file)) ? fs.readFileSync(path.join(DIR, file), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];

try {
	// 1 + 2
	const root = Item.hydrate(base());
	open(root, "root.jsonl");
	root.set({ title: "Root 2" });
	t.eq(lines("root.jsonl").length, 1, "one set() appends exactly one line");
	t.eq(lines("root.jsonl")[0], { set: { title: "Root 2" } }, "the line is the delta itself");

	root.kids.add({ id: "b", title: "B" });
	root.kids.find("a").set({ title: "A2" });
	root.kids.move("b", { after: null });
	t.eq(lines("root.jsonl").length, 4, "each change is one more line (4 total)");

	const fresh = Item.hydrate(base());
	const reader = new Store({ url: "/root.jsonl" });
	reader.read(reader.parse(fs.readFileSync(path.join(DIR, "root.jsonl"), "utf8")));
	reader.attach(fresh);
	t.eq(JSON.stringify(fresh), JSON.stringify(root), "replaying the file rebuilds the same state");
	t.eq([...fresh.kids].map(k => k.id), ["b", "a"], "member order survives the replay");
	t.eq(lines("root.jsonl").length, 4, "replaying writes nothing back");

	// 3. a child with its own file
	const parent = Item.hydrate({ title: "P", kids: [] });
	open(parent, "parent.jsonl");
	const kid = parent.kids.add({ id: "k", title: "K" });
	t.eq(lines("parent.jsonl").length, 1, "the root gets the note that the child was added");
	open(kid, "kid.jsonl");
	kid.set({ title: "K2" });
	t.eq(lines("kid.jsonl"), [{ set: { title: "K2" } }], "the child's change goes to the child's own file");
	t.eq(lines("parent.jsonl").length, 1, "the root file did not record the child's change");

	const marked = parent.kids.add({ id: "m", title: "M" });
	marked._own_file = "/m/";
	marked.set({ title: "M2" });
	t.eq(lines("parent.jsonl").length, 2, "a child marked _own_file adds its note to the root, then nothing more");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
