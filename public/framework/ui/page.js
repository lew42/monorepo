import { Doc, md, code, ui } from "/app.js";

/* Record: readme.md. Declared once, most-useful-first, and `children:` is derived from
   it so no component is named twice.
   ⚠ Order is editorial, not alphabetical: a reader landing here meets `card`,
     `toolbar`, `table` and `dialog` long before `kbd`.
   ⚠ Five, five, five and four — the sizes are load-bearing. A band is its own grid and
     `auto-fit` stretches it to fill the row, so at 3440 a band of three would draw
     three cards a thousand pixels wide. Even bands mean even cards. */
const BANDS = {
	Surfaces: "card toolbar panel stats accordion",
	Data:     "table timeline progress pagination crumbs",
	Forms:    "field dialog tags menu tooltip",
	Marks:    "badge alert avatar kbd",
};

const names = Object.values(BANDS).flatMap(band => band.split(" "));

export default new Doc({
	meta: import.meta,
	title: "UI",
	description: "Nineteen components in four bands — three functions, sixteen copy-paste templates.",
	icon: "widgets",

	// ⚠ Required on a Doc that is ALSO a nav section. framework/page.js's sections()
	// lists a section's children as sidebar sub-entries, which for a Doc means
	// spilling Overview · API · Docs · Files into the site nav as if they were pages.
	leaf: true,

	// Real directories, real urls — Router.child() resolves each from <name>/page.js.
	children: names.join(" "),

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
	methods: "table timeline keys",
	notes: "record decisions",
	files: "ui.js parts.js page.js readme.md "
		+ "table/table.js table/page.js field/page.js crumbs/crumbs.js crumbs/page.js "
		+ "pagination/page.js card/page.js stats/page.js badge/badge.js badge/page.js "
		+ "alert/alert.js alert/page.js toolbar/page.js tags/page.js panel/panel.js panel/page.js "
		+ "tooltip/tooltip.js tooltip/page.js avatar/avatar.js avatar/page.js dialog/dialog.js dialog/page.js "
		+ "progress/page.js menu/menu.js menu/page.js accordion/accordion.js accordion/page.js "
		+ "timeline/timeline.js timeline/page.js kbd/kbd.js kbd/page.js",

	content(){

		md("Every card is a **live call**, drawn by the page it links to. **Click one** and the component opens at full size on a stage you can drag, with its variants below it.");

		/* ⚠ `this` is the module's own Doc, NOT the Overview section — `overview_section()`
		   binds this function back to the Doc (Doc.js), which is what makes `this.browse()`
		   mean what the author typed. `this.parent` was correct before that binding landed
		   and is now the FRAMEWORK LANDING: this wall was drawing Start here · AI · FAQ ·
		   Core · Styles, on the UI page, and nothing threw.
		   ⚠ `--column: 18em`. A thumb is the component at `zoom-50`, so the card's width
		   times TWO is the width the component lays out at — 18em lands a table, a toolbar
		   and a dialog on ~580px, which is the width each of them is actually used at. */
		this.browse(BANDS, { "--column": "18em", "--gap": "2em" }).ac("bleed");

		md("## Three functions, sixteen templates");

		md("Only [Data table](/framework/ui/table/), [Timeline](/framework/ui/timeline/) and `keys()` on [Keys](/framework/ui/kbd/) are functions, and each is a **loop** — the one thing markup cannot express. The other sixteen pages hand you the markup with a copy button: some ship a class or two of CSS beside it, several ship none at all.");

		code.js(`import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");`);

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
