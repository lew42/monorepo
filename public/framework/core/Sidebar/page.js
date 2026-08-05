import { Page, Sidebar, md, demo, div, p, toc } from "/app.js";

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
	icon: "view_sidebar",
	content(){

		toc();

		demo(() => {
			new Sidebar({ brand: "LEW42", pages: [
				{ title: "Start", url: "/framework/start/" },
				{ title: "Core",  url: "/framework/core/" },
			]}).style({ width: "13em" });
		}, "The whole API is `brand` and `pages`. An entry is a `{title, url}` or a real `Page` — both answer `.title` and `.url`, so a site can list sections it doesn't want to eager-load.");

		md("## Groups and icons");

		demo(() => {
			new Sidebar({ brand: "LEW42", pages }).style({ width: "15em" });
		}, "An entry with **`pages` of its own** is a titled group. An entry with **`icon`** gets a Material Icons glyph. Both are inert data, so a `Page` takes them straight in its constructor.");

		md("```js\nnew Sidebar({\n    brand: \"LEW42\",\n    pages: [\n        { title: \"Core classes\", pages: [\n            { title: \"View\", url: \"/framework/core/View/\", icon: \"image\" },\n        ]},\n    ],\n});\n```\n\nIcons need the font: `app.font(\"Material Icons\")`. Forget it and you get the *word* `image` rather than a blank — a ligature font fails legibly, which is how you notice.");

		md("## Your own brand, and your parent's labels");

		md("The constructor is `assign`-based, so passing `header` **replaces** the default logo-and-wordmark rather than configuring it. An arrow, so `this` stays the page that knows the brand:\n\n```js\nnew Sidebar({\n    header: () => this.app.brand(\"Framework\", this.url),\n    pages: [...this.children.keys()].map(name => this.nav_for(name)),\n});\n```\n\nThat second line is the whole of `/framework/`'s navigation. `nav_for()` returns `{url, label, icon}` and an entry's **`label` wins over `title`** — not two spellings of one thing: a label belongs to the list it appears in, a title to the page. So the panel, the tab bar and the preview cards read one source and cannot name a child three ways.");

		md("## It has no colours of its own");

		demo(() => {
			div.c("flex gap", () => {
				new Sidebar({ brand: "Dark", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
				new Sidebar({ brand: "Light", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#fff", "--sidebar-ink": "#3f3f3f" });
			});
		}, "**Two tokens.** `--sidebar-bg` and `--sidebar-ink`; the group title, the icons, the hover fill and the active row are all `color-mix` off that one ink, so they cannot be set inconsistently — and the panel can go dark on a light page without a second design.");

		md("This file used to hardcode `color: #fff` and six `rgba(255,255,255,…)` — correct on a dark panel, invisible on a light one. That's the bug two tokens exist to make impossible, and it's why they were promoted: a theme *actually needed* to differ, which is the bar.");

		md("## Placement is not its business");

		md("A sidebar says what it **is**; whatever contains it says where it **goes** — one line, and always the shared token:\n\n```css\n.topic > .sidebar { flex: 0 0 var(--sidebar); }\n```\n\nNo `var(--sidebar, 19em)` fallback. The sharing is the point, and a fallback reintroduces the two-numbers-that-drift problem the token exists to solve — which it did: `/styles.css` hardcoded `14em` here against a `--sidebar` of `13em`, and neither was the comp's `19em`.");

		md("`.active` (this exact url) and `.in-path` (an ancestor of it) come from `Router.mark_links()`. **No view compares `window.location` itself** — one pass sets both classes and CSS decides what each kind of link does with them.");

		md("Next: [Extensions](/framework/ext/) — everything core deliberately refused to do.");

		md.details(import.meta, "readme.md", "Design record — two tokens, and why a group is just an entry");
	}
});
