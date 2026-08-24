import { Doc, md, demo, div, span, pre, icon, ui } from "/app.js";
import Tree from "./Tree.js";
import TreeKeys from "./TreeKeys.js";

/* Two node builders, so the demo data reads like a directory listing.
 * ⚠ `icon:` is a FUNCTION. A View built at the call site appends itself to whatever
 * box is capturing at that moment; a function runs under the icon slot's own captor. */
const dir = (text, children, open) => ({ icon: () => icon("folder"), text, open, children });
const file = (text, glyph, body) => ({ icon: () => icon(glyph), text, body });

/* Built fresh per call: a Page caches its view, so a card's copy and the stage's copy
 * would otherwise fight over one set of DOM nodes (ext/demo/exhibit.js). */
const project = () => [
	dir("ux", [
		dir("Tree", [
			file("Tree.js", "code", "export default class Tree extends View {\n\n\trender(){\n\t\tthis.style(\"--ui-tree-indent\", this.indent);\n\t\tthis.draw();\n\t}\n}"),
			file("TreeKeys.js", "code", "export default class TreeKeys extends Tree {\n\n\tkey(e){\n\t\tconst method = this.keys[e.key];\n\t\tif (this[method]() !== false) e.preventDefault();\n\t}\n}"),
			file("Tree.css", "code", "@layer theme {\n\t.ux-tree-keys .ui-tree-row:focus {\n\t\toutline: 2px solid var(--prim);\n\t}\n}"),
			file("readme.md", "article", "# Tree\n\nui/ hands you markup. ux/ hands you a class you can extend."),
		], true),
		file("readme.md", "article", "# UX\n\nThe behavior tier: state, listeners, a lifecycle."),
	], true),
	dir("ui", [
		dir("tree", [
			file("tree.js", "code", "css(`@layer theme {\n\t.ui-tree-row { display: flex; gap: 0.35em; }\n}`);"),
			file("page.js", "code", "export default new Page({ meta: import.meta, title: \"Tree\" });"),
		]),
		file("ui.js", "code", "export const ui = { table, timeline, keys, tree };"),
	]),
];

/* The explorer: a Tree drives a preview pane, and `selected_change` is the ONE wire
 * between them — the method IS the seam, so a subclass rewires it without a callback.
 * `.rail` + `.flex-1` is the whole responsive story: the rail is 14-22em beside the
 * pane, and takes its own line under 38em of container (core/Page/Page.css). */
const explorer = () => {
	const nodes = project();
	let $tree, $preview;

	const show = node => $preview.empty(() => {
		div.c("flex v-center gap", () => {
			icon(node.body ? "description" : "folder");
			span.c("h3", node.text);
		}).style("--gap", "0.4em");

		span.c("muted", node.body ? "file" : node.children.length + " items");

		if (node.body) pre(node.body);
	});

	const $box = div.c("flex wrap gap", () => {
		div.c("rail surface pad", () => { $tree = new Tree({ nodes, selected_change: show }); });

		$preview = div.c("flex-1 surface pad flex v gap");
	});

	// A demo of an empty pane is a demo of nothing. `select(node, true)` is the same
	// wire a click runs — which is the point of it being a method rather than a handler.
	$tree.select(nodes[0].children[0].children[0], true);

	return $box;
};

/* The same explorer with the keyboard subclass in the rail. Nothing else changes —
 * that is the claim the demo is making. */
const keyboard = () => {
	const gesture = (name, said) => div.c("flex v-center gap", () => { ui.keys(name); span.c("muted", said); });

	return div.c("flex wrap gap", () => {
		div.c("rail surface pad", () => new TreeKeys({ nodes: project() }));

		div.c("flex-1 surface pad flex v gap", () => {
			span.c("h3", "Tab in, then drive");
			gesture("↑ ↓", "move one visible row");
			gesture("→", "open a branch, then step into it");
			gesture("←", "shut it, then step out to the parent");
			gesture("Enter", "select the focused row");
			gesture("Home / End", "first / last visible row");
		});
	});
};

/* The words proof: both tiers read the same tokens, so ONE class on the section
 * re-skins the ui/ template and the ux/ class in one pass. */
const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); explorer(); }).style("--gap", "0.5em");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); explorer().ac("ui-contrast ui-compact"); }).style("--gap", "0.5em");
});

export default new Doc({
	meta: import.meta,
	title: "Tree",
	description: "ui/tree's closure, opened up — a class you extend, with keyboard roving as a named subclass.",
	icon: "account_tree",

	files: "Tree.js TreeKeys.js TreeDrag.js Tree.css page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("keys", keyboard, {
			note: "`class TreeKeys extends Tree` — the whole extension. `TreeKeys.Row` is the one part it replaces; `Tree.Item` travels down the chain untouched, and `Tree` itself still has no tab stops. Click a row, or Tab into the tree, then use the arrows." }),

		demo.page("words", words, {
			note: "The same explorer twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the template it composed in one pass." }),

		"drag",
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(explorer, steer).ac("bleed"),
			def: explorer,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Master-detail.** The tree is a `Tree` instance and the pane is a plain box; `selected_change(node)` is the only wire between them. Drag the stage narrower, or press **mobile** above: the rail takes its own line under 38em of container width, so the phone layout is the same two boxes.",
		});

		md("## What actually moved");

		md("`ui/tree` was the one behavioral component in a tier of twenty templates: a `rows` Map and a `selected_row` held in a closure, two click listeners, and an `update()`/`select()` lifecycle bolted onto the View it returned. A closure is a class written in the one shape nothing can subclass — so it graduated.");

		md("**The CSS did not move.** Every `.ui-tree-*` rule still lives in [`ui/tree/tree.js`](/framework/ui/tree/), and this class wears those classes. Splitting is the usual answer: a rule about a relationship or a state is exactly what `ui/` is for, and a `ux` that took the stylesheet would fork the look the day the template's changed.");

		md("**State is on the instance and every behavior is a method** — `draw()`, `list()`, `item()`, `select()`, `selected_change()`. Parts hang off the constructor as statics (`Tree.Item`, `Tree.Row`) and are reached through `this.constructor`, so [`TreeKeys`](/framework/ux/Tree/keys/) inherits the whole machine and replaces one branch of it. The reasoning, and what it cost, in [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Tree({ nodes: project() }))); },
});
