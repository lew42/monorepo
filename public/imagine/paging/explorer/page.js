import { Page, a, md } from "/app.js";

/* /imagine/paging/explorer/ — what the page generator is, and the `code` tab this task
   added to it.

   Container: /imagine/paging/'s column row (a plain column of paging-core's hub).
   Size: `large` — prose and two links, one column, no grid. Own layout: `.flow` prose.
   Regions: none, a leaf. Preview: the default card. */

// ⚠ Keep this in step with specs.js's own "Magazine" entry (core/Page/generator/specs.js)
// — the SAME five-word spec text, so the link opens exactly that card.
const MAG_SPEC = [
	"wall full",
	"  list large",
	"    prose",
	"    prose",
	"    prose",
	"    prose",
	"    prose",
	"    prose",
].join("\n");

export default new Page({
	meta: import.meta,
	title: "Explorer",
	description: "The page generator, /imagine/mag/'s shape as a spec, and a code tab that shows how a click would be written by hand.",
	icon: "casino",
	width: "large",

	content(){
		md("**A whole tree of pages can be drawn from a few words of text, with no files on disk at all.** That is the page generator; this page says what it is, opens it on the magazine's own shape, and explains the `code` tab every generated page carries.").ac("paging-lede");

		md("Every page on this site is `meta: import.meta` plus a `content()` — but a WHOLE TREE of them can be built with no filesystem at all. The [page generator](/framework/core/Page/generator/) draws one from five words (`wall list prose tabs vtabs`, plus three width words) and turns each line into a real page: a real url, the real Router, core's own columns.");

		// ⚠ `target="_blank"`, not a plain in-app link: the SPA router's `go()` calls
		// `history.pushState()` only AFTER the generator module has already
		// constructed itself (Router.js's `go()`/`load()` order) — so a soft
		// navigation would run `land()` against the OLD hash and miss the spec
		// entirely. A new tab is a hard load: `location.hash` is right from the
		// first line. (`link_clicked()`, Router.js, already excludes `link.target`.)
		a.c("page-link", "Open the generator with /imagine/mag/'s shape selected →")
			.href("/framework/core/Page/generator/#s=" + encodeURIComponent(MAG_SPEC))
			.attr("target", "_blank");

		md("That is [the magazine](/imagine/mag/), in the generator's own words: a full-width cover (`wall full`) opens an inbox of six articles (`list large`), each the plain 40em measure (`prose`). Three words, the same shape — no ninth word needed.");

		md("**The `code` tab.** Every generated page now carries a small icon in its own head — a real url, `.../code/`, never a directory. It shows three things, and reuses `export.js` for two of them rather than printing a second copy:");

		md("1. **the spec** — this page's own line (and any nested lines) in the tree;");
		md("2. **the `page.js`** `export.js` would write for it, right now — the same function the real Export button calls;");
		md("3. **the calls** — as you switch this page's kind, width, or (on a wall/list) its arrangement, the matching line is appended here, live: `this.previews().style(...)`, a `width: \"large\",` field, whatever the click corresponds to in hand-written code.");

		md("Try it: open the [generator](/framework/core/Page/generator/), switch a page's kind or width a couple of times, then open its code tab.");
	},
});
