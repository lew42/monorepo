import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened beside Toolbars. Size: the default
   track — narrow enough that a left toolbar visibly competes with the content for
   width, which is the point of this page. Own layout: prose then the stage, now a
   flex ROW (box) with the toolbar as a narrow first column. Regions: one. Preview:
   core's card. */

export default new Paging({
	meta: import.meta,
	title: "Left",
	description: "The toolbar pinned to the left, inside the card — a column beside the content, not above it.",
	icon: "border_left",
	axes: "toolbar style",
	mode: { toolbar: "left-inside", style: "card" },

	takeaway: "**Left, inside the card: the toolbar is a narrow rail beside the content rather than a ribbon above it.** The chip groups stack, so a run of them reads as a rail.",

	children: [
		leaf("A row", "One of two, so the content column has something in it."),
		leaf("Another row", "Two rows, next to the toolbar rather than under it."),
	],

	content(){
		this.lede();

		md("**Left, inside the card.** The chip groups stack instead of wrapping, so a vertical run of them reads as a rail rather than a ribbon. Switch to `left-outside` and the same rail moves onto the floor beside the box.");
		this.paging();
	},
});
