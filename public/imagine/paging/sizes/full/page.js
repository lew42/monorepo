import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: this page opens on the `full` layout
   word and the chips move it — `dress()` restamps the column class on its own box.
   Own layout: prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Full",
	description: "The whole row: every ancestor column collapses into the crumb strip above.",
	icon: "fullscreen",
	axes: "content layout style",
	takeaway: "**Full takes the whole row, and every page behind it collapses into the crumb strip.** It is the same word as the `takeover` mechanism, said as a size instead of as a gesture.",

	mode: { layout: "full", content: "l" },

	children: [
		leaf("A child", "Every page picks its own room. A layout word is never inherited."),
		leaf("Another", "Two rows, so the list can be seen against the width."),
	],

	content(){
		this.lede();

		md("**Full is takeover, said as a size.** The same word, the same `:has()` rule — the mechanism axis and the layout axis meet here, because *filling the screen* and *taking over* are one declaration. Switch the layout chip back to `column` and the rail, the hub and Sizes come straight back.");
		this.paging();
	},
});
