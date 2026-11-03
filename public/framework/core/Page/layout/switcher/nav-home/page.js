import { Page, p } from "/app.js";

/**
 * A demo page for the "left nav" skin of the switcher pattern — a plain sidebar
 * feel (a soft fill on the current item, no flowing tab accent). See
 * core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "Home",
	description: "Demo page for the switcher's left-nav skin.",
	icon: "home",

	content(){
		p("A left nav is the same switcher again — a list on the left routes the content on the right — dressed as a quiet sidebar instead of a tab strip.");
	},
});
