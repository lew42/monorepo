import { Page, Sidebar, div, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",

	// I bring my own navigation, so the global one is noise while you're in here.
	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start versus core ext styles util dev",

	// Labels that differ from the page's own title, and nothing else. Icons live on
	// the pages — see core/Page/readme.md §"nav".
	nav: {
		start: "Start here",
		ext:   "Extensions",
		util:  "Utilities",
		dev:   "Dev server",
	},

	/* The sidebar draws TWO levels, so it needs two levels of imports: my seven
	 * sections, and then each section's own children. Explicit and in one place,
	 * because the cost is real and belongs where it is spent.
	 *
	 * Measured: 28 page.js fetches on any /framework/ url, and **+51ms to first
	 * paint** — they resolve after `inject()`, so the reader is already reading. The
	 * alternative was a hand-typed copy of all 25 entries, which lived here for a
	 * while and drifted the first time anything moved.
	 *
	 * Both levels, not one: `previews()` and `tabs()` on a section read that
	 * section's `loading`, and this promise is what the sidebar's redraw waits for —
	 * awaiting only the first level redrew before the grandchildren had titles, and
	 * the nav read `markdown demo highlight` in lower case.
	 */
	initialize(){
		this.loading = this.load_all_children().then(sections =>
			Promise.all(sections.filter(Boolean).map(page => page.loading ?? page.load_all_children())));
	},

	/* A LAYOUT, not a content page — so it builds its own wrapper and the `.page`
	 * element IS the row. Three things an override owes, all silent when missed
	 * (core/Page/readme.md): set `this.view`, carry `.page`, never nest a second
	 * `.page` inside. */
	render(){
		return this.view ??= div.c("page page-framework topic", () => {

			this.$sidebar = new Sidebar({
				// logo goes home; the wordmark is this section's own url
				header: () => this.app.brand(this.title, this.url),
				pages: this.sections(),
			});

			/* The second level arrives with the imports. Rebuilt rather than patched:
			 * the header is identical either way, so all that visibly happens is the
			 * sub-entries appearing.
			 *
			 * `pages` has to be recomputed, not just re-rendered — it is an ARRAY,
			 * evaluated once when the Sidebar was constructed, so re-running render()
			 * against it drew the same flat list again. Which looked like the promise
			 * never firing, and was measured as `versus core styles` in lower case. */
			this.loading.then(() => this.$sidebar
				.assign({ pages: this.sections() })
				.empty(() => this.$sidebar.render()));

			// My children mount HERE, inside my own view — so the nav beside them is
			// never rebuilt and never moves when you navigate between them. `papers`
			// gives every one of them the measure without each declaring it.
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
	},

	/* One `Sidebar` entry per child: a flat link, or a titled group if that child has
	 * children of its own. Everything comes from `nav_for()` — mine for the top
	 * level, each section's for its own — so an icon or a label is declared once,
	 * beside the page it names, and this file names nothing twice.
	 *
	 * Before the imports land a section is simply flat. The list grows downward
	 * rather than reshaping, so the top level is correct from the first frame.
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
