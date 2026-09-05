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

	lede_line: "Click a swatch under **content colour**, then one under **page colour**. They are two independent controls: one paints the box, one paints the page behind it.",

	config: { navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "prim", type: "regular" },
});
