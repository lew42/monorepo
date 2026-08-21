import { Page, md, demo, code, p, h2, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Intro",

	content(){

		div.c("flex auto", code.js(`import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ md("Hello."); },
});`), demo.stage(() => {
		new Page({
		meta: import.meta,
		title: "Intro",
		content(){ md("Hello."); },
	}).render().style("display", "block");
}));

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

		h2("A card is drawn by the page it points at");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Dashboard",

    // one line, and this page's card on the index above is a live render of it
    preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }
});`);

		md("`previews()` arranges; `preview(nav)` draws. The default card is an icon and a label with the whole card clickable, so a page that says nothing still gets one — and a page that wants to show itself overrides the one method. ⚠ The thumb is **inert**: the label is the card's only link, because an `<a>` inside an `<a>` is invalid and the browser silently un-nests it.");

		h2("Titles and labels");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on this page
    label: "Start here",    // what every menu calls it
    icon: "flag",            // and the glyph beside it
});`);

		md("All three live on the page they describe, so the sidebar, the tab bar and the preview cards cannot name it three different ways. `title` alone is the common case; `label` is for when a menu entry and a page heading are genuinely different sentences.");

		h2("A page is dormant");

		demo(() => {
			const intro = new Page({ url: "/docs/intro/", title: "Intro" });

			p("Constructed, never rendered — and still linkable: ", intro.link());
		}, "Constructing a `Page` renders nothing, so `export default new Page(…)` is always import-safe. It renders when the Router places it.");
	},
});
