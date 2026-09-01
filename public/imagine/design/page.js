import { Page, md } from "/app.js";

/**
 * The Design crawl — one overnight program (2026-09-01): browse the site with a headless
 * camera, and study what the shots show. One column per question; every study leads with
 * pictures and keeps the words short. The journey itself — every page, every width — is
 * the first card.
 */
export default new Page({
	meta: import.meta,
	title: "Design",
	description: "The design crawl — screenshots of the whole site, and one study per question: padding, scale, layout, navigation, color, type, controls, themes.",
	icon: "palette",
	width: "small",

	initialize(){ this.columns(); },

	children: "journey padding scale layout navigation color type controls vocabulary system themes",

	content(){
		md("A camera walked the site overnight. **Journey** is everything it saw; each study after it asks the shots one question.");
	},
});
