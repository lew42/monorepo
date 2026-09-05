import { Page, View, img, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of three cards. Own
// layout: previews() wall. Regions: one. Preview: a real still, not the icon
// (2026-09-05 ux-rethink). Shot lives in vary/shots/.
View.stylesheet(import.meta, "place.css");

export default new Page({
	meta: import.meta,
	title: "Place",
	description: "Placement systems side by side — add a column, swap in place, or cycle a carousel.",
	icon: "compare_arrows",
	children: "add swap carousel",

	preview(nav){
		return this.preview_card(nav, () => img().attr("src", "/imagine/vary/shots/place.jpg").attr("alt", nav.label)
			.style({ display: "block", width: "100%", height: "100%", "object-fit": "cover" }));
	},

	content(){
		md("The same four items, three placement systems — click through, each ends in a one-line verdict.");
		this.previews();
	},
});
