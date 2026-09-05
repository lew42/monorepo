import { Page, md } from "/app.js";

/* Container: a plain column of /imagine/'s row — the hub calls columns(), so a second
   call here would be inert (doc/columns.md, "shallowest ancestor" rule); removed rather
   than left in as a call that does nothing (2026-09-04). Size: `full`, same word every
   child already wears — an index this size in the ~40em default was the finding
   (paging/critique's "design" row: 31% of 3440 used, a bare word list). Own layout:
   `index: true` + previews() — the cards ARE the nav, core leaves its plain row list out.
   Regions: none. Preview: the default card. */

/**
 * The Design crawl — one overnight program (2026-09-01): a program visited every page on
 * the site and saved a screenshot of each. That whole picture library is **Journey**, the
 * first card below. Every other card studies those same screenshots to answer one design
 * question — padding, scale, layout, navigation, color, type, controls, themes — with real
 * examples pulled from the site, not opinions.
 */
export default new Page({
	meta: import.meta,
	title: "Design",
	description: "The design crawl — screenshots of the whole site, and one study per question: padding, scale, layout, navigation, color, type, controls, themes.",
	icon: "palette",
	width: "full",
	index: true,

	children: "journey padding scale layout navigation color type controls vocabulary system themes",

	content(){
		md("A program visited every page on the site overnight and saved a picture of each — that whole collection is **Journey**, the first card below. Every other card studies those same screenshots to answer one design question, with real examples from the site. **Open any card** to see it.");
		this.previews().style("--column", "20em");
	},
});
