import { Page, div } from "/app.js";
import detail from "/framework/styles/layouts/detail.js";
import { btn } from "/framework/ext/Layout/controls.js";
import { pane, grip } from "../panes.js";
import { widget } from "../../parts.js";

// The same recursion, over a tree the reader edits. A node is either `{ kids }` — a
// split — or `{ type }` — a pane; every button below rewrites the tree and redraws.
function splits(){
	const tree = { dir: "row", kids: [{ type: "Outline" }, { type: "Canvas" }, { type: "Properties" }] };
	let $root;

	const redraw = () => $root.empty(() => build(tree));

	const build = (node, parent, i) => node.kids
		? div.c("apps-split flex " + (node.dir === "col" ? "v" : ""), () =>
			node.kids.forEach((kid, k) => { if (k) grip(); build(kid, node, k); }))
		: pane(node.type, () => {
			cut("→", "row", node, parent, i);
			cut("↓", "col", node, parent, i);

			// A split of one is not a split, so the last pane keeps its close button off.
			if (parent.kids.length > 1)
				btn("✕", () => { parent.kids.splice(i, 1); redraw(); }).attr("title", "Close this pane");
		});

	const cut = (glyph, dir, node, parent, i) => btn(glyph, () => {
		parent.kids.splice(i, 1, { dir, kids: [{ type: node.type }, { type: "Canvas" }] });
		redraw();
	}).attr("title", dir === "row" ? "Split beside" : "Split below");

	$root = widget(div.c("apps-panes flex pad")).style("--pad", "0.5em");
	redraw();
	return $root;
}

export default new Page(detail({
	meta: import.meta,
	title: "Split",
	description: "The same panes, cut and closed at runtime — the tree is the state.",
	icon: "call_split",

	layout: splits,

	note: "**→ splits a pane beside itself, ↓ splits it below, ✕ closes it.** Nothing here knows about the DOM: a click rewrites a plain object and `redraw()` builds the whole thing again, which is affordable because the whole thing is four lines of `flex`. Compare with the fixed nesting on [Panes](/framework/ai/2026-08-12/apps/panes/) — the render is the same function.",
}));
