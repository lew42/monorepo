import { Page, div, p, table, thead, tbody, tr, th, td } from "/app.js";
import { code, section } from "../../ui.js";
import { child_label, nav, prev_next, show_source, demo } from "../chrome.js";

/* Open #6, answered. The site's nav is hand-typed with a comment admitting why:
 * a nav built from app.root's children would have to import every one of them
 * to read their titles. It doesn't — it has to read their LABELS, and a label
 * is a thing the parent already knows. */
export default new Page({
	meta: import.meta,
	title: "Sidebar nav",
	classes: "chrome",

	content(){
		show_source(child_label);

		p("The whole answer. A `title` belongs to a page and arrives with its import; a `label` belongs to the parent's list and is there from the start.").ac("note");

		section("Two levels, zero imports");

		show_source(nav);

		demo(() => {
			// THIS SITE'S REAL TREE, and real links — click one and you leave.
			nav(this.app.root, this);
		}, "Live. The top level is `app.root.children`, the sub-level is the section you are in. `.active` and `.in-path` are the real `Router.mark_links()` pass — nothing here compares urls.");

		p("The sub-level is safe because you `walked` through that page to get here, so its `children` Map already exists. One level deeper would need an import; two levels is the free one.").ac("note");

		section("Derived vs hand-typed");

		this.compare();

		p("Computed live from `app.nav`, `app.recipes` and `app.root.children`, so this table cannot drift from either nav. Where they disagree, the parent declares a label — and where the hand-typed one is simply missing a section, nothing can be done but notice.").ac("note");

		code(`
labels: { dynamic: "route()", marks: "Active state" }`, "inert data on the parent — Page never reads it");

		section("What it costs");

		code(`
name-until-visited   free      the label CHANGES as you browse, and reads
   (previews' rule)            differently depending on where you came in
prettified name      free      deterministic, and wrong when the segment lies
declared label       1 string  in the parent, beside the name it labels
load_all_children()  N fetches real titles, and laziness is gone
build-time manifest  —         forbidden: no build step, ever`);

		p("Only the middle two are free AND stable, and they compose: prettify by default, declare when the name lies. A sidebar is on screen the whole session — it is the worst place in a site for a label that mutates.").ac("note");

		section("What it can't do");

		p("The hand-typed nav has a `recipes` heading; a derived one is flat. Grouping is a shape in the tree, not a feature of a nav — if two sections belong together, the honest fix is a page they are both children of.").ac("note");

		prev_next(this);
	},

	/* Every top-level name, what the rule makes of it, and what a human typed.
	 * Live, so the count at the bottom is a measurement rather than a claim. */
	compare(){
		const typed = new Map([...this.app.nav, ...this.app.recipes]);
		const root = this.app.root;
		const tally = { same: 0, editorial: 0, missing: 0 };

		const $stage = div.c("chrome-scroll", () => {
			table.c("chrome-readout", () => {
				thead(() => tr(() => { th("name"); th("derived"); th("hand-typed"); th(""); }));

				tbody(() => root.children.forEach((_, name) => {
					const derived = child_label(root, name);
					const hand = typed.get(root.url + name + "/");

					// three outcomes, not two: agreeing, disagreeing, and ABSENT —
					// a hand-typed list can fall behind the tree, and this one has
					const verdict = !hand ? "missing" : derived === hand ? "same" : "editorial";
					tally[verdict]++;

					tr(() => {
						td(name);
						td(derived);
						td(hand ?? "— not in the sidebar at all —");
						td({ same: "✓", editorial: "≠", missing: "!" }[verdict])
							.ac(verdict === "same" ? "classes" : "none");
					});
				}));
			});
		});

		p(`\`${tally.same}\` of \`${root.children.size}\` come out right from the name alone. \`${tally.editorial}\` are editorial choices no rule could compute — that is what \`labels\` is for. And \`${tally.missing}\` sections exist in the tree and are not in the hand-typed sidebar at all.`).ac("note");

		p("That last number is the argument. It was `0` when this page was written; the council kept adding seats and the hand-typed list fell behind. A derived nav cannot fall behind, because there is no second list to update.").ac("note");

		return $stage;
	},
});
