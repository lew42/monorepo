import { Page, classdoc, md, demo, code, p, h2 } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",
	icon: "description",

	Class: Page,
	children: "children nav flow",
	overview: "demos",

	// Every member, in the order a reader meets them: the tree, then rendering,
	// then the derivation the constructor does, then the plumbing and the statics.
	methods: "child add previews link nav_for chain container activate render "
		+ "naming declare load_all_children go preview deactivate "
		+ "mounts_in log_label assign load missing",

	properties: "meta title children content url name label icon card classes "
		+ "description parent app view loading route regions",

	notes: "declaring labels layout",

	content(){

		code.js(`import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ md("Hello."); },
});`);

		md("Save that as `/docs/intro/page.js` and `/docs/intro/` **is** a page. `meta: import.meta` is the line that tells it its own address — the folder is the route, and nothing registers anything.");

		h2("Children");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Docs",
    children: "intro guide api",   // child folder names, in menu order
    content(){ this.previews(); },
});`);

		md("`children` names the folders under this one, **in the order a menu should show them**. Each is imported the moment this page is constructed, so `previews()` can draw a card per child with its real title and icon — once, correct, never names-first-then-titles.");

		md("It is navigation, not registration. `/docs/faq/` still works when nobody declared `faq`, because looking up a child falls through to the filesystem. **Forgetting to declare costs the menu entry, not the url.**");

		h2("Titles and labels");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on this page
    label: "Start here",    // what every menu calls it
    icon: "flag",           // and the glyph beside it
});`);

		md("All three live on the page they describe, so the sidebar, the tab bar and the preview cards cannot name it three different ways. `title` alone is the common case; `label` is for when a menu entry and a page heading are genuinely different sentences.");

		h2("A page is dormant");

		demo(() => {
			const intro = new Page({ url: "/docs/intro/", title: "Intro" });

			p("Constructed, never rendered — and still linkable: ", intro.link());
		}, "Constructing a `Page` renders nothing, so `export default new Page(…)` is always import-safe. It renders when the Router places it.");

		md("**[Demos](/framework/core/Page/overview/demos/)** — the same class, rendered: children, labels, `add()`, four levels of depth and a page wearing a layout, each one a tree you can click around inside.");

		md("Every method and property on the left has its own page: the real source, who calls it, and an honest note on whether it should exist at all.");

		md("Next: [Router](/framework/core/Router/) — what turns a url into one of these.");

		md.details(import.meta, "readme.md", "Design record — children, labels, and what should change");
	},
});
