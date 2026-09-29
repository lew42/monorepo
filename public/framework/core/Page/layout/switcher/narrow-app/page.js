import { Page, p } from "/app.js";

/**
 * See narrow-index/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "app.js",
	description: "Demo file for the switcher's narrow comparison frame.",
	icon: "description",

	content(){
		p("At this width the list above collapsed to a one-row header showing just the active file. Tap it to see the other one.");
	},
});
