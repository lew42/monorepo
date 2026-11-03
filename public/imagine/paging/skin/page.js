import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, then THREE nav grids — one per control.
   Regions: one. Preview: core's card.

   ⚠ TWO COLOURS, NOT ONE. The owner's report: "card gives the content a bg, whereas
     the other colors change the whole column. i think we want the ability to switch
     either one to any color." So there are two rows of the same five swatches — one
     paints the content box, one paints the page behind it — and they are independent.

   ⚠ THREE AXES, THREE PAGES. Skin is the one block that is more than one word, and
     until 2026-09-05 only the first of the three had a url: `background` and `type`
     were words the toolbar could set and no link could name (paging-audit-2b, fix 3).
     `axes:` gives each one its own page — /skin/surface/, /skin/background/,
     /skin/type/ — and each value under it, with no directories at all. */

export default block({
	meta: import.meta,
	title: "Skin",
	icon: "palette",
	description: "The colours and the type size.",

	axes: ["surface", "background", "type"],

	lede_line: "Change **content colour**, then **page colour**. They are two independent controls: one paints the box, one paints the page behind it — the dot beside each one shows where it is.",

	/* ⚠ OPENS ON THE DASHBOARD, not an article. Two reasons, and the second is the
	     one that picked it over a card wall: an article's prose is capped at the 720px
	     reading measure, so at 3440 this page's first screen was a narrow column in a
	     2,739px box (paging-audit-3) — and the dashboard's tiles are small islands, so
	     the CONTENT COLOUR is visible all around them, which is the thing this page is
	     about. A wall of cards would have covered it. */
	config: { navigation: "tabs", content: "dashboard", room: "wide", arrangement: "plain", surface: "card", background: "prim", type: "regular" },
});
