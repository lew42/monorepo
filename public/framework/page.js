import { Page, Sidebar, div, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	icon: "widgets",

	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start faq versus core styles ui ext util dev ai",

	/* A LAYOUT, not a content page. Three things an override owes, all silent when
	 * missed (core/Page/readme.md): set `this.view`, carry `.page`, never nest a
	 * second `.page` inside. */
	render(){
		return this.view ??= div.c("page page-framework topic flex fill", () => {

			// Both levels are already loaded — the Router waited on `loading` before
			// activating me — so this is built once, complete, and never rebuilt.
			this.$sidebar = new Sidebar({
				app: this.app,
				header: () => this.app.brand(this.title, this.url),
				pages: this.sections(),
			});

			// My children mount HERE, inside my own view, so the nav beside them
			// never moves when you navigate between them.
			this.$pages = div.c("pages", () => {

				// ⚠ `default flow`, never `page` — a second `.page` inside this one is
				// what core/Page/doc/method/activate.md says never to do.
				// ⚠ `--measure: none` declared HERE beats the sheet width this would
				//   otherwise inherit, which capped the landing at 1080px; the prose
				//   takes its own measure back below.
				div.c("default flow", () => {

					div.c("flow", () => {

						md("Create `/path/page.js`:");

						code.js(`import { p } from "/app.js";

p("Hello world.")`);

						md("That's basically it.");
					}).style("max-width", "52em");

					// The tree: every section, and every page inside it. A section with
					// no children of its own is a leaf, and lives in the nav beside this.
					this.walls();

					div.c("flow", () => {

						md("Start at [Start here](/framework/start/) — three files and a working site. Then [FAQ](/framework/faq/) and [Versus](/framework/versus/).");

						md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
					}).style("max-width", "52em");
				}).style("--measure", "none");
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	},

	/* One Sidebar entry per child: a flat link, or a titled group if that child has
	 * children of its own. Everything comes from `nav_for()`, so a label or an icon
	 * is declared once, beside the page it names. */
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
