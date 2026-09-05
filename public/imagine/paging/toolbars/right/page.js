import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened beside Toolbars. Size: the default
   track. Own layout: prose then the stage, a flex ROW (box) with the toolbar as a
   narrow LAST column — the content reads first, the controls trail it. Regions: one.
   Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Right",
	description: "The toolbar pinned to the right, inside the card — content first, controls trailing.",
	icon: "border_right",
	axes: "toolbar style",
	mode: { toolbar: "right-inside", style: "card" },

	takeaway: "**Right, inside the card: the same rail, on the other side.** A right-hand toolbar reads as properties of the thing beside it; a left-hand one reads as navigation.",

	children: [
		leaf("A row", "One of two, reading before the toolbar rather than after it."),
		leaf("Another row", "Two rows, with the rail on the far side."),
	],

	content(){
		this.lede();

		md("**Right, inside the card.** Same rail as `left`, mirrored — `order` on the toolbar, not a second stylesheet. Switch to `right-outside` and it moves onto the floor beside the box.");
		this.paging();
	},
});
