import { Page, Sidebar, md, demo, code, h2, div, span } from "/app.js";
import sample from "/framework/ext/demo/sample.js";

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Every navigation shape, running — and the one call behind each.",
	icon: "explore",

	content(){

		demo(() => {
			demo.app(sample({
				content(){ this.previews().style({ "--column": "8em", "--gap": "0.5em" }); },
			})).style("height", "21em");
		}, "`content(){ this.previews() }` — the whole index. **Click a card.** Each was drawn by the child it points at, and the wall counted its own columns; the two tokens only set how big a cell wants to be.");

		md("That box is a real page tree navigating inside a `div` — the same `Page` class, the same `previews()`, fictional urls. **Every shape below is a different `content()` on that same nine-page site.** Nothing else changes.");

		h2("A rail that stays put");

		demo(() => {
			demo.app(sample({ initialize(){ this.catalog(); } })).style("height", "26em");
		}, "`this.catalog()` — the same cards as a column, beside a region this page holds. Click one: **only the region swapped.** Master–detail in one call, because a child mounts in the nearest ancestor's `$pages` and this page declared one.");

		h2("A sidebar, for a section you live in");

		demo(() => {
			const site = sample({
				content(){
					div.c("flex", () => {
						new Sidebar({
							brand: this.title,
							pages: [...this.children.keys()].map(name => this.nav_for(name)),
						}).style({ width: "15em", "--sidebar-bg": "var(--surface)" });
						this.$pages = div.c("pages");
					});
				},
			});

			demo.app(site.children.get("css")).style("height", "26em");
		}, "`nav_for(name)` returns `{url, label, icon}`, which is exactly what a `Sidebar` entry is — so the sidebar, the tab bar and the cards read **one** source and cannot name a child three ways. An entry with its own `pages` is a titled group. **Click one** — only the region beside it swaps.");

		md("It is a `View`, not a layout tier: **any page can render one**, and the page that does decides where it goes. `/framework/` puts it in a flex row beside its own `$pages` — that is the whole of the two-column docs shape.");

		h2("Crumbs, from the chain");

		demo(() => {
			const crumbs = function(){
				div.c("flex gap wrap v-center", () => this.chain().forEach((page, i) => {
					if (i) span("/").style("color", "var(--subtle)");
					page.link();
				}));
			};

			demo.app(new Page({
				title: "Web", content: crumbs,
				children: { CSS: { content: crumbs, children: { Layout: { content: crumbs } } } },
			}).children.get("css").children.get("layout"));
		}, "`chain()` is `[root … me]`, so a breadcrumb is a `forEach` over links the tree already knew. No component and no stylesheet: `page.link()` emits `.page-link`, which the Router marks.");

		h2("Tabs, for a fixed set");

		code.js(`content(){ this.tabs("children nav shell"); }

this.tabs("children nav shell").ac("vertical")   // the same set, as a left rail`);

		md("**The bar across the top of this page is that call**, and the rail down [API](/framework/core/Page/api/) is the vertical one. Which children are tabs is decided at *placement*, not marked on the child — so a page can hold several sets, and a child in none of them still renders wherever it would have anyway.");

		md("**A tab bar has no overflow handling at all** — fine at six, unusable at twenty, and it will never warn you. A fixed set you flip between is a bar; an open-ended list is an index.");

		h2("Which one to reach for");

		md(`| | shows | reach for it when |
|---|---|---|
| **Previews** | this page's children, as cards | an index — the children *are* the content |
| **Catalog** | the same cards, as a standing rail | the reader will open several in a row |
| **Sidebar** | a whole section, two levels | the reader will stay a while |
| **Tabs** | a fixed sibling set | you flip between them rather than drill down |
| **Crumbs** | the chain above you | the tree is deep and the sidebar is gone |
| **A link in prose** | exactly one next step | always — every page should end with one |`);

		md("Every one of them is **an anchor with a real `href`**, marked by [Router](/framework/core/Router/) rather than by the component: `.active` on an exact match, `.in-path` on an ancestor, rewritten on every navigation including Back. **No navigation component holds state**, so none of them can disagree about where you are.");

		md("More arrangements, live: the [Overview](/framework/core/Page/old/overview/) rail — a dashboard of unequal cards, a scrolling strip, and three whole sites assembled from these same pieces.");

		md("Next: [Children](/framework/core/Page/old/children/) — how the tree behind all of this is defined.");
	}
});
