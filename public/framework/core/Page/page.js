import { Page, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",

	content(){

		code.js(`export default new Page({
    meta: import.meta,
    title: "Intro",
    children: "guide api",        // lazy — imported when walked to
    content(){ md("hello"); },
});`);

		md("A `Page` is dormant: constructing one renders nothing, so `export default new Page(…)` is always import-safe. It renders when something places it.");

		md("`children` is one Map with three states — a name that isn't there yet (`null`), a name that is (`Page`), and a name that was never declared (`undefined`, which is a 404 unless `route()` claims it).");

		md("## Naming children in navigation");

		code.js(`export default new Page({
    children: "start core ext",

    nav: {
        start: "Start here",                        // a label
        core:  { label: "Core", icon: "dashboard" },// and an icon
    },
});`);

		md("`previews()` and `tabs()` read this through **`nav_for(name)`**, so every menu on a page agrees.");

		md("**A label belongs to the parent's list; a title belongs to the page.** They are different things, not two copies of one — `start` is labelled *\"Start here\"* here and titled *\"Start\"* on its own page, deliberately.\n\nAn **icon is the same kind of thing**, which is why it lives here rather than on the page: it names this *entry in this menu*. That's what makes it free — no import, so a card is complete before the page it points at exists.");

		md("Declare nothing and it still works: the label falls back to an imported child's `title`, then to the bare url segment. So a card reads `columns` until you visit it and `Columns` after — the honest cost, and a visible one. `load_all_children()` in `initialize()` is the opt-in that buys real titles up front, at the price of the imports.");
	}
});
