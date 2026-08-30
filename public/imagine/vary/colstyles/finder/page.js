import { Page, demo, md } from "/app.js";
import { tree } from "../tree.js";

// Container: colstyles's own column, `fill` (the demo box wants the leftover room).
// Size: one demo.app() box, ~52em wide, one row tall. Own layout: `.flow`
// holding the box. Regions: one. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Finder",
	description: "The shipped default — hairlines, one --wash floor. No override in colstyles.css at all.",
	icon: "view_column",
	width: "fill",

	content(){
		md("The shape every columns page ships with: transparent bodies over one `--wash` floor, every seam a 1px `--line` hairline. Nothing here is retuned — `colstyles.css` has no `.vary-colstyles-look-finder` rule, on purpose.");
		demo.app(tree("finder")).style({ height: "26em", width: "min(100%, 52em)" });
		md("**Interaction:** resize and reveal are core's own — nothing in this look touches either.");
	},
});
