import { Page, Doc, md, div, code, a, span, small, file_link } from "/app.js";
import { mini } from "../../ext/demo/mini.js";
import { page_object } from "./object.js";
import { item } from "../../ui/item/item.js";

// History and design: doc/page-js-notes.md
// ⚠ NO BAND UNDER SIX: browse()'s grid collapses empty tracks; bands of two stretch over the whole wall
const STEPS = [
	{ n: 1, name: "Memory", word: "cached", id: "step-1" },
	{ n: 2, name: "Declared jsonl", word: "file", id: "step-2" },
	{ n: 3, name: "md/ · fs/", word: "built-in", id: "step-3" },
	{ n: 4, name: "route()", word: "dynamic", id: "step-4" },
	{ n: 5, name: "page.js", word: "import", id: "step-5" },
	{ n: 6, name: "Bare .md", word: "fallback", id: "step-6" },
	{ n: 7, name: "Not found", word: "404", id: "step-7" },
];

const BANDS = {
	"Building blocks":      "columns tabs vtabs list wall prose",
	"Pages are navigation": "page children mounts replace route folders labels",
	"The box":              "shell measure inset region full width render",
	"Recipes":              "rail grid flush crumbs catalog dashboard strip landing docs site",
};

export default new Doc({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",
	icon: "description",

	subject: Page,
	children: "Template make layout navigation tool/page.jsonl parts/page.jsonl content-shapes ai dynamic weight card generator old jsonl/page.jsonl settings/page.jsonl ext/page.jsonl audit",
	overview: Object.values(BANDS).flatMap(b => b.split(" ")).join(" "),

	methods: "child add move previews walls preview preview_card preview_link link crumbs "
		+ "nav nav_for chain nearest topic document container activate render columns default_column warn_if_hidden prefs "
		+ "naming declare source_children load_all_children deactivate "
		+ "mounts_in log_label assign load missing slug",

	properties: "meta title children content url name label icon card classes "
		+ "description parent app view loading route regions depth related pages store",

	// The Core API block on the API tab: name:weight, heaviest first (ext/Doc/doc/class-card.md)
	core: "title:10 children:10 content:9 url:8 child:8 add:7 render:7",

	notes: "loading navigation layout-overview watch-out more-features jsonl declaring labels css layout columns words roles panels previews findings markdown open decisions inbox-tab",

	// ⚠ Every name here MUST sync with `children:` list above; missing names never become tabs
	bar(){
		return ["overview", "make", "jsonl", "settings", "layout", "navigation", "ai", "tool", "dynamic", "weight", "generator", "api", "doc", "files", "old"]
			.filter(name => name === "doc" ? Doc.names(this.notes).length > 0 : this.children.has(name));
	},

	// ⚠ Rebuild Map's iteration order to match bar(): sidebar reads INSERTION order
	initialize(){
		Doc.prototype.initialize.call(this);

		const order = this.bar();
		const rest = [...this.children.keys()].filter(name => !order.includes(name));
		const ordered = new Map();
		[...order, ...rest].forEach(name => { if (this.children.has(name)) ordered.set(name, this.children.get(name)); });
		this.children = ordered;
	},

	overview_section(){
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			content: this.content.value,

			// ⚠ Palette drawn here: one seam (add()) stamps cards as they arrive
			add(name, child){
				return Page.prototype.add.call(this, name, child).assign({
					preview(nav){ return this.preview_card(nav, () => mini(name)); },
				});
			},

			render(){
				return this.view ??= div.c("page doc-section flow", () => this.content.render())
					.ac("page--" + this.name);
			},
		});
	},

	files: "Page.class.js Page.css old/page.js old/children/page.js old/flow/page.js "
		+ "old/nav/page.js old/previews/page.js old/shell/page.js old/intro/page.js page.js readme.md "
		+ "old/overview/readme.md overview/readme.md "
		+ "make/page.js layout/page.js layout/floating/page.js "
		+ "overview/tabs/page.js overview/vtabs/page.js overview/rail/page.js overview/list/page.js "
		+ "overview/grid/page.js overview/flush/page.js overview/prose/page.js overview/crumbs/page.js "
		+ "overview/page/page.js overview/children/page.js overview/mounts/page.js overview/replace/page.js overview/route/page.js "
		+ "overview/folders/page.js "
		+ "overview/shell/page.js overview/measure/page.js overview/inset/page.js overview/region/page.js "
		+ "overview/full/page.js overview/width/page.js "
		+ "overview/wall/page.js overview/catalog/page.js overview/dashboard/page.js overview/strip/page.js "
		+ "overview/columns/page.js overview/columns/finder/page.js overview/columns/examples/page.js "
		+ "overview/columns/refs/page.js overview/columns/panels/page.js "
		+ "overview/columns/examples/grids/page.js overview/columns/examples/looks/page.js "
		+ "overview/landing/page.js overview/docs/page.js overview/site/page.js "
		+ "overview/labels/page.js overview/render/page.js "
		+ "jsonl/page.jsonl jsonl/full/page.jsonl",

	content(){
		// Show, don't tell: the loading order as linked tiles with wrap (seven tiles ≈ 700px)
		div.c("wide flex wrap gap-25", () => {
			STEPS.forEach(s => a.c("card pad flex gap-25 v-center").href(`/framework/core/Page/doc/loading/#${s.id}`)
				.style({ textDecoration: "none", color: "var(--ink)" })
				.append(() => {
					span.c("muted", String(s.n));
					div.c("flex v", () => {
						span(s.name).style({ fontWeight: "700" });
						small.c("muted", s.word);
					});
				}));
		}).style("--gap", "0.75em");

		md(`Files: [Page.class.js](${file_link("framework/core/Page/Page.class.js")}) · [Log.js](${file_link("framework/core/Page/Log.js")}) · [Markdown.js](${file_link("framework/core/Page/Markdown.js")}) · [words.js](${file_link("framework/core/Page/words.js")})`);

		div.c("wide grid three gap", () => {
			md("A page is a folder holding a `page.js` or a `page.jsonl`. Each card below is one block, shown running. Start here, or at [Make a page](/framework/core/Page/make/) for the five ways to build one, or [Layout](/framework/core/Page/layout/) for how to shape one; every method is in the [API](/framework/core/Page/api/).");
			code.js(`export default new Page({
  meta: import.meta,
  title: "Docs",
  children: "intro guide",
});`, "page.js");
			code.json(`{"title": "Docs"}
	{"place": "note.md"}`, "page.jsonl");
		}).style("--column", "16em");

		// Wrap page_object: five key fields first, then all fields in <details> (use flex v to avoid flow gap)
		div.c("card pad flex v", () => {
			const subject = this.parent ?? this;
			item({ name: ".title", end: subject.title ?? "—" });
			item({ name: ".url", end: subject.url ?? "—" });
			item({ name: ".parent", end: subject.parent?.title ?? subject.parent?.url ?? "none" });
			item({ name: ".children", end: `${subject.children?.size ?? 0}` });
			item({ name: ".files", end: `${Doc.names(subject.files).length}` });
			item({ name: "All fields", children: () => page_object(subject) });
		});

		this.browse(BANDS, { "--column": "22em", "--gap": "2em", "--stage-max": "14em" });
	},
});
