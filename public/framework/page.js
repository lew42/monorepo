import { Page, Sidebar, div, md, code, h1 } from "/app.js";
import { stats } from "./stats.js";
import panel from "/framework/ext/Panel/workspace.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	icon: "widgets",

	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start ai faq versus core styles ui ext util dev audit",

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

						h1("A no-build, native-ESM web framework");

						md("Write a page, save the file, refresh the tab. The path in an `import` is the file on disk, and what you debug is what you typed.");

						stats();

						md("Measured from a clean checkout — [Versus](/framework/versus/) has the method, and the column where React wins.");

						md("Create `/path/page.js`:");

						code.js(`import { p } from "/app.js";

p("Hello world.")`);

						md("That's basically it.");
					}).style("max-width", "52em");

					// ⚠ Height is the knob, not width: the clock is `min(17cqw, 38cqh)`, so in a
					// band wider than tall the HEIGHT sizes it — flat 34em filled 32% at 3440.
					div.c("bleed", () => panel("clock").ac("surface")
						.style("--panel-height", "clamp(20em, 26vw, 48em)"));

					div.c("flow", () => {
						md("That band is a live [`ext/Panel`](/framework/ext/Panel/), and the clock is one of twenty-eight entries in its **T** menu — split the band, retint it, or trade it for any of the other twenty-seven.");
					}).style("max-width", "52em");

					// The tree: every section, and every page inside it. A section with
					// no children of its own is a leaf, and lives in the nav beside this.
					this.walls();

					div.c("flow", () => {

						md("Start at [Start here](/framework/start/) — three files and a working site. Then [FAQ](/framework/faq/) and [Versus](/framework/versus/).");

						md("Building a site rather than reading a framework? [Web](/web/) is the guide — nav patterns and layout principles, each one live and clickable.");

						md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
					}).style("max-width", "52em");
				}).style("--measure", "none");
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	},

	/* One Sidebar entry per child: a flat link, or a titled group if that child has
	 * children of its own. Everything comes from `nav_for()`, so a label or an icon
	 * is declared once, beside the page it names. A child declaring `leaf: true`
	 * stays one link however many children it has — its own page is the way in. */
	sections(){
		return [...this.children.keys()].map(name => {
			const entry = this.nav_for(name);
			const section = this.children.get(name);

			if (section?.leaf || !section?.children.size)
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
