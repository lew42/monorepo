import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, a nav grid. Regions: one. Preview: core's
   card, in the rail's first section.

   THE STAGE IS THE ONLY BLOCK WITH NO WORD — it is the box the other five words act
   on. So this page has no control of its own: it is the box, holding still, while
   you click things inside it. The caption under it measures the box every time. */

export default block({
	meta: import.meta,
	title: "Stage",
	icon: "crop_square",
	description: "The box a click changes the inside of. It never moves.",

	axis: null,

	lede_line: "Click the tabs on the page below and watch its white box. The line under it measures the box after every click.",

	/* ⚠ OPENS ON A CARD WALL, NOT AN ARTICLE. At 3440 this box is 2739px wide and an
	     article's prose is capped at the 720px reading measure, so the page's whole
	     first screen was one narrow column and 2,000px of white (paging-audit-3). The
	     content word is not the subject of this page — the BOX is — so it opens on the
	     one kind of content that uses the width it is given. Every other kind is one
	     click away on [Content](/imagine/paging/content/). */
	config: { navigation: "tabs", content: "cards", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },

	places: [
		["Swap", "/imagine/paging/mechanisms/swap/", "four ways to draw the same swap, on one fixed-height stage"],
		["A docs page with tabs on top", "/imagine/paging/library/docs-tabs/", "the same stage, as a whole ready-made page"],
		["Navigation", "/imagine/paging/navigation/", "which gestures move the box, and which never do"],
	],
});
