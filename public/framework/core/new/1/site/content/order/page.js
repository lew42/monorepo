import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, run, raw, folded, section } from "../show.js";
import { reading } from "../posts.js";
import { order_nav } from "../list.js";

export default new Page({
	meta: import.meta,
	title: "Prev / next through a reading order",

	content(){
		show(() => {
			// The order the AUTHOR wants, which is not the date order and not the
			// declaration order of anything. It crosses four parents.
			const reading = [
				{ url: "/content/article/",                        title: "A page whose content is a file" },
				{ url: "/content/blog/2026-06-18-dates-are-data/", title: "Dates are data, not structure" },
				{ url: "/content/tags/",                           title: "Tags — the case the tree cannot express" },
			];

			function neighbors(url){
				const i = reading.findIndex(step => step.url === url);
				return i === -1 ? [null, null] : [reading[i - 1] ?? null, reading[i + 1] ?? null];
			}
		}, "posts.js — the sequence, and the whole of prev/next");

		md("`children` is a `Map` in declaration order, so prev/next **within one parent** is free. This sequence has four different parents in it, one entry is a `route()` claim with no file behind it, and the order is not the declaration order of anything. So it is a list, and a list is data.");

		section("The sequence");

		run(() => div.c("post-list", () => reading.forEach((step, i) =>
			a.c("post", () => {
				div.c("post-date", "step " + (i + 1));
				div.c("post-title", step.title);
				div.c("post-blurb", step.url);
			}).href(step.url))), "rendered from the array above");

		md("Follow it from the top and every page in it carries the bar below, pointing at its neighbours in **this** list rather than at its siblings in the tree.");

		section("Why the title is repeated in the list");

		md("It looks like duplication and it is the point: an entry carrying its own title means drawing *\"Next: A page whose content is a file\"* costs **zero imports**. If the entry held only a url, every prev/next bar on the site would import the page it points at just to ask its name — and that is the lazy-title trap arriving through the back door.");

		md("The cost is that renaming a page means editing two places and nothing catches it. Seven lines in one file is a cheap place for that risk to live.").ac("note");

		section("What a framework could offer instead");

		show(() => {
			// PROPOSED, and argued against below.
			const page = new Page({ sequence: reading });

			page.next();   // -> { url, title } | null
			page.prev();
		}, "a sequence a page opts into");

		md("**Dissent recorded: do not add this.** Prev/next over an author-supplied list is the six lines above, in userland, where it can be read. A framework method would have to decide what happens when a page appears twice in one list, or in two lists, or in none — three questions the list itself never raises. The list is doing the work; the API would only be somewhere to put it.");

		section("Where a framework does earn its keep");

		md("The part userland cannot reach: `Router.go()` pushes `link.pathname` and drops the fragment, so a cross-page anchor lands at the top of the document. That one is a bug, not a design, and the exact diff is in the report.").ac("note");

		order_nav("/content/article/");

		md("↑ that bar is `order_nav(\"/content/article/\")` — rendered here for the *first* page in the sequence, so you can see both ends of it without leaving this page.").ac("note");

		folded("content/order/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});
