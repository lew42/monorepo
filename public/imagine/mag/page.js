import { Page, View, div, p, a, span } from "/app.js";
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

	// `doc` is routing-only here: `column()` fully overrides how this cover renders
	// itself (no head, no rail, no child links at all — see below), so adding it
	// does not put a second link on the poster. It only makes `/imagine/mag/doc/`
	// resolve at all — undeclared, it 404'd no matter what a link's own href said
	// (readme.md's own `doc/decisions.md` link, fixed alongside this).
	children: ["contents", "doc"],

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
					this.coverlines();
				});
			});
		});
	},

	/* COVERLINES — the one thing a poster with a single button was missing: what a
	   real magazine cover always shows before you pick it up, the six things inside.
	   Real content, not decoration — the same section + title `contents/page.js`
	   lists, one tier smaller. `mag.css` hides this block the moment a child opens
	   (`.active-ancestor`), so it never touches the golden-share numbers below it —
	   a cover-only device, gone the instant you are actually reading. */
	coverlines(){
		div.c("mag-cover-lines", () => {
			div.c("mag-cover-lines-label", "In this issue");
			issue.articles.forEach((article, i) => div.c("mag-cover-lines-item", () => {
				span.c("mag-cover-lines-no", String(i + 1).padStart(2, "0"));
				span(article.title);
			}));
		});
	},
});
