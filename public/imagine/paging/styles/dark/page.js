import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. This page IS the
   surface — it opens wearing it, and the chips let you leave it. */

export default new Paging({
	meta: import.meta,
	title: "Dark",
	description: "A colour-scheme island: one declaration, and every token below it flips.",
	icon: "dark_mode",
	axes: "style mech",
	mode: { style: "dark" },

	takeaway: "**Dark is not a second palette — it is one declaration, `color-scheme: dark`, and every token below it flips.** Ink, lines and all four fill rungs change with nothing restated.",

	children: [
		leaf("A child", "Opened from a dark page. A child picks its own surface — a style is never inherited."),
		leaf("Another", "Two rows is enough to see what a surface does to a list."),
	],

	content(){
		this.lede();

		md("**One declaration, not a palette.** `color-scheme: dark` on this box, and every `light-dark()` token used inside it resolves to its dark value — ink, lines, and all four fill rungs — because `light-dark()` reads the scheme where it is USED. Nothing below restates a colour, which is why the rows and chips here need no dark rules of their own.");
		this.paging();
	},
});
