import { Doc, md, h2, code, div, span, button, icon } from "/app.js";
import Item from "../Item/Item.js";
import List from "./List.js";
import examples from "./List.examples.js";

// A real root Item, composing a named List — the pattern [Item](/framework/core/Item/)
// itself uses (`item.content`, `panel.items`). Every List announces every change;
// there is no plain, event-less variant any more (2026-10-02: "scrap LiveList
// everywhere… List itself gets Events built in").
function build_live(){
	const root = new Item({ id: "root", data: {} });
	root.items = new List({ owner: root, name: "items" });
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
	description: "The ordered collection that announces every change — add/remove/move/order by id, never an index.",
	icon: "reorder",

	subject: List,
	properties: "items owner length",
	// ⚠ `assign` and `set` are Item's, not List's own, since `List extends Item` (2026-10-03) —
	// `Doc.members()` only shows a class's OWN prototype methods (`util/source/source.js`'s
	// `member()`), so listing an inherited name here just warns "has no member" and adds
	// nothing (found 2026-10-03, console-clean task, via a CDP console trace on /ai/live/).
	methods: "forEach map at adopt append insert_before take index_of key find add remove move order toJSON",
	notes: "decisions",
	files: "List.js List.examples.js readme.md page.js",

	content(){

		code.js(`list.add(x, {after})  list.remove(id)  list.move(id, {after})  list.order([ids])
list.find(id)  list.forEach(fn)  list.map(fn)  list.at(i)  list.length
list.adopt(child)   //  child.parent = owner ?? this
list.toJSON()       //  a bare array`);

		md("**List is the ordered collection — Events built in, so every change announces itself.** About two hundred lines, composed onto an Item as a named property (`item.content`, `panel.items`) — never inherited. `Item` holds no list of its own; something that needs children gives ITSELF one (`item.content = new List({ owner: item, name: \"content\" })`). There is no separate event-less variant: every List is live.");

		h2("Four verbs, by id, never an index");

		md("`add` / `remove` / `move` / `order` each emit the exact line they would save, plus one uniform `\"delta\"` event [`Item.Store`](/framework/core/Item/) listens for. A line survives the list changing shape around it, because every verb names a MEMBER, never a position.");

		code.js(`const root = new Item({ id: "root", data: {} });
root.items = new List({ owner: root, name: "items" });
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

		h2("List by example");

		md("Six examples, each a few plain lines that prove one behaviour. They are also List's tests: they run right here as the page loads, and the node test runs the same file ([List.examples.js](./List.examples.js)).");

		const passed = [];
		div.c("flex v gap pad surface", () => examples.forEach(e => passed.push(example(e))))
			.style({ "--gap": "1.2em", "--pad": "1em" });
		div.c("h4 muted", `${passed.filter(Boolean).length} / ${passed.length} passing`);

		md("⚠ **No derived or reactive lists.** A long-lived document leaking a listener per row per view is the exact failure a one-listener-at-the-root design avoids — derive with `[...list].filter(…)` at the call site and redraw from the root event.");

		md("Back to [Item](/framework/core/Item/) — the class that composes one of these as a named property, and never a second one for the same name.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
