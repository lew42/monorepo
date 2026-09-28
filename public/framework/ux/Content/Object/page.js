import { Doc, md, div } from "/app.js";
import Page from "../../../core/Page/Page.class.js";
import { object } from "./Object.js";

// The same names core/Page/page.js's own Doc declares and links to real doc pages —
// duplicated here on purpose: this demo shows a real class, so it should show what
// that class's own docs actually list, not a shorter stand-in.
const PAGE_PROPERTIES = "meta title children content url name label icon card classes description parent app view loading route regions depth related";
const PAGE_METHODS = "child add move previews walls preview preview_card preview_link link crumbs "
	+ "nav nav_for chain nearest topic document container activate render columns default_column warn_if_hidden store "
	+ "naming declare source_children load_all_children deactivate "
	+ "mounts_in log_label assign load missing slug";

export default new Doc({
	meta: import.meta,
	title: "Object",
	description: "A little card that shows what a real object IS — class, name, properties, methods — instead of explaining it in words.",
	icon: "data_object",

	files: "Object.js page.js readme.md",
	notes: "shape",

	content(){

		md("**One call, one look, from a real object.** `object(this)` on a live `Page` instance, `object(Page)` on the class itself, and `object(anything)` on a plain object — same card every time, so once it looks right it looks right everywhere.");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", () => { md("### The page you're reading, as an instance"); object(this); });
			div.c("flex v gap", () => { md("### The `Page` class itself"); object(Page, { doc: "/framework/core/Page/", properties: PAGE_PROPERTIES, methods: PAGE_METHODS }); });
			div.c("flex v gap", () => { md("### A plain object"); object({ name: "sidebar", width: 320, sticky: true, items: ["overview", "api", "docs"] }); });
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => object({ name: "example", size: 12 }))); },
});
