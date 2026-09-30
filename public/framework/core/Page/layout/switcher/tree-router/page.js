import { Page } from "/app.js";
import { source } from "/framework/ext/files/files.js";

/**
 * See tree-styles/page.js. Shows the pattern's real switcher.js — moved to
 * ext/tabs/switcher.js on 2026-09-29 (review-switcher.md note 7) — the routing
 * script this whole pattern is built on.
 */
export default new Page({
	meta: import.meta,
	title: "switcher.js",
	description: "The switcher pattern's own routing script, shown live in its file-tree skin.",
	icon: "description",

	content(){
		// See tree-styles/page.js's comment: content() must RETURN this so the page's
		// own captor can wait for and append ext/highlight's async code.file() promise.
		return source(import.meta, "/framework/ext/tabs/switcher.js");
	},
});
