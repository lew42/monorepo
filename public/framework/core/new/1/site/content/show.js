import { div, details, summary } from "/app.js";
import { source } from "/framework/util/source/source.js";
import { code } from "/framework/ext/highlight/highlight.js";

/* Showing the code that produced the page — three helpers, one box.
 *
 * The box is site/ui.js's `.code`, borrowed on purpose: every other seat's pages
 * use it, and a section that invented its own frame would read as a different
 * site. What changes is what goes IN the box.
 *
 * `site/ui.js`'s code(source, label) takes a STRING. A string is dead text in
 * the editor — no highlighting, no completion, no formatting, no syntax errors —
 * and, worse for a docs page, nothing stops it drifting from the code it claims
 * to show. Everything here takes a real function or a real file instead.
 */

// A real function, stringified and highlighted. NEVER called — this is
// ext/highlight's code.fn(), not ext/demo's demo(), and the difference is the
// whole point: half these snippets describe a page.js that must not run twice.
export function show(fn, label){
	return div.c("code", () => {
		if (label) div.c("code-label", label);
		code.fn(fn);
	});
}

/* Show it, THEN run it — for a snippet that is literally this page's own body.
 *
 * One function, so the example cannot drift from what the reader is looking at.
 * ext/demo's demo() does the same and boxes the result; this leaves the result
 * standing where it was placed, because half of these recipes ARE the layout and
 * a frame around them would be a lie about how they sit on a page.
 *
 * The split is the point: show() for code that must not run (a page.js shape),
 * run() for code that must — and there is never a third copy of either.
 */
export function run(fn, label){
	show(fn, label);
	return fn();
}

/* A real file, fetched and highlighted — the module that rendered this page, or
 * the markdown behind it. Resolved against import.meta like md.file(), for the
 * same reason: the SPA fallback makes the document url the route, so a
 * document-relative fetch asks for a file that isn't there and gets index.html.
 *
 * code.file() returns a promise; the capture callback returns it and
 * append_promise puts it in a div that was placed synchronously.
 */
export function raw(meta, url, label){
	return div.c("code", () => {
		div.c("code-label", label ?? url);
		return code.file(meta, url);
	});
}

// Anything, collapsed. The whole source of a page is worth having on the page
// and not worth reading first.
export function folded(text, fn){
	return details.c("folded", () => {
		summary(text);
		fn();
	});
}

// Re-exported so a page in this section has one ui import, not two. section() is
// site/ui.js's — same heading as every other seat uses.
export { section } from "../ui.js";
