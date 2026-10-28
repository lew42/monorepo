import { code, div, span, icon, details, summary } from "/app.js";
import ClassDoc from "../../ext/Doc/ClassDoc.js";
import Box from "../Item/watch/Box.js";
import item_life from "../Item/Item.life.js";
import steps from "./List.steps.js";
import { run_steps } from "../Item/Item.steps.js";
import method_list from "./List.methods.js";
import Item from "../Item/Item.js";
import List from "./List.js";
import examples from "./List.examples.js";

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

// The same path as an Item's change (a List is an Item); only who makes and changes one differs.
const life = {
	who: [
		{ icon: "code", name: "Its owner's class", code: `this.items = new List({ owner: this, name: "items" })`, says: "made in the owner's constructor; writes nothing" },
		{ icon: "touch_app", name: "A click", code: `list.move(id, { after })`, says: "a drag, a sort, a delete" },
		{ icon: "smart_toy", name: "An agent", code: `item({ path, delta: { items: { add } } })`, says: "Servex's item tool" },
		{ icon: "history", name: "A load", code: `Item.hydrate(json) · root.set(line)`, says: "members inserted quietly, or one line at a time" },
	],
	path: item_life.path.map(hop => hop.name === "One line" ? { ...hop, code: `{"items":{"move":{"id":"milk","after":null}}}`, says: "the list's name is the last hop" } : hop),
};

export default new ClassDoc({
	meta: import.meta,
	title: "List",
	description: "The ordered collection that announces every change — add/remove/move/order by id, never an index.",
	icon: "reorder",

	subject: List,
	holds: "its members in order, and its owner: the Item whose property it is",
	example(){ const shop = new Box({ id: "shop" }); ["milk", "bread", "eggs"].forEach(id => shop.items.add({ id })); return shop.items; },
	life,
	steps, run_steps,
	steps_test: "List.steps.test.mjs",
	method_list,
	method_setup: "// shop(): a Box whose items are milk, bread, eggs",

	properties: "items owner length",
	// ⚠ Only List's OWN prototype methods: an inherited name (`set`) warns "has no member" (2026-10-03).
	methods: "forEach map at adopt append insert_before take index_of key find add remove move order toJSON",
	notes: "architecture decisions",
	files: "List.js List.steps.js List.methods.js List.examples.js readme.md page.js",

	// Below the drawing: the six examples that are also List's tests, folded to one line.
	content(){
		const passed = [];
		details.c("doc-class-more", () => {
			const $sum = summary("");
			div.c("flex v gap pad surface", () => examples.forEach(e => passed.push(example(e))))
				.style({ "--gap": "1.2em", "--pad": "1em" });
			$sum.text(`Six more examples, run on load: ${passed.filter(Boolean).length} of ${passed.length} pass`);
		});
	}
});
