import { Page, md, demo, div, a, span, icon } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Breadcrumbs",
	description: "A row of links that knows where you are without asking.",
	icon: "chevron_right",

	content(){

		demo(component, "`flex wrap v-center h4` and a `0.5em` gap. The links are **real urls**, so `Router.mark_links()` gives them `.in-path` and `.page-link` turns that into the accent — the trail lights up on its own. Nothing here reads `window.location`.");

		md("That is the rule the whole framework runs on: **no view compares `window.location` itself.** One pass over `$app` after every navigation writes `.active` (this exact url) and `.in-path` (an ancestor of it), and CSS decides what each kind of link does with them. A breadcrumb is `.in-path` all the way down, which is exactly what a breadcrumb means.");

		demo(() => {
			div.c("flex wrap v-center", () => {
				// `/` is never marked in-path (it is a prefix of everything), so this one
				// says what colour it is.
				a.c("page-link", () => { icon("home"); }).href("/")
					.style({ textDecoration: "none", color: "var(--ink)" });
				["/framework/", "/framework/styles/"].forEach(url => {
					icon("chevron_right").style({ color: "var(--subtle)", fontSize: "1em" });
					a.c("page-link", url.split("/").at(-2)).href(url).style("textDecoration", "none");
				});
			}).style("gap", "0.3em");
		}, "Chevrons instead of slashes, and a `home` icon for the root. `icon()` is a ligature span, so it sits in the row like a word — `.icon` is `flex: 0 0 auto` and `line-height: 1`, which is why it never grows the line.");

		md("Next: [Pagination](/framework/styles/components/pagination/) — the same row, with a current item.");
	}
});
