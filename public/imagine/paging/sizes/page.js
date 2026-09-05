import { md } from "/app.js";
import { Paging } from "../paging.js";

/* Container: a column in /imagine/'s row. Size: THIS PAGE'S OWN, live — the layout
   chips restamp the column width word on its box (`wide` → `large`, `full` → the
   whole row), so the page you are reading is the demo. Own layout: prose then the
   stage. Regions: one. Preview: core's card.

   TWENTY COMBINATIONS, FIVE PAGES. Content × layout is 5 × 4; a page each would be
   twenty near-identical modules that nobody reads. The toolbar is the twenty, and
   the four directories exist so a layout size has a url you can send. */

export default new Paging({
	meta: import.meta,
	title: "Sizes",
	description: "Two axes — how much content (xs to xl) and how much room (center to full) — and what happens where they meet.",
	icon: "aspect_ratio",
	axes: "content layout style",
	mode: { layout: "wide" },

	takeaway: "**Two questions about size, asked separately: how much content is there, and how much room does it get.** Press any chip and the box below changes IN PLACE — the caption under it then says exactly what changed, in pixels. Going up a content rung only ever ADDS: everything that was on screen is still on screen.",
	children: "center column wide full",

	content(){
		this.lede();

		md("**Two axes, twenty combinations, one toolbar.** Content is how much there is — `xs` a word · `s` a line · `m` a paragraph · `l` a section · `xl` a wall. Layout is how much room it gets — `center` floats it centre-centre in a narrow track · `column` is the default 40–46em · `wide` is core's `large` (28–64em) · `full` takes the row and collapses the ancestors.");

		md("Click across both rows. The interesting cells are the corners: **xs on full** is one word on 3166px of screen, and **xl on center** is a wall squeezed into 26em. Neither is a bug — they are what the two axes cost when they disagree, and the rule that falls out is the one the layout skill already says: *widening a column is never the fix for dead space.*");

		this.paging();
	},
});
