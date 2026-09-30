import { Page, Doc, md, div, code, a, span, small, file_link } from "/app.js";
import { mini } from "../../ext/demo/mini.js";
import { object } from "../../ux/Content/Object/Object.js";
import { page_object } from "./object.js";
import { item } from "../../ui/item/item.js";

/**
 * The Overview is the **palette**: every building block a page can be made of, each
 * card a picture of the shape and nothing else.
 *
 * The first band is the page generator's own vocabulary — `columns` and the five words
 * that say WHERE a child goes when you pick it — so what you can browse here is exactly
 * what a generated page can be built from. `rail`, `grid`, `flush` and `crumbs` moved
 * down to Recipes on 2026-08-27: each only changed how the child links LOOKED, which
 * makes it a shape you compose, not a word the generator knows
 * ([generator/readme](/framework/core/Page/generator/readme/)).
 */
// ⚠ NO BAND UNDER SIX. `browse()`'s grid collapses its empty tracks, so a band of two
// stretches its cards over the whole wall — 659px each at 1920, 1400 at 3440, which is
// what the old "JS, last" pair did. `labels` is a nav entry and `render` is how a page
// draws its own box, so both had a band already (measured 2026-08-26). It is also why
// `columns` moved UP rather than the five standing alone.
// [fix-2026-09-29-2 finding 2] "How a url becomes a page" was a paragraph one click
// down in the Docs tab — the owner called it "foundational to understanding what
// goes where", so it gets a picture on the Overview itself, not just a link. Seven
// tiles, same order and words as doc/loading.md's own numbered list ("The order, in
// one glance") — keep the two in sync if that list ever changes. Each tile links to
// its own step by id; today a cross-page click still lands at the TOP of
// doc/loading/ (Router.js's activate() always resets scroll — see the ⚠ note next
// to it), same as any other link to that page, so the url is exact even though the
// scroll isn't yet.
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
	// Tab order, top to bottom of `bar()` below: Overview · Make a page · Layout ·
	// Navigation · Generator · API · Docs · Files · Old. `make` and `layout` are new
	// top tabs (proposal.md rewrite order items 2 and 3); `old` moved last (item 6).
	// `navigation` added 2026-09-29 (page-system task): persistent vs switching, the
	// levels that stack, the class-doc go-to, the alternatives. `ai` (the page-based AI
	// system) and `dynamic` (a url with no page.js, loaded through an ancestor's
	// route()) added the same day, so every sub-system the readme lists is a tab.
	// `jsonl` stays declared here, at its existing url — "Make a page › page.jsonl"
	// links to it, same as before. `settings` (same day, tabs-settings task): tabs
	// that manage themselves via a `tab` line, and a page's own nav switch.
	children: "make layout navigation ai dynamic weight generator old jsonl/page.jsonl settings/page.jsonl audit",
	overview: Object.values(BANDS).flatMap(b => b.split(" ")).join(" "),

	// Every member, in the order a reader meets them: the tree, then rendering,
	// then the derivation the constructor does, then the plumbing and the statics.
	methods: "child add move previews walls preview preview_card preview_link link crumbs "
		+ "nav nav_for chain nearest topic document container activate render columns default_column warn_if_hidden store "
		+ "naming declare source_children load_all_children deactivate "
		+ "mounts_in log_label assign load missing slug",

	properties: "meta title children content url name label icon card classes "
		+ "description parent app view loading route regions depth related",

	// [fix-2026-09-29-2 finding 1] "loading" was never in this list, so its url fell
	// through the page.js probe to the bare-.md fallback and 404'd. First on purpose:
	// "how a url becomes a page" is the one doc a reader needs before any other note
	// makes sense (loading-study.md; the owner called it "foundational").
	notes: "loading navigation layout-overview watch-out more-features jsonl declaring labels css layout columns words roles panels previews findings markdown open decisions",

	// Doc.overview_section()'s default calls catalog() — a rail, wrong for a wall this
	// size. This override keeps the section's real children (the `overview:` list above,
	// so every band name is a real page at .../overview/<name>/) but swaps catalog() for
	// browse(). ⚠ `content` stays UNBOUND — Doc's default binds it back to me, which is
	// what makes `this.look()`-style helpers mean what a module author typed, but it
	// would also mean `this.browse()` inside `content()` searches MY children, not the
	// section's. Called as `this.content()` from render() below, unbound resolves `this`
	// to the section — whose children the list above just populated.
	// The API tab OPENS with a card, not a wall of words: "oh, this is a Page and it has
	// a property of this that equals this" (the owner, 2026-09-28), before the member
	// rail even loads. Doc's own api_section() builds the rail; this only swaps its
	// render() to draw the card first — same seam core/Page/page.js already uses on
	// overview_section() below.
	api_section(){
		if (!Doc.names(`${this.properties ?? ""} ${this.methods ?? ""}`).length) return;

		const doc = this;

		// A small, unmounted example — nothing here is added to the real tree or
		// fetched, `declare()` only records the two names — so the card can show real
		// VALUES ("title = Intro"), which a bare `Page` class never has (the owner's own
		// ask: "this is a Page, and its property X = Y").
		const example = new Page({ title: "Intro", children: "setup usage" });

		return this.section("api", "API", {
			initialize(){ this.parent.api(this); },
			render(){
				return this.view ??= div.c("page doc-section", () => {
					// `api`, not `doc`: this card sits right above the rail below it, and that
					// rail already answers `api/<name>/` for every one of these names — a
					// second address at `doc/method/<name>/` would be two urls for one member.
					object(example, { api: "/framework/core/Page/api/", properties: doc.properties, methods: doc.methods });
					this.tabs().ac("vertical");
				}).ac("page--" + this.name);
			},
		});
	},

	// The tab order the proposal asks for (rewrite order item 6): Overview, Make a
	// page and Layout first (a new reader's first two stops), Generator next, then
	// the reference tabs API/Docs/Files, Old moved to the very end. Doc.bar()'s own
	// order always puts api/doc/files right after whatever was declared — which is
	// why "old" could never move past them without this override.
	// ⚠ 2026-09-29 fix round, finding 1: "jsonl" (declared above as "jsonl/page.jsonl",
	// which `child_file()` records under the plain key "jsonl") was missing from this
	// literal array, so `bar()`'s filter always dropped it — the whole reason storage
	// had no top tab even though the comment above claimed "every sub-system the
	// readme lists is a tab". Every name in this array must be kept in sync with what
	// `children:` actually declares; a name that ISN'T here never becomes a tab, no
	// matter how it entered `this.children`.
	// `settings` added 2026-09-29 (tabs-settings task), right after `jsonl` — the two
	// storage/state tabs together.
	bar(){
		return ["overview", "make", "jsonl", "settings", "layout", "navigation", "ai", "dynamic", "weight", "generator", "api", "doc", "files", "old"]
			.filter(name => name === "doc" ? Doc.names(this.notes).length > 0 : this.children.has(name));
	},

	// ⚠ bar() (above) only reorders the TOP-TAB strip — the framework's own left
	// sidebar reads `this.children` in raw INSERTION order, and that order is always
	// "declared children, then the sections Doc.initialize() adds" (declare() runs
	// in the Page constructor before initialize()), which Page.class.js decides and
	// this task does not touch. So the Map itself is rebuilt here, right after
	// sections() has added overview/api/doc/files, into the SAME order bar() computes
	// — one order, read by both. Every child SURVIVES (same Page instances, same
	// url); only the Map's iteration order changes.
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
				// `flow` = the site's page rhythm between blocks (the row of three, then the wall).
				// No `--pad-y` override here: `.doc-section`'s own `--pad-y: 1.5em` (Doc.css) is now
				// the ONLY top inset above the first block, since Doc.css's `.tab-panel` stopped
				// paying its own 3em on 2026-09-29 (that 3em was for a bare tab strip with no
				// `.doc-section` below it; here there always is one). Zeroing it here, like this
				// section used to, left the tiles flush against the tab bar — fixed 2026-09-29.
				return this.view ??= div.c("page doc-section flow", () => this.content())
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
		// Show, don't tell (finding 2): the loading order as a strip of small linked
		// tiles, above everything else on the page — one click into the full doc.
		// `wrap` (design-bands 2026-09-30): seven tiles need ~700px, so without it the
		// row ran off the right edge at 400 and the last three tiles were cut off.
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

		// The live "this is a page instance" block. `page_object()` (core/Page/object.js,
		// owned by item-ui) draws EVERY own field flat, 25 rows deep — that used to run
		// right here and crowd the palette wall below it off the first screen (finding 6,
		// 2026-09-29 review). Rather than edit object.js, this wraps it: five named
		// fields a reader actually wants first, then the whole tree one click down inside
		// a plain closed `<details>` ("All fields") — nothing removed, just reordered.
		// `flex v`, not `flow` (design-bands 2026-09-30): `flow` put a paragraph gap
		// (45px at 3440) between rows that already carry their own padding, so the
		// five rows stood 88px apart and half the card was air.
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
