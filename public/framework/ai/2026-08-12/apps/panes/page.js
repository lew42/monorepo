import { Page, demo, div, is } from "/app.js";
import { pane, grip } from "./panes.js";
import { widget } from "../parts.js";

// A nesting, as data: the first word is the direction, the rest are panes or more
// nestings. `["col", …]` inside `["row", …]` is the Blender split, spelled out.
const LAYOUT = ["row", "Outline", ["col", "Canvas", "Timeline"], "Properties"];

function panes(){
	const build = spec => is.arr(spec)
		? div.c("apps-split flex " + (spec[0] === "col" ? "v" : ""), () =>
			spec.slice(1).forEach((kid, i) => { if (i) grip(); build(kid); }))
		: pane(spec);

	return widget(div.c("apps-panes flex pad", () => build(LAYOUT))).style("--pad", "0.5em");
}

export default new Page(demo.layout({
	meta: import.meta,
	title: "Panes",
	description: "Rows inside columns, each pane a switchable editor — the Blender shape.",
	icon: "grid_view",

	children: "split",

	layout: panes,

	note: "**Drag a divider** and the two panes either side swap pixels — nothing else in the tree moves. **Change a pane's menu** and only that pane redraws. The recursion is four lines because `flex` already nests: a split is a `flex` row (or a `flex v` column) whose children each take `1 1 0`, and a divider is a child that takes none. Cutting new splits at runtime is one page down.",
}));

export { panes };
