import { View, div, a, code } from "/app.js";

/* The two exts this section leans on, imported here so a page only imports one
   file. Both are additive: highlight enhances the `code` factory in place and
   installs code.fn(); markdown installs View.prototype.md() and the md()
   factory. Neither touches anything the rest of the site uses. */
import "/framework/ext/highlight/highlight.js";
export { default as md } from "/framework/ext/markdown/md.js";

/* css: .claim, .claim-urls, .claim-url, .claim-note — and .md table, which is
   markdown's class, emitted by the md() re-exported directly above. */
View.stylesheet(import.meta, "urls.css");

/* claim(fn, urls) — the pairing this whole section is about.
 *
 * Code first, then the urls that code makes real, as live links. They are
 * ordinary anchors, so they get .active and .in-path from the same
 * Router.mark_links() pass as the sidebar — click one and watch the chip below
 * the code it came from go solid. The schema marking itself is the demo.
 *
 * The function is never called. code.fn() stringifies it (util/source), so an
 * example is live code the IDE checks rather than a string that can drift from
 * the url beside it.
 */
export function claim(fn, urls, note){
	return div.c("claim", () => {
		code.fn(fn);
		if (urls) visit(urls);
		if (note) div.c("claim-note", note);
	});
}

// a strip of urls to go and click
export function visit(urls){
	return div.c("claim-urls", () => [urls].flat().forEach(url => a.c("claim-url", url).href(url)));
}
