import { Page, View, img, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of three cards. Own
// layout: previews() wall. Regions: one. Preview: a real still, not the icon
// (2026-09-05 ux-rethink — nine reviewers' biggest repeated win). The shot
// lives in vary/shots/ (one lab, one still), not here/ — this page has no
// shots/ of its own.
View.stylesheet(import.meta, "scroll.css");

export default new Page({
	meta: import.meta,
	title: "Scroll",
	description: "The scrollbar situation — full-viewport, a padded inset, or a flush bleed.",
	icon: "vertical_split",
	children: "full padded flush",

	preview(nav){
		return this.preview_card(nav, () => img().attr("src", "/imagine/vary/shots/scroll.jpg").attr("alt", nav.label)
			.style({ display: "block", width: "100%", height: "100%", "object-fit": "cover" }));
	},

	content(){
		md("The owner's own test: a full-viewport scrollbar reads fine; a scroll region boxed inside a page's own padding feels cramped. Three columns, tall content, three scroll surfaces — click through, each ends in a one-line verdict.");
		this.previews();
	},
});
