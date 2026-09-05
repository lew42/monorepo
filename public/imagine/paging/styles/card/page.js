import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. This page IS the
   surface — it opens wearing it, and the chips let you leave it. */

export default new Paging({
	meta: import.meta,
	title: "Card",
	description: "White, padded, no border, a drop shadow — and the nav rows inside it go light grey so they still read.",
	icon: "credit_card",
	axes: "style mech",
	mode: { style: "card" },

	takeaway: "**A card is white, padded and shadowed, and it floats on the floor rather than replacing it.** The nav rows inside it then go a light grey, or they would vanish into the paper.",

	children: [
		leaf("A child", "Opened from a card page. A child picks its own surface — a style is never inherited."),
		leaf("Another", "Two rows is enough to see what a surface does to a list."),
	],

	content(){
		this.lede();

		md("**A card floats on the floor**, so the floor has to stay visible: the column keeps `--wash` and only the box inside it goes white. The nav rows then need a fill of their own or they vanish into the paper — the owner asked for light grey, and the answer is a rung of the alpha ladder (`--fill-a08`), which composites to light grey here and to a *light* rung inside the dark island with nothing restated.");
		this.paging();
	},
});
