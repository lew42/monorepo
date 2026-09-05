import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. This page IS the
   surface — it opens wearing it, and the chips let you leave it. */

export default new Paging({
	meta: import.meta,
	title: "Prim",
	description: "A prim-tinted surface — the accent as a wash, not as a fill.",
	icon: "auto_awesome",
	axes: "style mech",
	mode: { style: "prim" },

	takeaway: "**Prim is the accent colour, mixed a tenth of the way into the surface.** It marks a page as the important one without shouting; two prim pages beside each other cancel that out.",

	children: [
		leaf("A child", "Opened from a prim page. A child picks its own surface — a style is never inherited."),
		leaf("Another", "Two rows is enough to see what a surface does to a list."),
	],

	content(){
		this.lede();

		md("**The accent, at 10%.** `color-mix(in srgb, var(--prim) 10%, var(--surface))` — a tinted paper rather than a coloured band, so body text keeps its contrast and the accent still reads as *this one matters*. A page painted with the accent at full strength has nowhere left to put a button.");
		this.paging();
	},
});
