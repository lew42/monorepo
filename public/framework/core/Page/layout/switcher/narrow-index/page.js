import { Page } from "/app.js";
import { source } from "/framework/ext/files/files.js";

/**
 * The same two-file demo as wide-index/wide-app, but routed separately so this
 * frame's own tabs() call gets its own regions — a SEPARATE instance of the exact
 * same pattern, boxed to about 400px to prove the container-query collapse without
 * resizing the window. Shows the pattern's own switcher.css through ext/files's
 * `source()` (real, on disk, and long enough to scroll) rather than a stand-in
 * paragraph — review-switcher.md finding 4 wanted a scroll long enough to prove the
 * narrow frame's sticky header really stays pinned while its content moves under it.
 * See core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "index.js",
	description: "Demo file for the switcher's narrow comparison frame — real, scrollable source.",
	icon: "description",

	content(){
		// See core/Page/layout/switcher/tree-styles/page.js's comment: content() must
		// RETURN this so the page's own captor can wait for and append ext/highlight's
		// async code.file() promise.
		return source(import.meta, "/framework/core/Page/layout/switcher/switcher.css");
	},
});
