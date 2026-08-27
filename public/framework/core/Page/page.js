import { Page, Doc, md, div } from "/app.js";
import { mini } from "../../ext/demo/mini.js";

/**
 * The Overview is the **palette**: every building block a page can be made of, each
 * card a picture of the shape and nothing else. The first band is the page
 * generator's own vocabulary — `tabs vtabs rail list wall grid flush prose crumbs`
 * plus the width words — so what you can browse here is exactly what a generated
 * page can be built from.
 */
// ⚠ NO BAND UNDER SIX. `browse()`'s grid collapses its empty tracks, so a band of two
// stretches its cards over the whole wall — 659px each at 1920, 1400 at 3440, which is
// what the old "JS, last" pair did. `labels` is a nav entry and `render` is how a page
// draws its own box, so both had a band already (measured 2026-08-26).
const BANDS = {
	"Building blocks":      "tabs vtabs rail list wall grid flush prose crumbs",
	"Pages are navigation": "page children mounts replace route labels",
	"The box":              "shell measure inset region full width render",
	"Recipes":              "catalog dashboard strip columns landing docs site",
};

export default new Doc({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",
	icon: "description",

	subject: Page,
	children: "generator old",
	overview: Object.values(BANDS).flatMap(b => b.split(" ")).join(" "),

	// Every member, in the order a reader meets them: the tree, then rendering,
	// then the derivation the constructor does, then the plumbing and the statics.
	methods: "child add move previews walls preview preview_card preview_link link crumbs "
		+ "nav nav_for chain container activate render columns warn_if_hidden "
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

			// ⚠ THE PALETTE IS DRAWN HERE, not by the 29 pages. `add()` is the one place
			// a child becomes a Page, so stamping the card as it arrives is one seam
			// instead of one edit per demo — and a palette has to be ONE hand at ONE
			// scale to be readable at all. The old wall was a live app zoomed to 0.5 per
			// card: chrome and content noise, and no two alike (the owner, 2026-08-26).
			// A page's own `preview()` still governs anywhere else it is shown.
			add(name, child){
				return Page.prototype.add.call(this, name, child).assign({
					preview(nav){ return this.preview_card(nav, () => mini(name)); },
				});
			},

			render(){
				return this.view ??= div.c("page doc-section", () => this.content())
					.ac("page--" + this.name);
			},
		});
	},

	files: "Page.class.js Page.css old/page.js old/children/page.js old/flow/page.js "
		+ "old/nav/page.js old/previews/page.js old/shell/page.js old/intro/page.js page.js readme.md "
		+ "old/overview/readme.md overview/readme.md "
		+ "overview/tabs/page.js overview/vtabs/page.js overview/rail/page.js overview/list/page.js "
		+ "overview/grid/page.js overview/flush/page.js overview/prose/page.js overview/crumbs/page.js "
		+ "overview/page/page.js overview/children/page.js overview/mounts/page.js overview/replace/page.js overview/route/page.js "
		+ "overview/shell/page.js overview/measure/page.js overview/inset/page.js overview/region/page.js "
		+ "overview/full/page.js overview/width/page.js "
		+ "overview/wall/page.js overview/catalog/page.js overview/dashboard/page.js overview/strip/page.js "
		+ "overview/columns/page.js overview/columns/finder/page.js overview/columns/examples/page.js "
		+ "overview/columns/examples/grids/page.js overview/columns/examples/looks/page.js "
		+ "overview/landing/page.js overview/docs/page.js overview/site/page.js "
		+ "overview/labels/page.js overview/render/page.js",

	content(){
		md("A page is a url, some content, and children — and **pages are navigation**: you navigate children. Every card below is a picture of one block; click it to see the block running, with the code.");

		this.browse(BANDS, { "--column": "22em", "--gap": "2em", "--stage-max": "14em" });
	},
});
