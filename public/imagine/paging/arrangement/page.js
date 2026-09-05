import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide` —
   a rail plus a content box needs the leftover. Own layout: a sentence, one live
   page, a nav grid of seven. Regions: one. Preview: core's card.

   Arrangement is where the page's OTHER parts sit: a bar, a rail, an aside. The
   sibling realm /imagine/layouts/ owns the numbered layouts these compile to, and
   each value below names its number rather than inventing a second vocabulary. */

export default block({
	meta: import.meta,
	title: "Arrangement",
	icon: "view_quilt",
	description: "Where the page's other parts sit around the box.",

	axis: "arrangement",

	lede_line: "Click an **arrangement** chip. The content in the box never changes — only what is arranged around it.",

	config: { navigation: "none", content: "article", room: "wide", arrangement: "bar-top", surface: "card", background: "tint", type: "regular" },
});
