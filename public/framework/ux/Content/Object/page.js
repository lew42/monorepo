import { Doc, md, div } from "/app.js";
import Page from "../../../core/Page/Page.class.js";
import { object } from "./Object.js";
import { view, DefaultView } from "./DefaultView.js";
import { item } from "../../../ui/item/item.js";

// The same names core/Page/page.js's own Doc declares and links to real doc pages —
// duplicated here on purpose: this demo shows a real class, so it should show what
// that class's own docs actually list, not a shorter stand-in.
const PAGE_PROPERTIES = "meta title children content url name label icon card classes description parent app view loading route regions depth related";
const PAGE_METHODS = "child add move previews walls preview preview_card preview_link link crumbs "
	+ "nav nav_for chain nearest topic document container activate render columns default_column warn_if_hidden store "
	+ "naming declare source_children load_all_children deactivate "
	+ "mounts_in log_label assign load missing slug";

// A made-up class, here only to make the override visible: DefaultView's own
// best guess (every property, one row each) beside a hand-written `Widget.View`
// that draws something completely different instead.
class Widget {
	constructor(name){ this.name = name; this.count = 3; this.tags = ["red", "green", "blue"]; }
}
Widget.View = class extends DefaultView {
	render(){ md(`★ **${this.subject.name}** — ${this.subject.count} tags: ${this.subject.tags.join(", ")}.`); }
};

export default new Doc({
	meta: import.meta,
	title: "Object",
	description: "A little card that shows what a real object IS — class, name, properties, methods — instead of explaining it in words.",
	icon: "data_object",

	files: "Object.js DefaultView.js page.js readme.md",
	notes: "shape default-view",
	children: "page app",

	content(){

		md("**One call, one look, from a real object.** `object(this)` on a live `Page` instance, `object(Page)` on the class itself, and `object(anything)` on a plain object — same card every time, so once it looks right it looks right everywhere.");

		div.c("ux-content-wall wide", () => {
			// `this` here is a `Doc` — a `Page` subclass — so the heading says that, and a
			// hand-picked property list keeps the takeaway obvious: "this is a Page with
			// title = X", not a wall of `Doc`-only internals like `column_floor`.
			div.c("flex v gap", () => { md("### This page, as an instance (`Doc`, a `Page` subclass)"); object(this, { properties: "title url children icon parent" }); });
			div.c("flex v gap", () => { md("### The `Page` class itself"); object(Page, { doc: "/framework/core/Page/", properties: PAGE_PROPERTIES, methods: PAGE_METHODS }); });
			div.c("flex v gap", () => { md("### A plain object"); object({ name: "sidebar", width: 320, sticky: true, items: ["overview", "api", "docs"] }); });
		});

		md("### `DefaultView` — the automatic version\n\n`object()` above is one small card; `view()` is the other shape — a tree of `.item` rows, one per property, that opens deeper the same way a file tree does. Give it any real object and, unless its class says otherwise, `DefaultView` draws its own best guess: a header row for the class, then one row per own property. Click a row open and it draws ITS properties, lazily, the same trick one level deeper — a `Page`'s `.children`, each holding more `Page`s, costs nothing until you actually go looking.");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", () => { md("### A `Widget`, the automatic way"); new DefaultView({ subject: new Widget("demo") }); });
			div.c("flex v gap", () => { md("### The same `Widget`, its own `Widget.View`"); view(new Widget("demo")); });
		});

		md("Two real, live ones — click through for the whole tree, `.children` and all:");
		item({ icon: "description", name: "The Page object — a live Page, open its .children", href: "page/" });
		item({ icon: "apps", name: "The App object — the running app's route and settings", href: "app/" });

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => object({ name: "example", size: 12 }))); },
});
