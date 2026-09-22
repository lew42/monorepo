import { Page, View, h2, md } from "/app.js";
import { SectionsStudy } from "./sections.js";

// Two sheets on purpose. The sliders, the slider row and the takeaway box are the
// sibling study's, worn as they are; only the walls are this page's own.
View.stylesheet(import.meta, "../color-study.css");
View.stylesheet(import.meta, "sections.css");

/**
 * Where two grounds meet (2026-09-17). The owner's ask: "how white interacts with light
 * gray, how dark interacts with light … entire sections, where they meet, whether one is
 * nested inside the other creates a whole visual effect."
 *
 * Layout (the five questions). Container: a plain page under its own study
 * (moved from the /imagine/ columns host 2026-09-18, `ai/2026-09-18/imagine-move-2/`).
 * Size: `full`, the word every sibling study wears. Own layout: `.grid.auto` with `--column: 19rem` —
 * the site's word for a wall; one cell at 400, three at 1280, seven or eight at 3440.
 * Regions: three, in importance order — the sliders with the live sentence under them,
 * the stacked wall, the nested wall. Preview: core's default card; the parent links it
 * in a sentence of its own.
 *
 * Every number on this page is read off the rendered pixels by `sections.js`, which is
 * the lighten/darken study's own class with three methods added — not a copy of it.
 */
export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "Every pairing of grounds, and every nesting.",
	icon: "layers",
	width: "full",

	content(){
		// A fresh study per render: every cell holds a live View, so reusing one across
		// renders would measure boxes that are no longer on the page.
		const study = new SectionsStudy();

		// The sliders first, and the sentence they rewrite directly under them.
		study.lab();

		h2("Stacked");
		md("Two sections, one above the other, the seam running the full width of the cell. **The only thing that changes from one cell to the next is the ground under the text.** Each half names its ground, the colour the browser composited, and what the body ink measures on it.");

		const $seams = study.seams();

		h2("Nested");
		md("The same thirty, one inside the other; the card is padded because it has a ground of its own. **The first cell is not one of the thirty** — it is this theme's own card on this theme's own page floor.");

		study.nests();

		md.details(import.meta, "decisions.md", "The record — what was measured, what was judged, and the alternative")
			.ac("color-record");

		// Nothing can be read until the browser has laid a wall out.
		study.watch($seams);
	},
});
