import { Page, div, p, table, thead, tbody, tr, th, td } from "/app.js";
import { code, section } from "../../ui.js";
import { ChromeShell, sample, prev_next, up, child_label, show_source, demo } from "../chrome.js";

export default new Page({
	meta: import.meta,
	title: "Prev / next",
	classes: "chrome",

	content(){
		demo(() => {
			// this page's real siblings, in the order /chrome/page.js declared them
			prev_next(this);
		}, "The pair at the bottom of every page in this section. Live — these are the real neighbours.");

		show_source(prev_next);

		section("Why the order is a promise");

		code(`
declare()   list.forEach(name => this.children.set(name, null))
add()       this.children.set(name, page)     // an EXISTING key never moves

children: "sidebar crumbs topbar siblings drawer palette marks focus"
           0        1       2       3        4       5       6      7
                                    ^ me — prev is 2, next is 4, forever`, "Page.class.js");

		p("A `Map` keeps insertion order, and re-setting a key that is already there leaves it where it was. So a name holds its declared position through the whole of its life — declared, imported, replaced — and index arithmetic over `[...children.keys()]` is stable. Nothing else in the tree needs that promise. This does, and it is the reason to keep it.").ac("note");

		this.order();

		section("The ends");

		code(`
first child   no prev   ->  ↑ up to the parent
last child    no next   ->  nothing`);

		p("A dead end is exactly where a reader most needs a way out, and the parent is always there. `up()` is one line and it is the only place this section renders a link that is not a sibling.").ac("note");

		show_source(up);

		this.ends();

		section("What it costs");

		code(`
labels    a sibling not yet imported shows its label — the sidebar's rule
order     declaration order is AUTHORING order, not alphabetical and not
          navigational: rename a directory and nothing moves, reorder the
          declaration and every prev/next on the section changes at once
reach     siblings only. prev at the first child does not wrap to the
          previous SECTION — that needs a flattened walk of the whole tree,
          and a flattened walk needs every page imported`);

		prev_next(this);
	},

	/* The Map, printed. Unresolved names sit in their declared slots exactly as
	 * loaded ones do, which is the whole claim, so print the state too. */
	order(){
		const parent = this.parent;
		const names = [...parent.children.keys()];

		return div.c("chrome-scroll", () => table.c("chrome-readout", () => {
			thead(() => tr(() => { th("#"); th("name"); th("label"); th("state"); }));

			tbody(() => names.forEach((name, i) => tr(() => {
				td(i);
				td(name);
				td(child_label(parent, name));
				td(parent.children.get(name) ? "Page" : "null").ac(parent.children.get(name) ? "classes" : "none");
			}).ac(name === this.name && "chrome-row-me")));
		}));
	},

	// walk to the ends of a sibling list and watch the pair degrade
	ends(){
		return demo(() => {
			new ChromeShell({
				root: sample(),
				start: "/guide/install/",

				chrome(shell){ shell.$steps = div.c("chrome-box"); },
				navigated(shell){ shell.$steps.empty(() => prev_next(shell.page)); },
			});
		}, "`install` has no prev, so it offers `up`. `deploy` has no next, so it offers nothing — a missing affordance is quieter than a dead one.");
	},
});
