import { Page, p } from "/app.js";

/**
 * See cmp-w-index/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "app.js",
	description: "Demo file for the switcher's wide comparison frame.",
	icon: "description",

	content(){
		p("Click back to index.js in the list beside this — the url changes, and the .active mark moves with it. Router did that, not this page.");
	},
});
