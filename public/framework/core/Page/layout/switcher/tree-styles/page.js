import { Page, p } from "/app.js";

/**
 * A demo file for the "file tree" skin of the switcher pattern — same mechanism as
 * the vertical-tabs demos, only the CSS in switcher.css's `.switcher-skin-tree`
 * rules differ. See core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "styles.css",
	description: "Demo file for the switcher's file-tree skin.",
	icon: "description",

	content(){
		p("The list beside this is the same routed switcher as the tabs above, wearing the tree skin instead — monospace labels, a file glyph, nothing about how it routes changed.");
	},
});
