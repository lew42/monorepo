import { Page, View, div, p, a } from "/app.js";
import { issue } from "./issue.js";

View.stylesheet(import.meta, "mag.css");

/* THE COVER — /imagine/mag/, and the first thing a reader sees.

   Container: /imagine/'s column row. `column_host()` takes the SHALLOWEST columnar
   ancestor, so the magazine cannot open a row of its own and does not want one: the
   issue IS that row. Size: `full`, which folds the site's rail and the imagine index
   into the crumb strip and leaves the viewport; once the contents opens beside it the
   cover keeps its column and takes the minor share of the golden pair (mag.css §2).
   Own layout: two boxes — the AREA is the paper and the click target, the BLOCK inside
   it is the composition and the query container, so the title is a constant fraction
   of its own width at every size. Regions: one, core's, holding the contents.
   Preview: the default card on /imagine/'s rail.

   Every word on it comes from `issue.json` (issue.js), which is the only content file
   in the magazine. */

export default new Page({
	meta: import.meta,
	title: "Magazine",
	description: "Issue 01, The Column — a small magazine built out of the column program's own words.",
	icon: "auto_stories",

	width: "full",
	classes: "mag-cover",

	children: ["contents"],

	/* No head, no ×, no nav rail: on a cover those would be three pieces of chrome
	   saying what the sheet and the crumb strip already say. Core's `column()` is the
	   seam for exactly this, and the screens lab overrides it for the same reason.
	   ⚠ `page-column-full` is kept, not replaced — it is what folds the ancestors away,
	     and mag.css re-tunes only the two values that would push the contents off the
	     row. */
	column(host){
		return div.c("page-column-body mag-sheet").ac("page-column-" + this.width).append(() => {
			a.c("mag-cover-area").href(this.url + "contents/").append(() => {
				div.c("mag-cover-block", () => {
					div.c("mag-cover-rule");
					div.c("mag-eyebrow", `Issue ${issue.number} · ${issue.date}`);
					div.c("mag-cover-title", issue.title);
					p.c("mag-cover-note", issue.standfirst);
					div.c("mag-cover-enter", "Open the issue");
				});
			});
		});
	},
});
