import { Page, Sidebar, div, md, code } from "/app.js";

/* The sidebar's two levels.
 *
 * Hand-typed, and deliberately: reading a section's own `children` means
 * importing that section, and importing all five of them here is precisely what
 * lazy loading exists to avoid — the same call `/page.js` makes with `sections`.
 * A Sidebar entry only needs `label`, `url` and `icon`, none of which requires
 * the page to exist.
 *
 * The honest cost is drift: this list and each section's `children` are two
 * places that have to agree. It is one screen of data in one file, against five
 * eager module fetches on every page under /framework/. If it starts drifting,
 * the fix is `load_all_children()` in `initialize()` and filling each group
 * after first paint — the shape `tabs()` already uses.
 *
 * A group leads with its section's own page rather than making the heading a
 * link: a group heading that navigates is a link pretending to be a heading
 * (core/Sidebar/readme.md §2). Flat entries and groups mix freely — `Sidebar.nav()`
 * duck-types on `.pages`, so "Start here" beside "CORE" costs no new concept.
 *
 * Icons for core/'s children are picks, not gospel — core has no `nav` map of its
 * own, and three of these (image / description / alt_route) are simply the ones
 * the Sidebar doc page was already using for the same five classes.
 *
 * `sidebar_nav` and not `nav`: this page already has a `nav` PROPERTY, and the
 * two are different things at different depths — the property says how this page
 * presents its seven children (which `previews()` reads), this says what the
 * panel lists two levels down.
 */
const sidebar_nav = [
	{ label: "Start here", url: "/framework/start/",  icon: "flag" },
	{ label: "Versus",     url: "/framework/versus/", icon: "balance" },

	{ title: "Core", pages: [
		// { label: "Overview", url: "/framework/core/",         icon: "dashboard" },
		{ label: "View",     url: "/framework/core/View/",    icon: "image" },
		{ label: "Page",     url: "/framework/core/Page/",    icon: "description" },
		{ label: "Router",   url: "/framework/core/Router/",  icon: "alt_route" },
		{ label: "App",      url: "/framework/core/App/",     icon: "widgets" },
		{ label: "Sidebar",  url: "/framework/core/Sidebar/", icon: "view_sidebar" },
	]},

	{ title: "Ext", pages: [
		{ label: "Overview",  url: "/framework/ext/",           icon: "extension" },
		{ label: "Markdown",  url: "/framework/ext/markdown/",  icon: "article" },
		{ label: "Demo",      url: "/framework/ext/demo/",      icon: "play_circle" },
		{ label: "Highlight", url: "/framework/ext/highlight/", icon: "code" },
		{ label: "Classdoc",  url: "/framework/ext/classdoc/",  icon: "menu_book" },
	]},

	{ title: "Styles", pages: [
		{ label: "Overview", url: "/framework/styles/",       icon: "palette" },
		{ label: "base",     url: "/framework/styles/base/",  icon: "layers" },
		{ label: "theme",    url: "/framework/styles/theme/", icon: "brush" },
		{ label: "util",     url: "/framework/styles/util/",  icon: "build" },
	]},

	{ title: "Util", pages: [
		{ label: "Overview", url: "/framework/util/",    icon: "handyman" },
		{ label: "is",       url: "/framework/util/is/", icon: "rule" },
	]},

	{ title: "Dev", pages: [
		{ label: "Dev server", url: "/framework/dev/", icon: "terminal" },
	]},
];

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",

	// I bring my own navigation, so the global one is noise while you're in here.
	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	// Lazy: names, not imports. Nothing below here loads until you walk to it.
	children: "start versus core ext styles util dev",

	/* A label belongs to the parent's LIST and is there from the start; a title
	 * belongs to a page and only exists once that page is imported. Deriving the
	 * nav from titles would make it read differently depending on where you came
	 * from — the same bug tab bars already refuse.
	 *
	 * An icon is the same kind of thing, which is why it lives here and not on
	 * the page: it names this ENTRY in this menu. So it costs no import, and
	 * `previews()` below draws a complete card for a page that hasn't loaded. */
	nav: {
		start:  { label: "Start here", icon: "flag" },
		versus: { label: "Versus",     icon: "balance" },
		core:   { label: "Core",       icon: "dashboard" },
		ext:    { label: "Extensions", icon: "extension" },
		styles: { label: "Styles",     icon: "palette" },
		util:   { label: "Utilities",  icon: "build" },
		dev:    { label: "Dev server", icon: "terminal" },
	},

	/* A LAYOUT, not a content page — so it builds its own wrapper and the `.page`
	 * element IS the row. The default wrapper would have needed a `div.section`
	 * inside it whose only job was `display: flex`.
	 *
	 * Three things an override owes, all silent when missed (core/Page/readme.md):
	 * set `this.view`, carry `.page`, and never nest a second `.page` inside. */
	render(){
		return this.view ??= div.c("page page-framework topic", () => {

			new Sidebar({
				// logo goes home; the wordmark is this section's own url
				header: () => this.app.brand(this.title, this.url),

				// Two levels, declared at the top of this file. Still imports
				// nothing — an entry is a label, a url and an icon, and none of
				// those needs the page to exist.
				pages: sidebar_nav,
			});

			// My children mount HERE, inside my own view — so the nav beside them
			// is never rebuilt and never moves when you navigate between them.
			// `papers` gives every one of them the measure without each declaring it.
			this.$pages = div.c("pages papers", () => {

				// what /framework/ itself shows, and only then
				div.c("default", () => {

					md("Create `/path/page.js`:");

					code.js(`import { p } from "/app.js";

p("Hello world.")`);

					md("That's basically it.");

					this.previews();

		md("Start at [Start here](/framework/start/) — three files and a working site.");

					md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
				});
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	}
});
