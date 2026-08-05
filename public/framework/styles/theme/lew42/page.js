import { Page, View, Sidebar, md, demo, div, p, button, pre, span, icon } from "/app.js";

View.stylesheet(import.meta, "lew42.css");

/* One block of markup, rendered under the theme and under nothing. Same DOM,
 * same classes, no theme-aware code — which is the claim, so it had better be
 * literally true. */
const sample = () => {
	div.c("h1", "App");
	p("The root application class that bootstraps your framework instance.");
	div.c("h2", "Overview");
	p("Configures plugins, registers routes, and renders global Views inside `anchor` elements.");
	pre(`app.font("Montserrat");`);
	div.c("flex gap v-center", () => {
		button.c("bg", "Read guide");
		span.c("h4", "annotation");
	});
};

/* A real Sidebar, with real urls — so `.active` and `.in-path` light up on their
 * own as you navigate. Groups are just entries that have `pages` of their own. */
const sidebar = () => new Sidebar({
	brand: "LEW42",
	pages: [
		{ title: "Framework", pages: [
			{ title: "Overview", url: "/framework/",        icon: "text_format" },
			{ title: "Core",     url: "/framework/core/",   icon: "dashboard" },
			{ title: "Styles",   url: "/framework/styles/", icon: "view_quilt" },
		]},
		{ title: "Core classes", pages: [
			{ title: "View",   url: "/framework/core/View/",   icon: "image" },
			{ title: "Page",   url: "/framework/core/Page/",   icon: "dashboard" },
			{ title: "Router", url: "/framework/core/Router/", icon: "view_quilt" },
			{ title: "App",    url: "/framework/core/App/",    icon: "check_box" },
		]},
	],
});

export default new Page({
	meta: import.meta,
	title: "lew42",
	description: "The house theme — Montserrat, one orange, and a sidebar that reads its ink from a token.",
	content(){

		/* No font call here any more. It used to live on this page, because 166KB
		 * on every route for a theme one page used was a bad trade. The theme is
		 * site-wide now, so app.js loads both in config() — before first paint,
		 * which a call from content() could never be. readme.md §8. */

		demo(() => {
			div.c("theme-lew42 pad", sample);
		}, "A theme is a class you put on anything. `body.theme-lew42` themes the site; `div.theme-lew42` themes one box.");

		md("## The sidebar, from two tokens");

		demo(() => {
			div.c("theme-lew42 flex gap", () => {
				sidebar().style({ flex: "0 0 var(--sidebar)" });
				div.c("pad flex-1", sample);
			});
		}, "Core's `Sidebar`, unmodified. The comp's white panel is `--sidebar-bg` and `--sidebar-ink`; every other colour in it — the group title, the icons, the hover fill, the active row — is a `color-mix` off that one ink.");

		demo(() => {
			div.c("theme-lew42 flex gap", () => {
				sidebar().style({ flex: "0 0 var(--sidebar)" });
				div.c("pad flex-1", sample);
			}).style({ "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
		}, "The comp's other sidebar. **Two token values, no second design** — and nothing in `lew42.css` mentions `.sidebar`, because a theme that names a component class is a component missing a token.");

		md("## Groups and icons");

		demo(() => {
			div.c("flex gap v-center", () => {
				icon("text_format");
				icon("dashboard");
				icon("view_quilt");
				icon("check_box");
				icon("image");
			});
		}, "Material Icons is a **ligature** font: the span really contains the word `check_box` and the font swaps the glyph in. So a page that forgot `app.font(\"Material Icons\")` shows the word, not a blank — which is how you notice.");

		md("A sidebar entry with `pages` of its own is a group; one with `icon` gets a glyph. Both are inert data, so a `Page` takes them straight in its constructor:");

		md("```js\nnew Sidebar({ pages: [\n    { title: \"Core classes\", pages: [\n        new Page({ title: \"App\", icon: \"check_box\", … }),\n        { title: \"View\", url: \"/framework/core/View/\", icon: \"image\" },\n    ]},\n]});\n```");

		md("## Both modes");

		demo(() => {
			div.c("flex gap all-1", () => {
				div.c("theme-lew42 light pad", sample);
				div.c("theme-lew42 dark pad", sample);
			});
		}, "Every token is `light-dark()`, so a mode is one declaration and can't go missing on one side. The comp is light-only — the dark values are derived, and say so in the record.");

		md("Next: [util](/framework/styles/util/) — the opt-in classes that mean you rarely write CSS at all.");

		md.details(import.meta, "readme.md", "Design record — the Figma port, and what didn't fit");
	}
});
