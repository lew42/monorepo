import { Page, Sidebar, md, demo, div, p } from "/app.js";

/* The links point at real urls, so `.active` / `.in-path` light up on their own
 * as you navigate — nothing here compares window.location. */
const pages = [
	{ title: "Framework", pages: [
		{ title: "Start",  url: "/framework/start/",  icon: "flag" },
		{ title: "Core",   url: "/framework/core/",   icon: "dashboard" },
		{ title: "Styles", url: "/framework/styles/", icon: "view_quilt" },
	]},
	{ title: "Core classes", pages: [
		{ title: "View",   url: "/framework/core/View/",   icon: "image" },
		{ title: "Page",   url: "/framework/core/Page/",   icon: "description" },
		{ title: "Router", url: "/framework/core/Router/", icon: "alt_route" },
	]},
];

export default new Page({
	meta: import.meta,
	title: "Sidebar",
	description: "A brand over a list of links. Not owned by any layout — any page can render one.",
	content(){

		demo(() => {
			new Sidebar({ brand: "LEW42", pages: [
				{ title: "Start", url: "/framework/start/" },
				{ title: "Core",  url: "/framework/core/" },
			]}).style({ width: "13em" });
		}, "The whole API is `brand` and `pages`. A `page` is a `{title, url}` or a real `Page` — duck-typed, so a site can list sections it doesn't want to eager-load.");

		md("## Groups and icons");

		demo(() => {
			new Sidebar({ brand: "LEW42", pages }).style({ width: "15em" });
		}, "An entry with **`pages` of its own** is a titled group. An entry with **`icon`** gets a Material Icons glyph. Both are inert data, so a `Page` takes them straight in its constructor.");

		md("```js\nnew Sidebar({\n    brand: \"LEW42\",\n    pages: [\n        { title: \"Core classes\", pages: [\n            { title: \"View\", url: \"/framework/core/View/\", icon: \"image\" },\n        ]},\n    ],\n});\n```\n\nIcons need the font: `app.font(\"Material Icons\")`. Forget it and you get the *word* `image` rather than a blank — a ligature font fails legibly, which is how you notice.");

		md("## It has no colours of its own");

		demo(() => {
			div.c("flex gap", () => {
				new Sidebar({ brand: "Dark", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
				new Sidebar({ brand: "Light", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#fff", "--sidebar-ink": "#3f3f3f" });
			});
		}, "**Two tokens.** `--sidebar-bg` and `--sidebar-ink`; the label, the hover fill and the active tint are all `color-mix` off that one ink, so they cannot be set inconsistently.");

		md("This file used to hardcode `color: #fff` and six `rgba(255,255,255,…)` — correct on a dark panel, invisible on a light one. That's the bug two tokens exist to make impossible, and it's why they were promoted: a theme *actually needed* to differ, which is the bar.");

		md("## Placement is not its business");

		md("A sidebar says what it **is**; whatever contains it says where it **goes** — one line, and always the shared token:\n\n```css\n.home > .sidebar { flex: 0 0 var(--sidebar); }\n```\n\nNo `var(--sidebar, 13em)` fallback. The sharing is the point, and a fallback reintroduces the two-numbers-that-drift problem the token exists to solve.");

		md("`.active` (this exact url) and `.in-path` (an ancestor of it) come from `Router.mark_links()`. **No view compares `window.location` itself** — one pass sets both classes and CSS decides what each kind of link does with them.");
	}
});
