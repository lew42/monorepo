import { Page, Sidebar, div, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	icon: "widgets",

	// I bring my own navigation, so the global one is noise while you're in here.
	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start faq versus core styles ext util dev",

	// Labels that differ from the page's own title, and nothing else. Icons live on
	// the pages — see core/Page/readme.md §"nav".
	nav: {
		start: "Start here",
		ext:   "Extensions",
		util:  "Utilities",
		dev:   "Dev server",
	},

	/* The sidebar draws TWO levels. Each section that has children opts into
	 * load_all_children() itself, and opt-ins compose — so this one call settles
	 * when every title the sidebar needs is real, and the Router waits for it
	 * before activating me. Measured: 59 page.js fetches on any /framework/ url,
	 * spent before first paint — the nav draws once, right, instead of drawing
	 * names and sharpening. The alternative was a hand-typed copy of all those
	 * entries, which lived here for a while and drifted the first time anything
	 * moved. */
	initialize(){ this.load_all_children(); },

	/* A LAYOUT, not a content page — so it builds its own wrapper and the `.page`
	 * element IS the row. Three things an override owes, all silent when missed
	 * (core/Page/readme.md): set `this.view`, carry `.page`, never nest a second
	 * `.page` inside. */
	render(){
		// `flex` is a plain utility class, and a page may now carry one: the
		// arrangement contract lives in @layer util and out-ranks it. See Page.css.
		return this.view ??= div.c("page page-framework topic flex", () => {

			// Both levels are already loaded — the Router waited on `loading` before
			// activating me — so this is built once, complete, and never rebuilt.
			// `app`, so the footer can render the colour-scheme toggle.
			this.$sidebar = new Sidebar({
				app: this.app,
				// logo goes home; the wordmark is this section's own url
				header: () => this.app.brand(this.title, this.url),
				pages: this.sections(),
			});

			// My children mount HERE, inside my own view — so the nav beside them is
			// never rebuilt and never moves when you navigate between them. The
			// region default gives every one of them the measure (Page.css).
			this.$pages = div.c("pages", () => {

				// what /framework/ itself shows, and only then. `flow`, because a
				// hand-built default div is outside the .page flow rule's reach.
				div.c("page default flow", () => {

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
	},

	/* One `Sidebar` entry per child: a flat link, or a titled group if that child has
	 * children of its own. Everything comes from `nav_for()` — mine for the top
	 * level, each section's for its own — so an icon or a label is declared once,
	 * beside the page it names, and this file names nothing twice.
	 */
	sections(){
		return [...this.children.keys()].map(name => {
			const entry = this.nav_for(name);
			const section = this.children.get(name);

			if (!section?.children.size)
				return entry;

			return {
				title: entry.label,
				pages: [
					{ ...entry, label: "Overview" },
					...[...section.children.keys()].map(child => section.nav_for(child)),
				],
			};
		});
	},
});
