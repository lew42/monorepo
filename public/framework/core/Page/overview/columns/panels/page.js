import { Page, div, p, md } from "/app.js";

/* Container: the app's page region. Size: `solo` — the page takes the region's full
   height and nothing scrolls but the panels. Own layout: `flex v`, two panels sharing
   the height. Regions: TWO, named in `regions` — the seam `container()` already reads.
   Preview: the default card.

   NO NEW CSS. A panel is `.pages` — the region class, which is already
   `flex: 1 1 auto; min-height: 0; overflow-y: scroll`, i.e. exactly "take your share
   of the height and scroll your own content". The verdict and what it cost to find
   out: doc/panels.md. */

const filler = (label, n) => { for (let i = 1; i <= n; i++) p(label + " line " + i); };

export default new Page({
	meta: import.meta,
	title: "Panels",
	description: "The viewport height split into two independent scrolling regions.",
	icon: "splitscreen",

	classes: "solo flex v gap",

	// The one place a panel is named. `container()` (Page.class.js) asks the PARENT
	// for `regions.get(child.name)` before it asks anything else, so a child mounts
	// in its panel by being called `brief` or `detail` and nothing else.
	initialize(){ this.regions = new Map(); },

	content(){
		md("Two regions, one page. Scroll either — the other stays where it is. The three words that do it, the measurements and the one thing the Router will not do for you: [`doc/panels.md`](/framework/core/Page/doc/panels/).");

		// ⚠ A BLOCK BODY, not `$panel => this.regions.set(…)`: a captured callback's
		// return value is appended, and an arrow returning the Map painted a literal
		// `[object Map]` between the panels. Nothing threw.
		div.c("pages surface", $panel => { this.regions.set("brief", $panel); });
		div.c("pages surface", $panel => { this.regions.set("detail", $panel); });
	},

	// ⚠ The Router activates ONE chain, so it will never light both panels for you.
	// A page that wants both filled activates them itself, and each is marked
	// `default` so the arrangement contract shows it. doc/panels.md.
	activated(){ this.children.forEach(page => page.activate()); },

	children: {
		Brief: {
			classes: "standard default",
			content(){
				md("**Top panel.** An ordinary page, mounted by name into `regions.get(\"brief\")`.");
				filler("Brief", 30);
			},
		},

		Detail: {
			classes: "standard default",
			content(){
				md("**Bottom panel.** Its own scrollport — `.pages` is `min-height: 0`, which is the whole trick.");
				filler("Detail", 30);
			},
		},
	},
});
