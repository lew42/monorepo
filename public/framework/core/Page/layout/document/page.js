import { Page, div } from "/app.js";
import detail from "../detail.js";

export default new Page(detail({
	meta: import.meta,
	title: "Document",
	description: "A header, one column of reading, a footer — the layout every other one here is a departure from.",
	icon: "article",
	group: "Pages",

	parts: "header footer sticky",

	note: "Four words on the page, two on the column. Drag the handle: the measure holds its width at 3440 while the header wraps on its own at 390, and there is no media query in either.",

	layout(site){

		/* `full` zeroes the sheet, `fill` makes the page BE its region's height,
		   `flex v` stacks the three bands. The middle one takes the slack. */
		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			/* ⚠ The SCROLLER is the band, not the column: a page inside a region
			   never grows its own scrollbar (Page.css), so the layout has to say
			   which band absorbs the overflow. */
			div.c("flex-1", () => {
				div.c("measure flow", () => {
					site.hero();
					site.sections(4, this.shows("sticky"));
				}).style({ "--measure": "46em", padding: "0 2em 3em" });
			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
