import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. This page IS the
   surface — it opens wearing it, and the chips let you leave it. */

export default new Paging({
	meta: import.meta,
	title: "Plain",
	description: "The site's own floor, no frame — the surface a page gets when it asks for nothing.",
	icon: "crop_square",
	axes: "style mech",
	mode: { style: "plain" },

	takeaway: "**Plain is the site's own floor with no frame at all — the surface a page gets when it asks for nothing.** It is the right answer far more often than it is chosen.",

	children: [
		leaf("A child", "Opened from a plain page. A child picks its own surface — a style is never inherited."),
		leaf("Another", "Two rows is enough to see what a surface does to a list."),
	],

	content(){
		this.lede();

		md("**Plain is the ambient floor** — `--wash`, the same fill every column body takes, and no frame at all. It is the right answer far more often than it is chosen: a page inside a frame inside a frame reads as a form, not as a place.");
		this.paging();
	},
});
