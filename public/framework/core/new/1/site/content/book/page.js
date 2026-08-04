import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, run, raw, folded, section } from "../show.js";
import { crumbs, order_nav } from "../list.js";
import { slug } from "../slug.js";

/* A book: every chapter is a url, AND the whole thing reads end to end.
 *
 * The chapters are a manifest for the same reason posts.js is: the list, the
 * titles and the order have to be readable without importing anything, or the
 * table of contents costs three imports to draw three strings.
 */
const chapters = [
	{ name: "capture",  title: "Chapter one — the boundary" },
	{ name: "graph",    title: "Chapter two — one parent" },
	{ name: "manifest", title: "Chapter three — data, not doors" },
];

const chapter = name => chapters.find(ch => ch.name === name);

export default new Page({
	meta: import.meta,
	title: "A book that is also a page tree",

	// /content/book/<name>/ — one chapter, its own url, its own document.title
	route(name){
		const ch = chapter(name);
		const i = chapters.indexOf(ch);

		return ch && {
			title: ch.title,
			content(){
				crumbs(this);

				div.c("chapter-body", md.file(import.meta, ch.name + ".md", { h1: false }));

				section("The book");

				div.c("order-nav", () => [chapters[i - 1], chapters[i + 1]].forEach((neighbour, side) =>
					neighbour
						? a.c("page-link", (side ? "Next → " : "← Previous ") + neighbour.title).href("/content/book/" + neighbour.name + "/")
						: div.c("order-end", side ? "end of the book" : "start of the book")));

				a.c("page-link", "Read the whole book from here →").href("/content/book/#" + slug(ch.title));

				md("That last link is a **cross-page** fragment, so it will land you at the top of the book rather than at this chapter. `Router.go()` pushes `link.pathname` and the hash never survives the trip — the one real router bug this section found.").ac("note");
			},
		};
	},

	content(){
		run(() => {
			div.c("chapter-list", () => chapters.forEach(ch =>
				a.c("page-link", ch.title).href("/content/book/" + ch.name + "/")));

			// The id goes on the CONTAINER, synchronously — so the fragment target
			// exists before the chapter it names has been fetched.
			chapters.forEach(ch => div.c("chapter", $ch => {
				$ch.attr("id", slug(ch.title));

				div.c("chapter-body", md.file(import.meta, ch.name + ".md"));

				a.c("chapter-link", "read this chapter on its own url →")
					.href("/content/book/" + ch.name + "/");
			}));
		}, "content/book/page.js — the whole-book view, which is what follows");

		section("The trade");

		md([
			"| | `/content/book/` | `/content/book/graph/` |",
			"| --- | --- | --- |",
			"| `.md` fetched, cold | 3 | **3** — see below |",
			"| `.md` fetched, arriving by click | 3 | 0 |",
			"| ctrl-F finds | the whole book | one chapter |",
			"| a link can address | the book, or `#chapter-two-one-parent` | the chapter |",
			"| `document.title` | the book | the chapter |",
			"| breadcrumbs | book | book › chapter |",
		].join("\n"));

		md("**A deep url pays for its ancestors' `content()`.** `Router.activate` runs `to.slice(shared).forEach(p => p.activate())` root-to-leaf, and `activate()` renders — so landing directly on `/content/book/graph/` builds the whole-book view first and fetches all three chapters, then renders the chapter from cache. Measured: 3 `.md`, not 1. Arriving by *click* from the book costs 0, because `md.cache` already holds every chapter.").ac("note");

		md("That is not a bug and it is not free. It is the price of an ancestor that renders real content rather than a shell — and it is worth knowing before you put a fetch in a page that other pages sit underneath.").ac("note");

		md("**Both, and the trade is named:** the long read costs every chapter up front and gives the reader one document to search; the chapter urls cost one fetch each and give every chapter a title, a breadcrumb and a shareable address. Neither is a subset of the other, so the book renders twice from one set of files.");

		md("What it is **not** is a region. Making the book page a `$pages` region so a chapter renders *inside* it would show the chapter twice — once in the long read and once in the panel. Chapters replace the book, which is the default and costs nothing to opt into.").ac("note");

		show(() => {
			// The version that looks tempting and is wrong:
			const book = new Page({
				content(){ this.$pages = div.c("pages"); },   // chapters mount INSIDE me
			});
			// …and now the reader sees chapter two in the long read AND in the panel.
		}, "rejected");

		order_nav(this.url);

		folded("content/book/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});
