import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. This page IS the
   surface — it opens wearing it, and the chips let you leave it. */

export default new Paging({
	meta: import.meta,
	title: "Tint",
	description: "One subtle step off the parent — the cheapest way to say this is a different page.",
	icon: "gradient",
	axes: "style mech",
	mode: { style: "tint" },

	takeaway: "**Tint is one subtle step of background away from the page that opened it.** Just enough to say 'this is a different page', and never enough to read as a frame.",

	children: [
		leaf("A child", "Opened from a tint page. A child picks its own surface — a style is never inherited."),
		leaf("Another", "Two rows is enough to see what a surface does to a list."),
	],

	content(){
		this.lede();

		md("**One step, not a colour.** Tint is `--surface` against the column floor's `--wash`: a single lightness step, no hue, no border. It is what to reach for when two pages side by side need to be *told apart* rather than ranked.");
		this.paging();
	},
});
