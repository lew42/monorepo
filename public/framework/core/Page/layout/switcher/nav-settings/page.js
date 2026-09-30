import { Page, p } from "/app.js";

/**
 * See nav-home/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "Settings",
	description: "Demo page for the switcher's left-nav skin.",
	icon: "settings",

	content(){
		p("Same routing, same active marks — only the CSS in .switcher-skin-nav changed.");
	},
});
