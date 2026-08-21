import { Page, Doc, md, div } from "/app.js";

const BANDS = {
	"Pages are navigation": "page children mounts replace route",
	"The box":              "shell measure inset region full",      // a sibling agent's five — listed, not built here
	"Recipes":              "wall catalog dashboard strip columns landing docs site",
	"JS, last":             "labels render",
};

export default new Doc({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",
	icon: "description",

	subject: Page,
	children: "old",
	overview: Object.values(BANDS).flatMap(b => b.split(" ")).join(" "),

	// Every member, in the order a reader meets them: the tree, then rendering,
	// then the derivation the constructor does, then the plumbing and the statics.
	methods: "child add move previews walls preview preview_card preview_link link nav nav_for "
		+ "chain container activate render warn_if_hidden "
		+ "naming declare load_all_children deactivate "
		+ "mounts_in log_label assign load missing slug",

	properties: "meta title children content url name label icon card classes "
		+ "description parent app view loading route regions",

	notes: "declaring labels css layout columns decisions",

	// Doc.overview_section()'s default calls catalog() — a rail, wrong for a wall this
	// size. This override keeps the section's real children (the `overview:` list above,
	// so every band name is a real page at .../overview/<name>/) but swaps catalog() for
	// browse(). ⚠ `content` stays UNBOUND — Doc's default binds it back to me, which is
	// what makes `this.look()`-style helpers mean what a module author typed, but it
	// would also mean `this.browse()` inside `content()` searches MY children, not the
	// section's. Called as `this.content()` from render() below, unbound resolves `this`
	// to the section — whose children the list above just populated.
	overview_section(){
		return this.section("overview", "Overview", {
			title: this.title,
			icon: this.icon,
			children: Array.isArray(this.overview) ? this.overview : Doc.names(this.overview),
			content: this.content,
			render(){
				return this.view ??= div.c("page doc-section", () => this.content())
					.ac("page--" + this.name);
			},
		});
	},

	files: "Page.class.js Page.css old/page.js old/children/page.js old/flow/page.js "
		+ "old/nav/page.js old/previews/page.js old/shell/page.js old/intro/page.js page.js readme.md "
		+ "old/overview/readme.md "
		+ "overview/page/page.js overview/children/page.js overview/mounts/page.js overview/replace/page.js overview/route/page.js "
		+ "overview/shell/page.js overview/measure/page.js overview/inset/page.js overview/region/page.js overview/full/page.js "
		+ "overview/wall/page.js overview/catalog/page.js overview/dashboard/page.js overview/strip/page.js overview/columns/page.js "
		+ "overview/columns/columns.css overview/landing/page.js overview/docs/page.js overview/site/page.js "
		+ "overview/labels/page.js overview/render/page.js",

	content(){
		md("A page is a url, some content, and children — and **pages are navigation**: you navigate children. Every example below is live.");

		this.browse(BANDS, { "--column": "22em", "--gap": "2em", "--stage-max": "14em" });
	},
});
