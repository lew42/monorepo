import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { run, raw, folded, section } from "../show.js";
import { order_nav } from "../list.js";
import { slug } from "../slug.js";

/* Fill a contents list from a document that has just been parsed and is not yet
 * in the page. querySelectorAll works fine on a detached element, which is what
 * makes this possible at all — the headings exist before they are visible.
 *
 * `$toc.append(fn)` and not bare factory calls: this runs inside a `.then`, where
 * View.captor is whatever the app happened to be building last. append_fn pushes
 * $toc, so every link lands where it was meant to.
 */
export function contents($doc, $toc){
	$toc.append(() => $doc.el.querySelectorAll("h2, h3").forEach(heading => {
		heading.id ||= slug(heading.textContent);

		a.c("toc-link toc-" + heading.tagName.toLowerCase(), heading.textContent)
			.href("#" + heading.id);
	}));

	return $doc;
}

export default new Page({
	meta: import.meta,
	title: "A table of contents from headings",

	content(){
		run(() => {
			// The headings arrive AFTER an await, so a TOC built at render time
			// finds nothing. Place both containers now; fill them when it lands.
			div.c("toc-layout", () => {
				const $toc = div.c("toc");

				div.c("toc-body", $body => {
					md.file(import.meta, "long.md", { h1: false }).then($doc => {
						$body.append(contents($doc, $toc));
						this.app?.router?.mark_links();   // links inside fetched prose
					});
				});
			});
		}, "content/toc/page.js — and what you are reading below IS this function");

		md("Two containers captured **synchronously**, one `.then` that names both. `$body.append(…)` is explicit because the ambient captor is long gone by the time the fetch settles — inside a `.then` there is no such thing as \"here\".");

		md("`mark_links()` is re-run for the links **inside** the fetched markdown: `Router.mark()` made its pass before this document existed, so every in-app link in the prose would otherwise never get `.active` or `.in-path`. Same gap the tab bar hit, same one-line fix.").ac("note");

		section("Anchors");

		md([
			"| link | what happens |",
			"| --- | --- |",
			"| `#heading` on **this** page | `link_clicked()` returns `null` — not ours — and the browser scrolls natively. Correct by doing nothing. |",
			"| `/other/#heading` from elsewhere | `go(link.pathname)` **drops the hash**. Right page, top of the document. |",
		].join("\n"));

		md("Try it: [/content/book/#chapter-two-one-parent](/content/book/#chapter-two-one-parent) is a real id on a real page, and you will land at the top of it. Use the same fragment once you are already on `/content/book/` and it scrolls. The difference is one `if` in `Router.link_clicked`, and the fix is in the report.").ac("note");

		md("Second finding, from the same pass: **every link in the list above is marked `.active`.** `mark_links()` compares `link.pathname === here`, and a fragment-only href reports the *current* pathname — so all nine match at once. Measured 9 of 9. Nothing here styles `.toc-link.active`, because it would light the whole list.").ac("note");

		order_nav(this.url);

		folded("content/toc/page.js, verbatim", () => raw(import.meta, "page.js"));

		folded("long.md, verbatim", () => raw(import.meta, "long.md"));
	}
});
