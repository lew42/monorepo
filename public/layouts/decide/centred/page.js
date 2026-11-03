import { Page, md, div } from "/app.js";
import { pictures, live, PARTS, column, title_column } from "../demo.js";

/* LAYOUT. Same container, size and grid as ../short/; the only change is `h-center` on the
   title card, which centres it vertically (see title_column in ../demo.js). Preview: the
   default card. */
export default new Page({
	meta: import.meta,
	title: "The fix: centre the title",
	icon: "vertical_align_center",
	description: "The short title column, vertically centred.",

	content(){
		md("**Centre the short column vertically and the empty space becomes breathing room.** The same three cards as the last demo, with one change: the title sits in the middle of its box. It now reads as the heading of the row, and the eye finds it first.");
		pictures(import.meta, "centred");
		live(() => div.c("grid three gap", () => {
			title_column({ centred: true });
			PARTS.slice(0, 2).forEach(column);
		}).style("--column", "16rem"));
	},
});
