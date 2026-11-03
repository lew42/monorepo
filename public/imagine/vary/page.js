import { Page, md } from "/app.js";

// Container: /imagine/'s own $pages region. Size: `large` (28–64em) — NOT the
// default ~40em, which left 4 cards stacked 2×2 with 2180px dead at 3440
// (paging/critique's "vary" row, score 61); `large` is the pattern gallery/
// used for the same problem (its own doc/decisions.md) and previews() below
// still claims `bleed` inside it. Own layout: previews() wall. Regions: one.
// Preview: default card.
// ⚠ NOT `width: "full"` — tried in gallery/ and reverted (collapses /imagine/'s
// own hub rail for as long as you stay inside the realm); `large` fits all
// four cards in one row at 3440 without paying that price.

export default new Page({
	meta: import.meta,
	title: "Vary",
	description: "Four variation trees — scrollbars, background hierarchy, child placement, column looks.",
	icon: "science",
	index: true,
	width: "large",
	children: "scroll tone place colstyles",

	content(){
		md("Four labs, each a tree of variations under one question — click through, each variation ends in a one-line verdict.");
		this.previews().style("--column", "15em");
	},
});
