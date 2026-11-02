// Clearing a field is saved, and replays (spec T5, persistence-sync object-model.md). Node: `node public/framework/core/Item/unset.test.mjs`.
//  1. item.unset("color") saves {"unset":["color"]}; a replay of the lines has no color, also from a snapshot plus the tail after it.
//  2. set({color: undefined}) is the same unset (before, it saved {"set":{}} and the old value came back on reload).
//  3. A list member's unset names its list and id; a Task record reads a top-level unset line.
//  4. (edge) unsetting a key that was never set writes nothing; with marked lines on the line is {"unset()":[…]}.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import Store from "./Store.js";
import List from "../List/List.js";
import Task from "../Task/Task.js";

// A root with a Store attached whose append only records: the lines this root would save.
const recorded = (host, url) => {
	const store = new Store({ url }), lines = [];
	store.append = line => lines.push(JSON.parse(JSON.stringify(line)));
	store.attach(host);
	return lines;
};
const J = x => JSON.stringify(x);

test("unset saves one line, and a replay (full, or snapshot plus tail) has no value", t => {
	const a = new Item({ id: "a" }), lines = recorded(a, "/unset/1.jsonl");
	a.set({ color: "red", size: 2 });
	const at_snapshot = lines.length, state = JSON.parse(J(a));
	const changes = [];
	a.on("change", (key, value, old) => changes.push([key, value, old]));
	a.unset("color");
	t.eq(J(lines.at(-1)), J({ unset: ["color"] }), "the saved line is {unset:[color]}");
	t.ok(!("color" in a.data), "live: the key is gone from data");
	t.eq(J(changes), J([["color", null, "red"]]), "one change event, value undefined");
	const full = Item.replay([{ id: "a" }, ...lines]);
	t.eq(full.get("color"), undefined, "a full replay has no color");
	t.eq(full.get("size"), 2, "and keeps size");
	const snap = Item.replay(lines.slice(at_snapshot), { state, memory: [] });
	t.eq(snap.get("color"), undefined, "snapshot (color red) + tail: no color");
	t.eq(snap.get("size"), 2, "snapshot + tail keeps size");
});

test("set({k: undefined}) is an unset", t => {
	const a = new Item({ id: "a" }), lines = recorded(a, "/unset/2.jsonl");
	a.set({ color: "red" });
	a.set({ color: undefined });
	t.eq(J(lines.at(-1)), J({ unset: ["color"] }), "saved as {unset:[color]}, not {set:{}}");
	t.eq(Item.replay([{ id: "a" }, ...lines]).get("color"), undefined, "the replay has no color");
});

test("a list member's unset names its list and id; a Task reads a top-level unset", t => {
	const root = new Item({ id: "r" });
	root.cards = new List({ owner: root, name: "cards" });
	const lines = recorded(root, "/unset/3.jsonl");
	root.cards.add({ id: "c1", data: { title: "One", note: "x" } });
	root.cards.find("c1").unset("note");
	t.eq(J(lines.at(-1)), J({ cards: { c1: { unset: ["note"] } } }), "the line hops cards.c1");
	const back = Item.replay([{ id: "r" }, ...lines]);
	t.eq(back.cards?.find("c1")?.get("note"), undefined, "replayed: no note");
	t.eq(back.cards?.find("c1")?.get("title"), "One", "replayed: title kept");

	const task = Task.replay([{ assign: { slug: "t", title: "T" } }, { set: { expected: "soon" } }, { unset: ["expected"] }]);
	t.eq(task.get("expected"), undefined, "a Task record's top-level unset clears the field");
	t.eq(task.get("title"), "T", "and keeps the title");
});

test.optional("edge: a key never set writes nothing; marked lines spell it unset()", t => {
	const a = new Item({ id: "a" }), lines = recorded(a, "/unset/4.jsonl");
	a.unset("nothing");
	a.set({ nothing: undefined });
	t.eq(lines.length, 0, "no line for a key that was never there");
	a.set({ color: "red" });
	Store.marked_lines = true;
	try { a.unset("color"); } finally { Store.marked_lines = false; }
	t.eq(J(lines.at(-1)), J({ "unset()": ["color"] }), "marked: {\"unset()\":[color]}");
	t.eq(Item.replay([{ id: "a" }, ...lines]).get("color"), undefined, "and it replays");
});
