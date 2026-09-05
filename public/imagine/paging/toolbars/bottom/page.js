import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened beside Toolbars. Size: the default
   track. Own layout: prose then the stage — the box's flex order flips so the
   toolbar draws LAST, under the content. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Bottom",
	description: "The toolbar under the content, inside the card — read first, decide after.",
	icon: "border_bottom",
	axes: "toolbar style",
	mode: { toolbar: "bottom-inside", style: "card" },

	takeaway: "**Bottom, inside the card: the toolbar sits under the content, like a footer strip.** It is the placement that costs the content the least, and the one your eye finds last.",

	children: [
		leaf("A row", "One of two, read before the toolbar rather than after it."),
		leaf("Another row", "Two rows, then the chips."),
	],

	content(){
		this.lede();

		md("**Bottom, inside the card.** One `order: 1` on the toolbar; the box stays a column. Switch to `bottom-outside` and it drops onto the floor below the box instead.");
		this.paging();
	},
});
