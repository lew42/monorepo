// A line that names something that is not there is reported (spec T6, persistence-sync object-model.md), but never refused:
// it is still stored as data, exactly as before, so every saved record replays the same. Node: `node public/framework/core/Item/unknown-key.test.mjs`.
//  1. A hop under a list to an id that is no member (a stale edit after a move) is counted and warned: "no member c1 in todo".
//  2. A key under a list member whose value is an object, and that names no method, field, child or data (a newer writer's verb), is counted.
//  3. No report for real data: a string value, an object under an explicit {"set":…}, a key already in data, a live set() in code.
//  4. (edge) Counted in Item.unknown_keys always; printed with console.warn in node only, once per key.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import List from "../List/List.js";

class Board extends Item {
	constructor(...a){ super(...a); this.todo = new List({ owner: this, name: "todo" }); this.done = new List({ owner: this, name: "done" }); }
}
Item.register(Board, "UnknownKeyBoard");

const quiet = fn => { const w = console.warn, said = []; console.warn = (...a) => said.push(a.join(" ")); try { return { value: fn(), said }; } finally { console.warn = w; } };
const fresh = () => { Item.unknown_keys.clear(); Item.warned.clear(); };
const BASE = [{ id: "b" }, { todo: { add: { id: "c1", data: { title: "One" } } } }, { todo: { add: { id: "c2", data: { title: "Two" } } } }];

test("a hop to an id that is no member of the list is reported, and still stored as before", t => {
	fresh();
	const { value: b, said } = quiet(() => Board.replay([...BASE,
		{ done: { move: { id: "c1", after: null, from: "todo" } } },
		{ todo: { c1: { set: { title: "renamed" } } } },
	]));
	t.eq(b.done.find("c1")?.get("title"), "One", "the moved card kept its title");
	t.eq(Item.unknown_keys.get("List.c1"), 1, "counted once as List.c1");
	t.ok(said.some(s => s.includes("c1") && s.includes("todo")), "warned, naming c1 and the list: " + said.join(" | "));
	t.ok(b.todo.data.c1 !== undefined, "warn only: stored as data, as it always was (no refusal)");
});

test("an object under a list member that names nothing the member has is reported (an unknown verb)", t => {
	fresh();
	const { value: b, said } = quiet(() => Board.replay([...BASE, { todo: { c2: { archive: { reason: "old" } } } }]));
	t.eq(Item.unknown_keys.get("Item.archive"), 1, "counted as Item.archive");
	t.ok(said.some(s => s.includes("archive")), "warned about archive");
	t.eq(b.todo.find("c2").get("archive")?.reason, "old", "warn only: stored as data, as before");
});

test("real data is never reported", t => {
	fresh();
	const { value: b, said } = quiet(() => Board.replay([...BASE,
		{ todo: { c2: { title: "plain string" } } },
		{ todo: { c2: { set: { meta: { a: 1 } } } } },
		{ todo: { c2: { meta: { a: 2 } } } },
	]));
	b.todo.find("c1").set({ extra: { live: true } });
	t.eq(Item.unknown_keys.size, 0, "nothing counted: " + JSON.stringify([...Item.unknown_keys]));
	t.eq(said.length, 0, "nothing warned");
	t.eq(b.todo.find("c2").get("meta")?.a, 2, "the data landed");
});

test.optional("edge: one warning per key however many lines", t => {
	fresh();
	const { said } = quiet(() => Board.replay([...BASE, { todo: { c2: { archive: { r: 1 } } } }, { todo: { c1: { archive: { r: 2 } } } }]));
	t.eq(Item.unknown_keys.get("Item.archive"), 2, "counted twice");
	t.eq(said.filter(s => s.includes("archive")).length, 1, "warned once");
});
