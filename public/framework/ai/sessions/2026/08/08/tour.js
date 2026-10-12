import { Page, md, div, a } from "/app.js";

/* The tree the report opens with — three of the session's changes, built out of
 * the vocabulary they changed. A function, not a page: `mini_app()` adopts the
 * root and hands it a region, so every render wants a fresh tree.
 * ⚠ Object children, never a name string — a name probes the server for a page.js.
 */
export default () => new Page({
	url: "/2026-08-08/",
	title: "This session",

	children: [
		{
			name: "labels", title: "A page names itself", label: "label:", icon: "label",
			content(){
				md("The rail on the left says **`label:`**. The heading above says `title`. Both are declared here, on the page they name, and `nav_for()` reads `label ?? title ?? name`.");
				md("So a menu entry and a page heading are allowed to be different sentences — with no map of overrides in the parent.");
			},
		},
		{
			name: "shapes", title: "Shape words", label: "Layouts", icon: "dashboard_customize",
			classes: "full pad",
			content(){
				md("`full pad` on this page: no reading measure, an even inset. Below is `grid gap auto`, which counts its own columns.");

				div.c("grid gap auto", () => "12345678".split("").forEach(digit => div.c("pad wash h4", digit)))
					.style({ "--column": "3.2em", "--gap": "0.6em" });
			},
		},
		{
			name: "api", title: "161 member pages", label: "Members", icon: "fact_check",
			content(){
				md("Every method and property on the five core classes — and on `Socket`, which had none — now has a url, its real source, and an honest note on whether it should exist at all.");

				a.c("page-link", "View.append() →").href("/framework/core/View/api/append/");
			},
		},
	],

	content(){
		md("Three changes, as three pages. **Click a card, then a crumb.**");
		this.previews();
	},
});
