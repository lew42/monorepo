import { Page, View, img, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of five cards. Own
// layout: previews() wall. Regions: one. Preview: a real still, not the icon
// (2026-09-05 ux-rethink). Shot lives in vary/shots/.
View.stylesheet(import.meta, "tone.css");

export default new Page({
	meta: import.meta,
	title: "Tone",
	description: "Background hierarchy across columns — stepping, alternating, flipping, or picked live.",
	icon: "gradient",
	children: "up down alt flip live",

	preview(nav){
		return this.preview_card(nav, () => img().attr("src", "/imagine/vary/shots/tone.jpg").attr("alt", nav.label)
			.style({ display: "block", width: "100%", height: "100%", "object-fit": "cover" }));
	},

	content(){
		md("The same three-deep tree, five background schemes — four fixed exemplars and one live control (controls over files). Click through; each fixed exemplar ends in a one-line verdict.");
		this.previews();
	},
});
