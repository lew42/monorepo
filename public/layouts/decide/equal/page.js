import { Page, md, div } from "/app.js";
import { pictures, live, PARTS, column } from "../demo.js";

/* LAYOUT. Container: a child of /layouts/decide/, the ordinary page grid. Size: the demo is
   three columns, so it claims `wide`; the sentence stays in `main`. Own layout: `grid three`,
   three equal tracks that stack below three times --column. Preview: the default card. */
export default new Page({
	meta: import.meta,
	title: "Three equal columns",
	icon: "view_week",
	description: "Three columns that end at the same height.",

	content(){
		md("**Three columns fill a wide screen well when their content is about the same height.** Each card below holds about forty words, so the row ends in one straight line and no box has a hole in it.");
		pictures(import.meta, "equal");
		live(() => div.c("grid three gap", () => PARTS.forEach(column)).style("--column", "16rem"));
	},
});
