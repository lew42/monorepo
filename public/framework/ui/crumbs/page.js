import { Page, md, demo, div, a, span, icon, h2 } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const crumbs = () => div.c("ui-crumbs flex wrap v-center h4 gap", () => {
	a.c("page-link", "Framework").href("/framework/");
	span.c("muted", "/");
	a.c("page-link", "UI").href("/framework/ui/");
	span.c("muted", "/");
	span.c("muted", "Breadcrumbs");
}).style("--gap", "0.5em");

const chevrons = () => div.c("ui-crumbs flex wrap v-center gap", () => {
	// `/` is never marked in-path (it is a prefix of everything), so this one says
	// what colour it is.
	a.c("page-link", () => icon("home")).href("/").style("color", "var(--ink)");

	["/framework/", "/framework/ui/"].forEach(url => {
		icon("chevron_right").style({ color: "var(--subtle)", fontSize: "1em" });
		a.c("page-link", url.split("/").at(-2)).href(url);
	});
}).style("--gap", "0.3em");

/* The card's own context — the trail above the page heading it belongs to, since
   the trail alone was one thin line at zoom-50 (wall-polish, 2026-08-17). */
const context = () => div.c("pad flex v gap", () => {
	crumbs();
	h2("Breadcrumbs");
}).style("--gap", "0.4em");

export default new Page({
	meta: import.meta,
	title: "Breadcrumbs",
	description: "A template, not a function — a trail derives from where you are, not from typed pairs.",
	icon: "chevron_right",

	children: [
		demo.page("chevrons", chevrons, {
			note: "A slash, a chevron, an icon root — the thing a function has to decide for you and the reason there isn't one. `icon()` is a ligature span with `flex: 0 0 auto` and `line-height: 1`, so it never grows the line." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(crumbs, steer).ac("bleed"),
			def: crumbs,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.crumbs()`** — a loop over `[text, url]` pairs you type by hand can be *wrong*, which is the one thing a breadcrumb may not be. The row above is five lines you can see. When the trail must be **derived**, core has one: [`page.crumbs(from)`](/framework/core/Page/doc/columns/) walks `Page.chain()` and cannot disagree with where you are.",
		});

		md("## It marks itself");

		md("The urls are **real**, so `Router.mark_links()` gives them `.in-path` and `.page-link` turns that into the accent — the trail above lights up on its own, and nothing here reads `window.location`.");

		md("That is the rule the whole framework runs on: **no view compares the current url itself.** One pass over `$app` after every navigation writes `.active` (this exact url) and `.in-path` (an ancestor of it), and CSS decides what each kind of link does with them. A breadcrumb is `.in-path` all the way down, which is exactly what a breadcrumb *means*.");

		md("## The separator is yours");

		md("The only CSS is `.ui-crumbs a { text-decoration: none }`, in `crumbs.js`, because a descendant rule is the one thing the markup cannot say about itself. `.page-link` sets a weight and nothing else — [`framework.css` has no rule for `a` at all](/framework/styles/), so a link's colour is always somebody's explicit call.");

		md("## The derived one");

		md("`page.crumbs(from)` is the same row built from `Page.chain()` — one link per ancestor, a chevron between, `from` deciding where the trail starts. A **columns** host draws it above the row and clicks on it restore whatever a `full` column collapsed: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/). Typed pairs stay the right answer for a trail that is *not* the page tree.");

		md("Next: [Pagination](/framework/ui/pagination/) — the same row, with a current item.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", context)); },
});
