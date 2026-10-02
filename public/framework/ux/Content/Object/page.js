import { Doc, md, div } from "/app.js";
import Page from "../../../core/Page/Page.class.js";
import PageOverview from "../../../core/Page/page.js";
import { page_object } from "../../../core/Page/object.js";
import { object } from "./Object.js";
import { view, DefaultView } from "./DefaultView.js";
import { inspect } from "./Inspect.js";
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

	files: "Object.js Inspect.js DefaultView.js page.js readme.md",
	notes: "shape default-view",
	children: "page app",

	content(){

		md("**Two ways to look at a real object.** `object()` is one small card — class, `name = value`, method names. `view()` is a tree instead: a header row, then one `.item` row per property, opening deeper the same way a file tree does. Both take the same thing: a live instance, a class, or a plain object.");

		md("### `view()` — three real, live ones, full width");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", $box => {
				md("#### The Page object");
				// `.children` starts as declared-but-not-fetched (`null` for each name) on a
				// fresh import — the SAME cost a real visit to /framework/core/Page/ pays, paid
				// here instead, so `.children` opens onto real Page objects, not a wall of
				// "null". No DOM after the await: the box is captured now, filled once the
				// fetch settles.
				PageOverview.load_all_children(1).loading.then(() => $box.append(() => page_object(PageOverview)));
				md("[Open it on its own page →](page/)");
			});
			div.c("flex v gap", () => {
				md("#### The App object");
				md(`**Right now:** on \`${this.app.router?.active?.url ?? location.pathname}\` — **${this.app.loaders.length}** loader(s) tracked.`);
				view(this.app);
				md("[Open it on its own page →](app/)");
			});
			div.c("flex v gap", () => {
				md("#### A `Widget`, both ways — the override");
				md("`DefaultView`'s own best guess:"); new DefaultView({ subject: new Widget("demo") });
				md("Its own hand-written `Widget.View`:"); view(new Widget("demo"));
			});
		});

		md("### `object()` — the small card (the first version, still here)");

		div.c("ux-content-wall wide", () => {
			// `this` here is a `Doc` — a `Page` subclass — so the heading says that, and a
			// hand-picked property list keeps the takeaway obvious: "this is a Page with
			// title = X", not a wall of `Doc`-only internals like `column_floor`.
			div.c("flex v gap", () => { md("### This page, as an instance (`Doc`, a `Page` subclass)"); object(this, { properties: "title url children icon parent" }); });
			div.c("flex v gap", () => { md("### The `Page` class itself"); object(Page, { doc: "/framework/core/Page/", properties: PAGE_PROPERTIES, methods: PAGE_METHODS }); });
			div.c("flex v gap", () => { md("### A plain object"); object({ name: "sidebar", width: 320, sticky: true, items: ["overview", "api", "docs"] }); });
		});

		md("### `inspect()` — the debug view, the fourth size");

		md("A class's own doc page opens with THIS, not `object()` — the same icon, bigger, and a property whose value is itself an object opens as its own nested card instead of saying \"Array(3)\".");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", () => {
				md("#### The `Page` class itself — a class card");
				md("Same icon as the instance below, in a visibly heavier frame; properties AND methods together.");
				inspect(Page, { doc: "/framework/core/Page/", properties: PAGE_PROPERTIES, methods: PAGE_METHODS });
			});
			div.c("flex v gap", $box => {
				md("#### This page, as an instance — click a property open to see its own card");
				md("`parent` is a real `Page` underneath, not a one-line description — click it open (closed by default, same as `view()`) to see IT has its own `parent`, `children`, and so on.");
				PageOverview.load_all_children(1).loading.then(() => $box.append(() => inspect(PageOverview, { properties: "title url icon parent" })));
			});
			div.c("flex v gap", () => {
				md("#### `minimal` — an Inbox-style chip, icon + name only");
				inspect(PageOverview, { variant: "minimal" });
			});
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => object({ name: "example", size: 12 }))); },
});
