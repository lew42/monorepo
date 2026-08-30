import { Page, md } from "/app.js";

// Container: /imagine/'s own $pages region, a plain index — `main` prose width is
// fine, previews() below claims `bleed` on its own. Size: one row of three cards.
// Own layout: previews() wall. Regions: one. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Vary",
	description: "Three variation trees — scrollbars, background hierarchy, child placement.",
	icon: "science",
	index: true,
	children: "scroll tone place colstyles",

	content(){
		md("Three labs, each a tree of variations under one question — click through, each variation ends in a one-line verdict.");
		this.previews();
	},
});
