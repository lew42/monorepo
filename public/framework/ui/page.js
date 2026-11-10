import { Doc, md, code, ui } from "/app.js";

/* Record: readme.md. Declared once, most-useful-first, and `children:` is derived from
   it so no component is named twice.
   ⚠ Order is editorial, not alphabetical: a reader landing here meets `card`,
     `toolbar`, `table` and `dialog` long before `kbd`.
   ⚠ The owner's tree, not a flat alphabet (ui-kit step 4, 2026-11-09): elements first,
     then what's built from them. Was four bands of six/six/six/five (Surfaces, Data,
     Forms, Marks); now five bands of five/six/six/six/four, in the order a file tree
     reads — smallest unit at the top. A band is its own grid and `auto-fit` stretches
     it to fill the row, so an UNEVEN band draws wider cards than its neighbours at the
     same wall width; that is accepted here (the owner's words asked for this order,
     not for five equal piles) — if it ever reads as broken rather than as a
     deliberately smaller shelf, that is the fix to make, not reverting the order. */
export const BANDS = {
	Elements: "text icon badge kbd avatar",
	Parts:    "row item tree controls field tags",
	Cards:    "card panel stats accordion decision alert",
	Menus:    "menu toolbar crumbs pagination tooltip dialog",
	Data:     "table timeline progress datagrid",
};

const names = Object.values(BANDS).flatMap(band => band.split(" "));

export default new Doc({
	meta: import.meta,
	title: "UI",
	description: "A tree, not a list — elements first, then what's built from them, in five bands. Four functions, the rest copy-paste templates.",
	icon: "widgets",

	// ⚠ Required on a Doc that is ALSO a nav section. framework/page.js's sections()
	// lists a section's children as sidebar sub-entries, which for a Doc means
	// spilling Overview · API · Docs · Files into the site nav as if they were pages.
	leaf: true,

	// Real directories, real urls — Router.child() resolves each from <name>/page.js.
	// ⚠ `background`, `section` and `scale` are appended here, NOT added to BANDS
	// above: each is a config word or a one-off, not a component that belongs in a
	// band's own grid — background-layer task, 2026-09-19; section-variants task,
	// 2026-09-28; scale, same day. `words` moved out here too (ui-kit step 4,
	// 2026-11-09): it is the same kind of page as `scale`/`section` — a demo of
	// applying a config word (`ui-contrast`/`ui-compact`), not a tree component —
	// so it left the old Marks band rather than take a seat in the new tree.
	// `item`, `icon`, `datagrid` and `row` used to be appended for the same reason
	// (landed the day the old bands were declared even, and a fifth or seventh
	// member would have broken that); the new tree (above) has room for all four as
	// real band members — Parts (`row`, `item`) and Elements (`icon`) and Data
	// (`datagrid`) — so they moved back into BANDS instead of staying appended.
	children: names.join(" ") + " background scale section words",

	/* Overview · API · Docs · Files, and nothing else. Doc's own bar() lists every
	   declared child between the Overview and the reference sections, which is right
	   for the three or four a module usually has and a wall of chrome at nineteen —
	   the components are the Overview's browse wall instead. This is a reading of THIS
	   module's shape, not a change to the contract: core/Page (5), ext/DesignTool (5)
	   and ext/catalog (4) still tab their children. */
	bar(){ return Doc.SECTIONS.filter(name => this.children.has(name)); },

	/* ⚠ tabs() registers a child's mount region from the SAME list it draws the strip
	   from (ext/tabs/tabs.js), so a name dropped from bar() also loses its region —
	   and container() then walks up to /framework/'s own `$pages` and renders the
	   component OVER the framework sidebar instead of inside this doc. The nineteen
	   keep their urls and their region; only the strip got shorter. */
	render(){
		const $view = Doc.prototype.render.call(this);
		const $panel = this.regions.get("overview");

		this.children.forEach((page, name) => this.regions.set(name, $panel));

		return $view;
	},

	subject: ui,
	methods: "table timeline keys item datagrid",
	notes: "record decisions",
	files: "ui.js parts.js page.js readme.md "
		+ "table/table.js table/page.js datagrid/datagrid.js datagrid/page.js field/page.js crumbs/crumbs.js crumbs/page.js "
		+ "pagination/page.js card/page.js stats/page.js badge/badge.js badge/page.js "
		+ "alert/alert.js alert/page.js toolbar/page.js tags/page.js panel/panel.js panel/page.js row/row.js row/page.js "
		+ "tooltip/tooltip.js tooltip/page.js avatar/avatar.js avatar/page.js dialog/dialog.js dialog/page.js "
		+ "progress/page.js menu/menu.js menu/page.js accordion/accordion.js accordion/page.js "
		+ "timeline/timeline.js timeline/page.js kbd/kbd.js kbd/page.js "
		+ "words/words.js words/page.js controls/page.js controls/controls.css",

	content(){

		// One line, not three — every line here is a row of the live wall pushed
		// below the fold, and the wall is what this page has to show.
		md("Every card below is a **live call**, drawn by the page it links to — click one to open it full size on a stage you can drag.");

		/* ⚠ `this` is the module's own Doc, NOT the Overview section — `overview_section()`
		   binds this function back to the Doc (Doc.js), which is what makes `this.browse()`
		   mean what the author typed. `this.parent` was correct before that binding landed
		   and is now the FRAMEWORK LANDING: this wall was drawing Start here · AI · FAQ ·
		   Core · Styles, on the UI page, and nothing threw.
		   ⚠ `--column: 18em`. A thumb is the component at `zoom-50`, so the card's width
		   times TWO is the width the component lays out at — 18em lands a table, a toolbar
		   and a dialog on ~580px, which is the width each of them is actually used at. */
		this.browse(BANDS, { "--column": "18em", "--gap": "var(--flow)" }).ac("bleed");

		md("## Four functions, sixteen templates");

		md("Only [Data table](/framework/ui/table/), [Timeline](/framework/ui/timeline/), `keys()` on [Keys](/framework/ui/kbd/) and [Item](/framework/ui/item/) are functions, and each is a **loop** — the one thing markup cannot express. `item()`'s loop is the recursion down a tree of children. The other eighteen pages hand you the markup with a copy button: some ship a class or two of CSS beside it, several ship none at all.");

		code.js(`import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
ui.item({ icon: "folder", name: "core", children: [
	{ icon: "description", name: "View.js", href: "/framework/core/View/" },
] });`);

		md("The bar for exporting a function is **logic a user shouldn't have to carry**: a loop over rows, a listener, a name that has to be unique, a trap that costs an afternoon. Everything else is markup, and markup is better handed over than hidden — see [`ui.table`](/framework/ui/api/table/) in the API tab for the source these three carry.");

		md("## A component's variants are its children");

		md("Each page leads with the **most useful version of the component, big, on a stage** — and every genuinely different way of building the thing is a **child page** below it, previewed with the same cards this wall is made of. `demo.exhibit()` draws that Variants wall itself, from the page's own `children:`. `/framework/ui/field/invalid/` is a url, a card and a stage; there is no second preview mechanism.");

		md("A variant earns its place by being a **different thing, not a different value**. Three sizes of the same circle is the `--avatar` token; a two-up stat wall is `--column`; a numeric table is `.c(\"num\")`. Those live in the primary's source, where a reader can change them — the children are the shapes you cannot get to from there.");

		md("## The CSS");

		md("A component that survived as CSS did so because a rule was about a **relationship or a state** — a bubble positioned against its word, a hairline between two items, a ring drawn only on a stacked circle. Each such module is a `<name>.js` holding one `css()` call. **No component relies on a theme**: every value is a framework token, so one renders unthemed.");

		md("Start at [Card](/framework/ui/card/) — the first card in the first band, and there is no `ui.card()` behind it.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
