import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened beside Toolbars. Size: the default
   track. Own layout: prose then the stage. Regions: one. Preview: core's card.

   Lands `top-inside` on `card` — the shape every page in this program already had,
   now literally nested inside the box rather than merely drawn before it. */

export default new Paging({
	meta: import.meta,
	title: "Top",
	description: "The toolbar above the content — the default every page in this program already had, now inside the card's own frame.",
	icon: "border_top",
	axes: "toolbar style",
	mode: { toolbar: "top-inside", style: "card" },

	takeaway: "**Top, inside the card: the toolbar shares the white padded frame with the content it controls.** This is the shape every page in this realm already had, now literally nested in the box.",

	children: [
		leaf("A row", "One of two, so there is something for the toolbar to sit above."),
		leaf("Another row", "Two rows is enough to see what the placement does to a list."),
	],

	content(){
		this.lede();

		md("**Top, inside the card.** Switch to `top-outside` and the toolbar jumps onto the floor above the white box — the frame it shares disappears with it.");
		this.paging();
	},
});
