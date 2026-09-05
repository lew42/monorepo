import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: this page opens on the `column` layout
   word and the chips move it — `dress()` restamps the column class on its own box.
   Own layout: prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Column",
	description: "The default track: a 16em floor and a 40-46em ceiling that grows with the row.",
	icon: "view_agenda",
	axes: "content layout style",
	takeaway: "**Column is the default reading track — 40 to 46em, the width prose is comfortable at.** A page that says nothing about its width gets this one.",

	mode: { layout: "column", content: "m" },

	children: [
		leaf("A child", "Every page picks its own room. A layout word is never inherited."),
		leaf("Another", "Two rows, so the list can be seen against the width."),
	],

	content(){
		this.lede();

		md("**The default, and the one to leave alone.** 16em floor, and a ceiling that scales with the row — 40em until the row passes about 110em, then up to 46em. Prose belongs here and nowhere wider; every other word on this axis is for content that is *not* a paragraph.");
		this.paging();
	},
});
