import { Page, md, demo, div, a, icon } from "/app.js";
import { palette } from "../parts.js";
import { crumbs } from "./crumbs.js";

export default new Page({
	meta: import.meta,
	title: "Breadcrumbs",
	description: "A row of links that knows where you are without asking.",
	icon: "chevron_right",
	classes: "grid",

	content(){

		palette(
			["ui.crumbs(…)", () => crumbs(["Framework", "/framework/"], ["UI", "/framework/ui/"], "Breadcrumbs")],
			["links only", () => crumbs(["Framework", "/framework/"], ["Core", "/framework/core/"])],
			["one level", () => crumbs(["Framework", "/framework/"], "Here")],
		);

		md("## Calling it");

		demo(() => {
			crumbs(["Framework", "/framework/"], ["UI", "/framework/ui/"], "Breadcrumbs");
		}, "A `[text, url]` pair is a link; a bare string is where you are. `flex wrap v-center h4` and a `0.5em` gap.");

		md("## It marks itself");

		md("The urls are **real**, so `Router.mark_links()` gives them `.in-path` and `.page-link` turns that into the accent — the trail above lights up on its own, and nothing in the component reads `window.location`.");

		md("That is the rule the whole framework runs on: **no view compares the current url itself.** One pass over `$app` after every navigation writes `.active` (this exact url) and `.in-path` (an ancestor of it), and CSS decides what each kind of link does with them. A breadcrumb is `.in-path` all the way down, which is exactly what a breadcrumb *means*.");

		md("## Chevrons, or anything else");

		demo(() => {
			div.c("flex wrap v-center gap", () => {
				// `/` is never marked in-path (it is a prefix of everything), so this
				// one says what colour it is.
				a.c("page-link", () => icon("home")).href("/").style("color", "var(--ink)");

				["/framework/", "/framework/ui/"].forEach(url => {
					icon("chevron_right").style({ color: "var(--subtle)", fontSize: "1em" });
					a.c("page-link", url.split("/").at(-2)).href(url);
				});
			}).style("--gap", "0.3em");
		}, "The separator is the one thing `crumbs()` decides for you. When you want a chevron or an icon root, the row underneath is four lines — `icon()` is a ligature span, `flex: 0 0 auto` with `line-height: 1`, so it never grows the line.");

		md("The only CSS is `.ui-crumbs a { text-decoration: none }`. `.page-link` sets a weight and nothing else, which is deliberate — [`framework.css` has no rule for `a` at all](/framework/styles/), so a link's colour is always somebody's explicit call.");

		md("Next: [Pagination](/framework/ui/pagination/) — the same row, with a current item.");
	},
});
