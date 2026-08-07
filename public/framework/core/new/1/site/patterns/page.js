import { Page, View, p, div, a } from "/app.js";
import { code, section } from "../ui.js";
import { recipe } from "./recipe.js";

View.stylesheet(import.meta, "patterns.css");

/* Eight miniature products. Every other seat is proving the framework's own
 * vocabulary; this one asks whether that vocabulary can carry the shape of real
 * content — a docs tree that is deep in one branch and flat in another, an API
 * with more symbols than anyone would make files for, a form whose state must
 * survive a round trip, filters that are not a path segment.
 *
 * Prose here uses no `**bold**` and no [markdown](links): p() renders backticks
 * and nothing else, so anything richer would ship as literal asterisks.
 */
const nav = () => ({
	meta: import.meta,
	title: "Applied IA",

	// All lazy, and I claim NO region: each product owns its own arrangement,
	// so they replace each other rather than nesting inside me. A section index
	// that claimed a `$pages` would impose one layout on eight products.
	children: "docs api settings dashboard shop wiki onboarding gallery",

	content(){ this.finding(); this.previews(); this.table(); },
});

export default new Page(nav(), {

	finding(){
		code(`
the SAME card, on the same page — cold load vs clicking your way in

/patterns/docs/guide/concepts/batches/    Guide             vs   guide
/patterns/docs/reference/backoff-cap/     Config reference  vs   reference
/patterns/docs/tutorials/retries/         Tutorials         vs   tutorials

whichever branch you cold-load gets a Title; the other two get names.`,
			"the sharpest finding: clicking and reloading do not agree");

		p("“The state is read entirely off the url, so clicking produces byte-identical output to reloading” is the claim, and realistic content breaks it twice. A cold deep load resolves the whole chain before rendering, so `previews()` finds `guide` loaded and prints its title; clicking in renders that card while `guide` is still `null`, so it prints the declared name — and a page is built once, so it never changes its mind.");

		p("The second break is the same root cause with a worse symptom: when two pages in one region are visible at once, their DOM order is arrival order, not chain order, so a nested tab set renders its two sections in a different order depending on how you arrived. Both come from one thing — a page renders once, from whatever happened to be resolved at that moment.");

		div.c("row", () => {
			a.c("page-link", "measured, in the docs site →").href("/patterns/docs/");
			a.c("page-link", "and in settings →").href("/patterns/settings/notifications/push/");
		});

		section("The sharpest request: a link with a query string loses it");

		code(`
click(e){
    const link = this.link_clicked(e);
    …
    this.go(link.pathname);      // link.search is dropped. Silently.
}`, "Router.js");

		p("A catalogue cannot ship. `<a href=\"?colour=oxblood\">` reloads correctly and clicks incorrectly: on a cold load the query survives in `location.search`, but the Router navigates by `link.pathname` alone — so clicking a filter throws the filter away and pushes a url that no longer says what the screen shows.");

		p("Reloadable but not clickable is the one combination nothing downstream can fake, because the loss happens inside the framework's own click handler.");

		div.c("row", () => a.c("page-link", "the catalogue measures it →").href("/patterns/shop/"));

		section("Every page here prints its own navigation");

		recipe(nav);

		p("That box is not a description of this page — it is `nav`, the object `new Page()` was called with, read back with `source()`. Content lives in a second object, so a 200-line product page still shows a six-line recipe.").ac("note");

		section("The products");
	},

	table(){
		code(`
product        content shape                        recipe                      the finding
─────────────  ───────────────────────────────────  ──────────────────────────  ────────────────────────────────────────
docs           deep one branch, flat the other      cols + lazy files           columns never cap; "full" is two ideas
api            115 symbols, members below them      route() over a data module  route() nests; a dead link costs a reload
settings       sections, sub-sections, a form       tabs + a nested tabs file   a nested tab bar highlights the wrong tab
dashboard      12 panels, one url                   no navigation at all        a panel is a page once you can link it
shop           categories, items, FILTERS           route() + a query shim      the query string has to exist
wiki           a graph: no tree, cross-links        route(), one level, flat    chain() is a tree; a graph gets nothing
onboarding     5 ordered steps, no skipping         inline children             content() runs once, so it cannot guard
gallery        albums, a photo OVER its album       route() + an overlay class  works with no support — and none exists`,
			"content shape → navigation recipe → what was missing");

		p("Read them in that order. `docs` is the archetype `ColumnPager` was built for and is where the replacement is tested hardest; `shop` carries the one request nothing downstream can fake; `wiki` is the one that says don't.").ac("note");
	},
});
