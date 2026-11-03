import { Page, md, div } from "/app.js";
import { pictures, live, PARTS, column, title_column } from "../demo.js";

/* LAYOUT. Same container, size and grid as ../equal/; the only change is the first column,
   which is now a short title. Preview: the default card. */
export default new Page({
	meta: import.meta,
	title: "One short column",
	icon: "view_week",
	description: "The same row, with one short column.",

	content(){
		md("**Swap one column for a short one and the row stops matching.** The title card is stretched to the height of its neighbours, and its content sits at the top with an empty box under it. That hole is the mismatch.");
		pictures(import.meta, "short");
		live(() => div.c("grid three gap", () => {
			title_column({ centred: false });
			PARTS.slice(0, 2).forEach(column);
		}).style("--column", "16rem"));
	},
});
