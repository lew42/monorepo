import { Page, md, demo, div, span, ui } from "/app.js";

/* The top exhibit: the framework's own folder shape, drawn with real item() calls —
 * a folder tree, a couple of links, a menu end. `core` and `ui` start open, `ext`
 * starts shut, so the picture shows both states without a click. */
const folder_tree = () => div.c("surface pad", () => {
	ui.item({
		icon: "folder", name: "core", open: true, children: [
			{ icon: "folder", name: "View", open: true, children: [
				{ icon: "description", name: "View.js", href: "/framework/core/View/", end: "arrow" },
			] },
			{ icon: "description", name: "Page", href: "/framework/core/Page/", end: "arrow" },
		],
	});
	ui.item({
		icon: "folder", name: "ext", children: [
			{ icon: "description", name: "files", href: "/framework/ext/files/", end: "arrow" },
			{ icon: "description", name: "demo", href: "/framework/ext/demo/", end: "arrow" },
		],
	});
	ui.item({
		icon: "folder", name: "ui", open: true, children: [
			{ icon: "description", name: "badge", href: "/framework/ui/badge/", end: "arrow" },
			{ icon: "description", name: "readme.md", end: "menu" },
		],
	});
});

/* Eight small, named boxes, side by side — every genuinely different way to wear
 * the class, on the one page the owner asked to see them on rather than split
 * across eight child pages (page skill: a variant earns a child page by being a
 * DIFFERENT THING, not a different value — these are all the same thing, `.item`,
 * with different options, which is the Disclosure/variants page's own reasoning). */
const variants = () => div.c("wide grid gap auto", $wall => {
	const cell = (label, fn) => div.c("flex v gap-25 card", () => { span.c("muted", label); fn(); });

	cell("plain", () => ui.item({ name: "Plain row" }));
	cell("with icon", () => ui.item({ icon: "star", name: "Starred" }));
	cell("inline — item(…).ac(\"inline\")", () => ui.item({ icon: "label", name: "chip" }).ac("inline"));
	cell("boxed — item(…).ac(\"boxed\")", () => ui.item({ icon: "settings", name: "Settings" }).ac("boxed"));
	cell("link, arrow end", () => ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/item/", end: "arrow" }));
	cell("menu end", () => ui.item({ icon: "description", name: "options.js", end: "menu" }));
	cell("expandable", () => ui.item({ icon: "folder", name: "assets", children: [
		{ icon: "description", name: "logo.svg" },
	] }));
	cell("nested three deep", () => ui.item({ icon: "folder", name: "a", open: true, children: [
		{ icon: "folder", name: "b", open: true, children: [
			{ icon: "folder", name: "c", open: true, children: [
				{ icon: "description", name: "d.js" },
			] },
		] },
	] }));
}).style("--column", "16em");

export default new Page({
	meta: import.meta,
	title: "Item",
	description: "One row: an optional icon, then a name. Put .item on anything and this is the layout, the right-side end and the tree — all at once.",
	icon: "list",

	content(){

		md("A `.item` is one line: an optional icon, then a name, filling its row. Give it `children` and it becomes a tree — the row turns into a native `<summary>`, so the browser opens and closes it with no script at all. This is the framework's own folder shape, drawn with `ui.item()`:");

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(folder_tree, steer).ac("bleed"),
			def: folder_tree,
			file: new URL("page.js", import.meta.url).pathname,
			note: "`core` and `ui` start open (`open: true` in the data); `ext` starts shut — click its row to open it, no code involved. `View.js`, `Page`, `files` and `demo` carry `end: \"arrow\"` because each is a link (`href` is set); `readme.md` carries `end: \"menu\"` instead, to show the other end a row can have — `item()` only draws that button, wiring what it does is the caller's.",
		});

		md("## Eight ways to wear it");

		md("Same class, same three slots — icon, name, end — every box below is one call to `ui.item()` with a different set of options.");

		variants();

		md("## Padding: a control's, tightened for a row read many at once");

		md("Framework.css's own control padding — a plain `<button>` or `<input>` — is `0.2em 0.8em`. `.item` keeps the vertical number and tightens the sides to `0.6em`: a row usually sits in a column of other rows, not alone the way a button is, and the wider number read visibly loose next to the icon at 400px. [`item.js`](item.js) has the one declaration, and the reasoning beside it.");

		md("## Relation to core/Item — kept separate");

		md("`core/Item` is a persistence base class: a node of a document that saves. This `item()` is markup and CSS with no state of its own at all — the browser's native `<details>` element holds whatever is open, and there is nothing else to track. [`doc/core-item.md`](doc/core-item.md) has the full comparison and the recommendation.");

		md("## Reuse, not a fourth tree");

		md("`ux/Tree`, `ux/Content/Disclosure` and `ext/files`'s explorer each already draw a row very like this one. [`doc/reuse.md`](doc/reuse.md) looks at each in turn and says where `.item` could replace one at low risk — none of the three were touched to build this.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", folder_tree)); },
});
