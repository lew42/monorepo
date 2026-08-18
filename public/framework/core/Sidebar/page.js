import { Sidebar, Doc, md, demo, div, h2, toc } from "/app.js";

/* Real urls, so `.active` / `.in-path` light up on their own as you navigate —
 * nothing here compares window.location. */
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

export default new Doc({
	meta: import.meta,
	title: "Sidebar",
	description: "A brand over a list of links. Not owned by any layout — any page can render one.",
	icon: "view_sidebar",

	subject: Sidebar,

	properties: "pages brand brand_url logo logo_url app",

	methods: "render bar header toggle open menu nav group link footer favicon",

	notes: "entries placement views tokens narrow comp decisions",

	files: "Sidebar.js Sidebar.css page.js readme.md",

	content(){

		toc();

		demo(() => {
			new Sidebar({ brand: "LEW42", pages: [
				{ title: "Start", url: "/framework/start/" },
				{ title: "Core",  url: "/framework/core/" },
			]}).style({ width: "13em" });
		}, "`brand` and `pages`. That is the whole API. An entry is a `{title, url}` or a real `Page` — both answer `.title` and `.url`, so a section can be listed without being loaded.");

		h2("Groups and icons");

		demo(() => {
			new Sidebar({ brand: "LEW42", pages }).style({ width: "15em" });
		}, "An entry with **`pages` of its own** is a titled group. An entry with **`icon`** gets a glyph. Both are inert data, so a real `Page` takes them straight in its constructor.");

		md("```js\nnew Sidebar({\n    brand: \"LEW42\",\n    pages: [\n        { title: \"Core classes\", pages: [\n            { title: \"View\", url: \"/framework/core/View/\", icon: \"image\" },\n        ]},\n    ],\n});\n```");

		h2("It has no colours of its own");

		demo(() => {
			div.c("flex gap", () => {
				new Sidebar({ brand: "Dark", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
				new Sidebar({ brand: "Light", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#fff", "--sidebar-ink": "#3f3f3f" });
			});
		}, "**Two tokens.** `--sidebar-bg` and `--sidebar-ink` — the group title, the icons, the hover fill and the active row are all `color-mix` off that one ink, so they cannot be set inconsistently. Same component, two values apart.");

		md("The rows light themselves up: `.active` is this exact url and `.in-path` is a directory above it, both written by `Router.mark_links()` after every navigation. **No view compares `window.location` itself.**");

		h2("What it doesn't decide");

		md("- **Where it goes.** No width, no position — one line at the call site: `.topic > .sidebar { flex: 0 0 var(--sidebar) }`. [Placement](/framework/core/Sidebar/doc/placement/)\n- **What a narrow screen does.** Below `52em` the panel becomes a sticky top bar with a burger; CSS decides, so there is no resize listener. **Shrink this window** to watch it. [Narrow](/framework/core/Sidebar/doc/narrow/)\n- **What the top and bottom contain.** Passing `header` or `footer` *replaces* them — pass a function, never a View. The default footer is the colour-scheme toggle and an avatar slot; it needs `app: this.app`.");

		md("Next: [Extensions](/framework/ext/) — everything core deliberately refused to do.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
