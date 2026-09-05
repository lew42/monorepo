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

	lede_line: "Change the **arrangement** dropdown. The content in the box never changes — only what is arranged around it.",

	/* ⚠ A CARD WALL, so the box is full at 3440. The content in the box is beside the
	     point here — the chrome around it is the subject — and an article capped at the
	     720px reading measure left 2,000px of the 2,739px box white (paging-audit-3). */
	config: { navigation: "none", content: "cards", room: "wide", arrangement: "bar-top", surface: "card", background: "tint", type: "regular" },
});
