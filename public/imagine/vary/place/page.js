import { Page, View, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of three cards. Own
// layout: previews() wall. Regions: one. Preview: default card.
View.stylesheet(import.meta, "place.css");

export default new Page({
	meta: import.meta,
	title: "Place",
	description: "Placement systems side by side — add a column, swap in place, or cycle a carousel.",
	icon: "compare_arrows",
	children: "add swap carousel",

	content(){
		md("The same four items, three placement systems — click through, each ends in a one-line verdict.");
		this.previews();
	},
});
