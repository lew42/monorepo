import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: this page opens on the `wide` layout
   word and the chips move it — `dress()` restamps the column class on its own box.
   Own layout: prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Wide",
	description: "Core's large: 28-64em, for a grid, a table, a wall - content that earns the room.",
	icon: "view_column",
	axes: "content layout style",
	takeaway: "**Wide is core's `large` track: 28 to 64em, so it grows with the screen instead of staying put.** Reach for it when the content is a wall or a table, never to fill space.",

	mode: { layout: "wide", content: "xl" },

	children: [
		leaf("A child", "Every page picks its own room. A layout word is never inherited."),
		leaf("Another", "Two rows, so the list can be seen against the width."),
	],

	content(){
		this.lede();

		md("**Wide is for content that is not prose.** This is core `large` — 28em floor, 64em ceiling. Set the content chip to `xl` and the wall uses every track; set it to `s` and the same width is dead space. That is the whole test for reaching for it.");
		this.paging();
	},
});
