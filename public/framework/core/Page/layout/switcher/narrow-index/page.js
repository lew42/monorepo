import { Page, p } from "/app.js";

/**
 * The same two-file demo as wide-index/wide-app, but routed separately so this
 * frame's own tabs() call gets its own regions — a SEPARATE instance of the exact
 * same pattern, boxed to about 400px to prove the container-query collapse without
 * resizing the window. See core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "index.js",
	description: "Demo file for the switcher's narrow comparison frame.",
	icon: "description",

	content(){
		p("Same file, same label as the wide frame's — a different route under the hood, so both frames can be live on this page at once.");
	},
});
