import { Page, Sidebar, View, div, md, h1, h2, a } from "/app.js";
import { stats } from "./stats.js";
import sprawl from "/framework/ext/sprawl/sprawl.js";

/* ONE SECTION PER SIDEBAR SECTION, every card the same shape — icon, name, one-line
 * description — even where a module would rather show something else. This is its own
 * small pass rather than `this.wall_rungs()` (core/Page/Page.class.js) for two review
 * findings (2026-10-02, round 3):
 *
 *   1. A card here is ALWAYS `child.preview_card(nav)`, never `child.preview(nav)`. Several
 *      `ux/` modules (Dictate, Tree, Wizard, …) override `preview()` to show a live
 *      screenshot-style thumb instead — right for their own module page, wrong here: every
 *      OTHER section on this page is icon+name+description, so UX's cards silently broke
 *      that "one card shape" rule the moment `wall_rungs()`'s own `page.previews()` called
 *      the module's override instead of the plain card. `preview_card()` is the one method
 *      nothing overrides; calling it directly is what makes every card on this page agree.
 *   2. A `leaf: true` section (UI, Audit, Sandbox, AI, AI 2 — "I present myself, not my
 *      children": its own children are TABS, not a nav wall, which is exactly why
 *      `wall_rungs()` correctly skips it everywhere else) still gets its OWN one-item
 *      section here: a single card, the section's own `nav()`, same shape as every other
 *      item. The brief names sections by their sidebar heading, UI included, so "one
 *      section per sidebar section" has to hold literally even for the ones with no
 *      wall-worthy grandchild to show instead.
 *
 * `group:` isn't reproduced here (core's `previews()` supports it): no top-level section's
 * own children declare one today, so there is nothing yet for it to group.
 */
function home_sections(root){
	const saved = View.captor;
	View.captor = null;
	try {
		const rungs = [];

		root.children.forEach((page, name) => {
			if (!page?.children.size) return;   // childless (Start here, FAQ, Versus…) stays sidebar-only

			const nav = root.nav_for(name);

			rungs.push(div.c("page-wall flex v gap", () => {
				h2.c("page-wall-title", () => a.c("page-link", nav.label).href(nav.url));

				div.c("page-previews bleed", () => {
					if (page.leaf) return void page.preview_card(nav);   // itself: one card

					page.children.forEach((child, child_name) => {
						const child_nav = page.nav_for(child_name);
						(child ?? page).preview_card(child_nav);
					});
				});
			}).style("--gap", "1em"));
		});

		return rungs;
	} finally {
		View.captor = saved;
	}
}

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	icon: "widgets",

	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start ai ai2 research faq versus core styles ui ux audio ext util dev servex audit sources design code sandbox old",

	/* A LAYOUT, not a content page. Three things an override owes, all silent when
	 * missed (core/Page/readme.md): set `this.view`, carry `.page`, never nest a
	 * second `.page` inside. */
	render(){
		return this.view ??= div.c("page page--framework topic flex fill", () => {

			// Both levels are already loaded — the Router waited on `loading` before
			// activating me — so this is built once, complete, and never rebuilt.
			this.$sidebar = new Sidebar({
				app: this.app,
				header: () => this.app.brand(this.title, this.url),
				root: this,
			});

			// My children mount HERE, inside my own view, so the nav beside them
			// never moves when you navigate between them.
			this.$pages = div.c("pages", () => {

				// ⚠ `default flow`, never `page` — a second `.page` inside this one is
				// what core/Page/doc/method/activate.md says never to do.
				// The widths are in /styles.css: this block takes the region, its
				// `.flow` children take the measure. It used to be four inline styles.
				div.c("default flow", () => {

					div.c("flow", () => {

						h1("A no-build, native-ESM web framework");

						md("Write a page, save the file, refresh the tab.");
					});

					// ⚠ OUTSIDE the prose block: five 9em tiles are 49em with their gaps,
					// and inside a 40em reading column the fifth is stranded on a row of
					// its own. A strip of numbers is a wall, not a sentence — /styles.css
					// gives it the width its own count needs.
					stats();

					// THE SPRAWL — the whole point of this page (2026-10-02 rebuild, see
					// public/framework/ai/2026-10-02/framework-home/). `home_sections()`
					// (above) is this page's own one-rung-per-sidebar-section pass — a
					// childless child (Start here, FAQ, Versus…) still lives in the nav
					// beside this, not here; a `leaf: true` one (UI, Audit, Sandbox…) gets
					// a one-card section instead of being skipped. `sprawl()` balances those
					// rungs into columns by real height instead of stacking them in one tall
					// flex column, so a 3440 screen gets about three columns of roughly equal
					// length instead of one long scroll next to empty grey.
					sprawl(home_sections(this)).ac("wide");

					div.c("flow", () => {

						md("New here? [Start here](/framework/start/) — three files, a working site. Comparing frameworks? [Versus](/framework/versus/). Building a site, not reading the framework? [Web](/web/) is the guide.");

						md("This page used to open with a live clock and a line-by-line tutorial — both still exist, just not on the front page anymore: [Framework (old)](/framework/old/) is the exact page this replaced.");

						md.details(import.meta, "readme.md", "Readme");
					});
				});
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	},
});
