import { Page, View, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of three cards. Own
// layout: previews() wall. Regions: one. Preview: default card.
View.stylesheet(import.meta, "scroll.css");

export default new Page({
	meta: import.meta,
	title: "Scroll",
	description: "The scrollbar situation — full-viewport, a padded inset, or a flush bleed.",
	icon: "vertical_split",
	children: "full padded flush",

	content(){
		md("The owner's own test: a full-viewport scrollbar reads fine; a scroll region boxed inside a page's own padding feels cramped. Three columns, tall content, three scroll surfaces — click through, each ends in a one-line verdict.");
		this.previews();
	},
});
