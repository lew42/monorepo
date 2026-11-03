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

	// ⚠ SAYS "EDGES", NOT "WHITE BOX". The box holds stacked bands now, and one of
	//   them is dark — so the old wording pointed at something that is no longer on
	//   screen. What this page asks you to watch is where the box STOPS.
	lede_line: "Click the tabs on the page above and watch where the box stops — its four edges do not move. The line under it measures the box after every click.",

	/* ⚠ NOT AN ARTICLE. At 3440 this box is 2739px wide and an article's prose is
	     capped at the 720px reading measure, so the page's whole first screen was one
	     narrow column and 2,000px of white (paging-audit-3). The content word is not
	     the subject of this page — the BOX is — so it opens on a kind of content that
	     uses the width it is given. Every other kind is one click away on
	     [Content](/imagine/paging/content/).
	   ⚠ AND `sections`, NOT `cards`. This page and [Swap](/imagine/paging/mechanisms/swap/)
	     ran byte-identical configurations — tabs over a card wall — so the two pages
	     opened on a pixel-identical picture and clicking Stage in the rail looked like
	     it had done nothing (measured 2026-09-17). The two really are the same gesture
	     from two sides, which is why `places` below sends you from one to the other;
	     what they must not be is the same PICTURE. Stacked bands answer the width word
	     exactly as a card wall does, and the box's edges are what this page asks you to
	     watch. */
	config: { navigation: "tabs", content: "sections", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },

	places: [
		["Swap", "/imagine/paging/mechanisms/swap/", "four ways to draw the same swap, on one fixed-height stage"],
		["A docs page with tabs on top", "/imagine/paging/library/docs-tabs/", "the same stage, as a whole ready-made page"],
		["Navigation", "/imagine/paging/navigation/", "which gestures move the box, and which never do"],
	],
});
