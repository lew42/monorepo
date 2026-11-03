import { Page, div, p, md } from "/app.js";

/* Container: the app's page region. Size: `solo` — this page IS the region's height,
   and nothing scrolls but the two panels. Own layout: `flex v`, a short intro and two
   panels sharing what is left. Regions: TWO, named in `regions` — the seam core's
   `container()` reads before anything else. Preview: the default card.

   NO NEW CSS. A panel is `.pages` — the region class, already `flex: 1 1 auto;
   min-height: 0; overflow-y: scroll` (core/Page/doc/panels.md). The top panel holds a
   whole columns tree; the bottom one is chrome that reacts to it.

   ⚠ A captured callback's RETURN VALUE is appended — `$p => this.regions.set(…)`
     returns the Map and paints a literal `[object Map]` between the panels. Block
     body, always. */

// One file in the browser. Every node logs itself to the topic when it activates —
// which is the only line in the tree that knows the console exists, and it does not:
// it knows `this.topic()`.
const node = (extra = {}) => ({ activated(){ this.topic().log(this.title); }, ...extra });

export default new Page({
	meta: import.meta,
	title: "Split",
	description: "The viewport height in two — a columns tree above, a console below that reacts to it through one shared ref.",
	icon: "horizontal_split",

	classes: "solo flex v gap",

	// The topic BOTH panels find. The tree above and the console below are in one
	// page tree, so both get the same page back from `this.topic()`.
	is: "topic",

	lines: null,

	initialize(){
		this.regions = new Map();
		this.lines = [];
	},

	log(what){
		this.lines.push(what);
		this.watchers?.forEach(fn => fn());
	},

	watch(fn){ (this.watchers ??= []).push(fn); fn(); },

	content(){
		md("Two panels, one page. **Walk the tree above** — every page you open writes a line below, through `this.topic()`. Neither panel imports the other.");

		// A plain `pages` region now: Page.css's `.default.columns` split (2026-08-29)
		// gives a columns host its own row instead of the 40em-cap/3em-pad presentation
		// rule, so the top panel no longer needs a bespoke class to dodge that bug.
		div.c("pages page-uses-stage surface", $panel => { this.regions.set("browse", $panel); });
		div.c("pages surface page-uses-console", $panel => { this.regions.set("console", $panel); });
	},

	// The Router lights ONE chain, and here it is `browse`. The console is never
	// routed to, so nothing would ever activate it — this line does, and `default`
	// is what lets the arrangement contract show it. doc/panels.md.
	activated(){ this.children.forEach(page => page.activate()); },

	children: {
		Browse: {
			// No width word: the default track, so this column has room for the prose
			// that would otherwise crowd the console out of its own panel.
			initialize(){ this.columns(); },

			content(){
				md("A columns tree **in a panel**. The row is the panel's width, so it pages one column at a time on the panel's terms, not the window's.");

				md("**The honest limit:** the Router lights ONE chain, so it will never activate both panels for you. One panel takes the route and the other is chrome — that is this page, and it is option 1 in [`doc/panels.md`](/framework/core/Page/doc/panels/). Two routed panels would need two urls, and a page has one.");

				md("**Verdict on the mix:** `solo flex v gap` + two regions + `is: \"topic\"`. Three existing words for the split, one existing word for the conversation, no new core API — which is exactly why `panels()` was rejected beside `columns()`.");
			},

			// The one mark a non-routed page needs: without it, landing on /split/
			// leaves the top panel blank and nothing throws — the arrangement
			// contract hides an unmarked page. `render_column()` reads `classes`
			// since 2026-08-27 (it once didn't, and this line was an `activated()`).
			classes: "default",

			children: {
				src: node({
					width: "small",
					children: {
						"app.js": node({ content(){ md("Boots the app, fixes the layer order, hands the nav in. 140 lines."); } }),
						"Page.class.js": node({ content(){ md("The page tree, the roles, the columns. 432 lines and every method a seam."); } }),
						"View.js": node({ content(){ md("The captor, the element factories, the stylesheet loader."); } }),
					},
				}),

				styles: node({
					width: "small",
					children: {
						"framework.css": node({ content(){ md("The layer statement goes first in `<head>`; everything after it obeys that order."); } }),
						"Page.css": node({ content(){ md("The arrangement contract, the page grid, the column row."); } }),
					},
				}),

				docs: node({
					width: "small",
					children: {
						"columns.md": node({ content(){ md("The row, the four width words, and what has bitten."); } }),
						"roles.md": node({ content(){ md("`is:` and `nearest()` — the ref this whole page runs on."); } }),
						"panels.md": node({ content(){ md("Splitting the height, and the honest limit below."); } }),
					},
				}),
			},
		},

		Console: {
			// ⚠ `title: ""` and a `label` instead: the panel already IS the console, and
			// an `h1` would spend a third of its height saying so. `naming()` only fills
			// a NULLISH title, so the empty string survives and `render()` draws no head.
			title: "",
			label: "Console",
			classes: "standard default pad",

			content(){
				md("**Console** — chrome, not a place. It is `default`, so its url is never in the address bar, and every line below was written by a page in the panel above through `this.topic()`.");

				div.c("page-uses-log flow", $log => this.topic().watch(() => $log.empty(() => {
					const topic = this.topic();

					p(topic.lines.length + " activations");
					topic.lines.slice(-8).forEach(line => p.c("page-uses-line", "> " + line));
				})));
			},
		},
	},
});
