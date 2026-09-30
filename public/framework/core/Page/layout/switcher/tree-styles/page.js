import { Page } from "/app.js";
import { source } from "/framework/ext/files/files.js";

/**
 * A demo file for the "file tree" skin of the switcher pattern — same mechanism as
 * the vertical-tabs demos, only the CSS in switcher.css's `.switcher-skin-tree`
 * rules differ. Shows the pattern's real switcher.css, highlighted through
 * `ext/files`'s own `source()` (CLAUDE.md: "Files → ext/files") — so the tree demo is
 * a real file tree beside real code, not a paragraph about one (review-switcher.md
 * finding 1). See core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "switcher.css",
	description: "The switcher pattern's own stylesheet, shown live in its file-tree skin.",
	icon: "description",

	content(){
		// `code.file()` (ext/highlight) is ASYNC — its promise only lands if something
		// awaits and appends it, and `render()`'s own captor does exactly that for
		// whatever `content()` RETURNS (code skill: "no DOM after an await" — this is
		// the blessed form, not a violation of it, because nothing here builds after
		// the await; the return value carries the promise out to the captor that can).
		return source(import.meta, "/framework/core/Page/layout/switcher/switcher.css");
	},
});
