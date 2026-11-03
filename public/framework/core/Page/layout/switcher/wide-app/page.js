import { Page, p } from "/app.js";

/**
 * The second file in the switcher's WIDE demo frame. See wide-index/page.js and
 * core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "app.js",
	description: "Demo file for the switcher's wide comparison frame.",
	icon: "description",

	content(){
		p("Click back to index.js in the list on the left — the url changes, and the .active mark moves with it. Router did that, not this page.");
	},
});
