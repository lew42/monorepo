import { Doc, md, h2, code, div, span, button, icon } from "/app.js";
import Item from "../Item/Item.js";
import List from "./List.js";
import LiveList from "./LiveList.js";
import examples from "./LiveList.examples.js";

// A plain List holds plain objects — nothing with its own `.set` or `.emit` required.
function build_list(){
	const list = new List();
	["Alpha", "Beta", "Gamma"].forEach(label => list.append({ label }));
	return list;
}

// The same shape, but LIVE: a real root Item, composing a named LiveList — the
// pattern [Item](/framework/core/Item/) itself uses (`item.content`, `panel.items`).
function build_live(){
	const root = new Item({ id: "root", data: {} });
	root.items = new LiveList({ owner: root, name: "items" });
	["Alpha", "Beta", "Gamma"].forEach(label => root.items.add({ id: label, label }));
	return root;
}

// An example's `run()` body, without its own indentation — the lines you'd copy.
function body(fn){
	const lines = fn.toString().split("\n").slice(1, -1);
	const pad = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^\t*/)[0].length));
	return lines.map(line => line.slice(pad)).join("\n");
}

// One example: run it now, then its title (green if it passed, red with the
// error if not) above its source.
function example({ title, run }){
	let error;
	try { run(); } catch (e){ error = e; }
	div.c("flex v gap", () => {
		div.c("flex gap v-center", () => {
			icon(error ? "cancel" : "check_circle");
			span(title).style("font-weight", "600");
		}).style("color", error ? "var(--error)" : "var(--ok)");
		if (error) code(error.message);
		code.js(body(run));
	}).style("--gap", "0.35em");
	return !error;
}

export default new Doc({
	meta: import.meta,
	title: "List",
	description: "The plain ordered array — data only, no events. LiveList, right beside it, is this PLUS announcing every change.",
	icon: "reorder",

	subject: List,
	properties: "items owner length",
	methods: "assign forEach map at adopt append insert_before remove find index_of toJSON",
	notes: "decisions",
	files: "List.js LiveList.js LiveList.examples.js readme.md page.js",

	content(){

		code.js(`list.items  list.length  [Symbol.iterator]
list.forEach(fn)  list.map(fn)  list.at(i)
list.append(child)  list.insert_before(child, ref = null)  list.remove(child)
list.find(fn)  list.index_of(child)
list.adopt(child)   //  child.parent = owner ?? this
list.toJSON()       //  a bare array`);

		md("**List is the plain ordered array wrapper — data only, no events.** About fifty lines. It is what an ordered collection looks like with nothing watching it; reach for one when nothing needs to react to a change (a sort key, a render order, anything you'd otherwise reach for a bare array for).");

		const list = build_list();
		div.c("flex gap pad surface", () => list.forEach(x => span(x.label))).style({ "--gap": "0.5em", "--pad": "0.8em" });

		md("`owner` is what makes adoption safe: `adopt()` sets `child.parent = this.owner ?? this`, so a child's parent is whatever Item composed this list, never the list itself. [doc/adoption](./doc/adoption.md).");

		h2("LiveList — the same array, announcing every change");

		md("[`LiveList`](./LiveList.js) is `Events(List)` (core/Events): the same plain array, plus `add` / `remove` / `move` / `order` **by id, never an index** — and each one emits the exact line it would save, plus one uniform `\"delta\"` event [`Item.Store`](/framework/core/Item/) listens for. [`Item`](/framework/core/Item/) **composes** one as a named property instead of inheriting it — a bare Item holds no list of its own; something that needs children gives ITSELF one (`item.content = new LiveList({ owner: item, name: \"content\" })`).");

		code.js(`const root = new Item({ id: "root", data: {} });
root.items = new LiveList({ owner: root, name: "items" });
root.items.add({ id: "a", label: "Alpha" });   // announces "add" + "delta", bubbled to root`);

		const root = build_live();
		const $tree = div.c("flex gap pad surface").style({ "--gap": "0.5em", "--pad": "0.8em" });
		const draw = () => $tree.empty(() => { root.items.forEach(x => span(x.get("label"))); });

		["add", "remove", "move", "order", "change"].forEach(event => root.on(event, draw));
		draw();

		div.c("flex gap wrap", () => {
			button("Gamma to front").click(() => root.items.move("Gamma", { after: null }));
			button("Rename Beta").click(() => root.items.find("Beta")?.set("label", "Beta " + root.items.length));
			button("Reset").click(() => {
				[...root.items].forEach(kid => root.items.remove(kid.id));
				["Alpha", "Beta", "Gamma"].forEach(label => root.items.add({ id: label, label }));
			});
		}).style("--gap", "0.5em");

		md("Reorder and rename are each **one call**, on the list — nothing here subscribes to a row; `draw` is bound once, to the root, and hears everything under it because events bubble.");

		h2("LiveList by example");

		md("Six examples, each a few plain lines that prove one behaviour. They are also LiveList's tests: they run right here as the page loads, and the node test runs the same file ([LiveList.examples.js](./LiveList.examples.js)).");

		const passed = [];
		div.c("flex v gap pad surface", () => examples.forEach(e => passed.push(example(e))))
			.style({ "--gap": "1.2em", "--pad": "1em" });
		div.c("h4 muted", `${passed.filter(Boolean).length} / ${passed.length} passing`);

		md("⚠ **No derived or reactive lists.** A long-lived document leaking a listener per row per view is the exact failure a one-listener-at-the-root design avoids — derive with `[...list].filter(…)` at the call site and redraw from the root event.");

		md("Back to [Item](/framework/core/Item/) — the class that composes one of these as a named property, and never a second one for the same name.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
