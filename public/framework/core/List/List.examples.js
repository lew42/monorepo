import Item from "../Item/Item.js";
import List from "./List.js";

/* List, taught by six examples that are also its tests.
   Each `run()` is a few plain lines that throw if the behaviour breaks. The List page
   (/framework/core/List/) shows each one's source with a live pass or fail, and
   ai/2026-10-02/page-extends-item/item-core/test.mjs runs the same array in node.
   One set of examples is both the docs and the test. Every example builds its list
   the way Item uses one: a named List owned by a root Item. */

// The only helper: throw with a message when something isn't true.
const check = (cond, msg) => { if (!cond) throw new Error(msg); };

export default [
	{
		title: "add puts a new row after the one you name",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			rows.add({ id: "a" });
			rows.add({ id: "b" });
			rows.add({ id: "x" }, { after: "a" });
			const order = [...rows].map(row => row.id).join(" ");
			check(order === "a x b", "x should sit right after a, got: " + order);
		},
	},
	{
		title: "remove takes a row out by its id",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			rows.add({ id: "a" });
			rows.add({ id: "b" });
			rows.remove("a");
			const order = [...rows].map(row => row.id).join(" ");
			check(order === "b", "a should be gone, got: " + order);
		},
	},
	{
		title: "move puts an existing row after another (null means first)",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			["a", "b", "c"].forEach(id => rows.add({ id }));
			rows.move("c", { after: null });
			const order = [...rows].map(row => row.id).join(" ");
			check(order === "c a b", "c should be first, got: " + order);
		},
	},
	{
		title: "order sets the whole order in one line",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			["a", "b", "c"].forEach(id => rows.add({ id }));
			rows.order(["c", "b", "a"]);
			const order = [...rows].map(row => row.id).join(" ");
			check(order === "c b a", "the order should be reversed, got: " + order);
		},
	},
	{
		title: "every change fires an event shaped like the line it saves",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			const heard = [];
			rows.on("delta", line => heard.push(JSON.stringify(line)));
			rows.add({ id: "a" });
			rows.add({ id: "b" });
			rows.move("b", { after: null });
			rows.remove("a");
			check(heard.join("\n") === [
				'{"add":{"id":"a","after":null}}',
				'{"add":{"id":"b","after":"a"}}',
				'{"move":{"id":"b","after":null}}',
				'{"remove":"a"}',
			].join("\n"), "the lines were:\n" + heard.join("\n"));
		},
	},
	{
		title: "replaying the saved lines rebuilds the same list",
		run(){
			const root = new Item({ id: "root", data: {} });
			const rows = root.rows = new List({ owner: root, name: "rows" });
			const lines = [];
			rows.on("delta", line => lines.push(line));
			["a", "b", "c"].forEach(id => rows.add({ id }));
			rows.move("a", { after: "c" });

			const copy_root = new Item({ id: "root", data: {} });
			const copy = copy_root.rows = new List({ owner: copy_root, name: "rows" });
			lines.forEach(line => copy.set(line));
			check(JSON.stringify(copy) === JSON.stringify(rows), "the copy came out different: " + JSON.stringify(copy));
		},
	},
];
