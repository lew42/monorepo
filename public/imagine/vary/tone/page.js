import { Page, View, md } from "/app.js";

// Container: vary/'s own $pages region. Size: one row of five cards. Own
// layout: previews() wall. Regions: one. Preview: default card.
View.stylesheet(import.meta, "tone.css");

export default new Page({
	meta: import.meta,
	title: "Tone",
	description: "Background hierarchy across columns — stepping, alternating, flipping, or picked live.",
	icon: "gradient",
	children: "up down alt flip live",

	content(){
		md("The same three-deep tree, five background schemes — four fixed exemplars and one live control (controls over files). Click through; each fixed exemplar ends in a one-line verdict.");
		this.previews();
	},
});
