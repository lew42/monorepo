import { Page, p } from "/app.js";

/**
 * The wide side of the "wide vs narrow" comparison — a SEPARATE route from
 * wide-index/page.js (used by the skins section further down the same page.js),
 * even though the label is the same. Calling `this.switcher()` twice with the SAME
 * child names on one page overwrites the first call's mounting region — this pair
 * exists so the comparison demo and the vertical-tabs skin demo never collide. See
 * core/Page/layout/switcher/page.js and doc/decide.md.
 */
export default new Page({
	meta: import.meta,
	title: "index.js",
	description: "Demo file for the switcher's wide comparison frame.",
	icon: "description",

	content(){
		p("This is the file the wide frame shows first — a stand-in, so the switcher pattern has something real to route between.");
	},
});
