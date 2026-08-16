import { Doc, md, code, ui } from "/app.js";
import { pack } from "../styles/layouts/masonry/masonry.js";

export default new Doc({
	meta: import.meta,
	title: "UI",
	description: "Nineteen components — three functions, sixteen copy-paste templates.",
	icon: "widgets",

	// ⚠ Required on a Doc that is ALSO a nav section. framework/page.js's sections()
	// lists a section's children as sidebar sub-entries, which for a Doc means
	// spilling Overview · API · Docs · Files into the site nav as if they were pages.
	leaf: true,

	// Real directories, real urls — Router.child() resolves each from
	// <name>/page.js. See readme.md, "Where this module overlaps others" in the
	// audit, for why these stay declared children rather than an `overview:` rail.
	children: "table field crumbs pagination card stats badge alert toolbar tags panel tooltip avatar dialog progress menu accordion timeline kbd",

	/* Overview · API · Docs · Files, and nothing else. Doc's own bar() lists every
	   declared child between the Overview and the reference sections, which is right
	   for the three or four a module usually has and a wall of chrome at nineteen —
	   the components are the Overview's preview grid instead. This is a reading of
	   THIS module's shape, not a change to the contract: core/Page (5),
	   ext/LayoutTool (5) and ext/catalog (4) still tab their children. */
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
	notes: "record",
	files: "ui.js parts.js page.js readme.md "
		+ "table/table.js table/page.js field/page.js crumbs/crumbs.js crumbs/page.js "
		+ "pagination/page.js card/page.js stats/page.js badge/badge.js badge/page.js "
		+ "alert/alert.js alert/page.js toolbar/page.js tags/page.js panel/panel.js panel/page.js "
		+ "tooltip/tooltip.js tooltip/page.js avatar/avatar.js avatar/page.js dialog/dialog.js dialog/page.js "
		+ "progress/page.js menu/menu.js menu/page.js accordion/accordion.js accordion/page.js "
		+ "timeline/timeline.js timeline/page.js kbd/kbd.js kbd/page.js",

	content(){

		md("Every card below is a **live call**, drawn by the page it links to — each component overrides `preview()` with its own render, so a card cannot show something its page doesn't. **Click one** and it opens on a stage you can drag narrower, with the layout bar wired to it and the markup that built it open beside — the same [exhibit](/framework/ext/demo/) every detail page on this site is.");

		code.js(`import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");`);

		/* ⚠ `this` is the module's own Doc, NOT the Overview section — `overview_section()`
		   binds this function back to the Doc (Doc.js), which is what makes `this.look()`
		   mean what the author typed. `this.parent` was correct before that binding
		   landed and is now the FRAMEWORK LANDING: this wall was drawing Start here · AI ·
		   FAQ · Core · Styles, on the UI page, and nothing threw.
		   ⚠ `wall()`, not `previews()`: the four derived sections are children too, so a
		   plain wall previews this page's own tab strip back at itself.
		   ⚠ `packed`, not `masonry`: this wall is a GRID and stays one — `stats` claims
		   `card: "two"` (`grid-column: span 2`), which CSS columns cannot honour. The
		   measuring pass is the price of keeping the span, the `dense` backfill, and the
		   DOM order the prose leans on ("Start at Data table"). `pack()` reads
		   `el.children`, so it runs here, synchronously, never after an `await`. */
		pack(this.wall().ac("packed"));

		md("## Three functions, sixteen templates");

		md("Only [Data table](/framework/ui/table/), [Timeline](/framework/ui/timeline/) and `keys()` on [Keys](/framework/ui/kbd/) are functions, and each is a **loop** — the one thing markup cannot express. The other sixteen pages hand you the markup with a copy button: some ship a class or two of CSS beside it, several ship none at all.");

		md("The bar for exporting a function is **logic a user shouldn't have to carry**: a loop over rows, a listener, a name that has to be unique, a trap that costs an afternoon. Everything else is markup, and markup is better handed over than hidden — see [`ui.table`](/framework/ui/api/table/) in the API tab for the source these three carry.");

		md("## A component's variants are its children");

		md("Each page leads with one component on a stage and its source beside it; every *other* way of building the thing is a **child page** under it, previewed with the same cards this rail is made of — `demo.exhibit()` draws that Variants wall itself, from the page's own `children:`. `/framework/ui/field/invalid/` is a url, a card and a stage; there is no second preview mechanism.");

		md("## The CSS");

		md("A component that survived as CSS did so because a rule was about a **relationship or a state** — a bubble positioned against its word, a hairline between two items, a ring drawn only on a stacked circle. Each such module is a `<name>.js` holding one `css()` call, which writes `@layer base, theme, site, util;` for you, because a short layer list silently drops `site` past `util`. **No component relies on a theme**: every value is a framework token, so one renders unthemed.");

		md("Start at [Data table](/framework/ui/table/) — one declaration of CSS, and it is a bug report.");

		md.details(import.meta, "readme.md", "Design record — what survived the review, where the CSS lives, and the unification");
	},
});
