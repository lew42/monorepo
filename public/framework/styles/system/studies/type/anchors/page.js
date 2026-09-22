import { Page, View, md } from "/app.js";
import { AnchorStudy } from "./anchors.js";

View.stylesheet(import.meta, "anchors.css");

/**
 * The repeated anchor (2026-09-17). The owner's ask: "a pre-heading, an eyebrow, with an
 * underline. Then an H1, a paragraph, an H2 with a little bit of colored text after it …
 * it creates this little bit of color that's recognizable, it matches the theme, and it
 * creates that repetition … a visual anchor."
 *
 * Three copies of one post, word for word identical, differing only in how the mark after
 * each h2 is treated: the accent, a muted ink, or an accent underline. Anything else
 * differing between them would make the comparison worthless.
 *
 * Layout (the five questions). Container: a page under the /imagine/ COLUMNS host, so
 * there is no page grid and prose is capped at `--measure`. Size: `full`. Own layout: a
 * grid of three reading columns with BOTH ends bound — `minmax(min(20rem, 100%), 34em)`,
 * centred, so one post at 400, three from ~1050 up, and at 3440 they hold the measure and
 * give the leftover back instead of stretching to 1,100px each. Regions: two — the live
 * sentence, and the three posts. Preview: core's default card.
 *
 * Every size on the page is one of the site's six type levels. `anchors.css` declares no
 * `font-size` at all, which is the constraint the page is really about.
 */
export default new Page({
	meta: import.meta,
	title: "Anchors",
	description: "One post, three ways to mark it. Which one the eye finds.",
	icon: "bookmark",
	width: "full",

	content(){
		// A fresh study per render: each post holds live Views, and a reused study would
		// measure marks that are no longer on the page.
		const study = new AnchorStudy();

		study.takeaway_box();

		const $wall = study.wall();

		md("The three posts are the same words, the same levels and the same ink. **The only difference is the little mark after each h2** — the accent, a grey, or an accent underline. The eyebrow above each h1 is the same level as the mark, so a post is one small-label treatment repeated four times rather than two ideas sharing a page.");

		md.details(import.meta, "decisions.md", "The record — what was measured, what was judged, and the alternative")
			.ac("type-anchors-record");

		// Nothing can be read until the browser has laid the wall out.
		study.watch($wall);
	},
});
