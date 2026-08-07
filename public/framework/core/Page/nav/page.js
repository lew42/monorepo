import { Page, Sidebar, md, demo, code, h2, div, p, span, a, icon, toc } from "/app.js";

const pages = [
	{ title: "Start", url: "#", icon: "flag" },
	{ title: "Core", url: "#", icon: "grid_view", pages: [
		{ title: "View", url: "#" }, { title: "Page", url: "#" }, { title: "Router", url: "#" },
	] },
	{ title: "Styles", url: "#", icon: "palette" },
];

const crumbs = () => div.c("flex wrap v-center h4", () => {
	["Framework", "Core", "Page"].forEach((t, i) => {
		if (i) span("/").style({ color: "var(--subtle)", margin: "0 0.5em" });
		a.c("page-link", t).href("#").style({ textDecoration: "none" });
	});
});

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Six ways a page shows its neighbours, and which one to reach for.",
	icon: "explore",

	content(){

		toc();

		md("Every one of these is **an anchor with a real `href`**, marked by [Router](/framework/core/Router/) rather than by the component. `mark_links()` writes `.active` on an exact match and `.in-path` on an ancestor, on every navigation including Back — so no navigation component holds state, and none of them can disagree about where you are.");

		h2("The six");

		md(`| | shows | reach for it when |
|---|---|---|
| **Sidebar** | a whole section, two levels | the reader will stay a while |
| **Previews** | this page's children, as cards | an index, and the children are the content |
| **Tabs** | a fixed sibling set | you flip between them rather than drill down |
| **Crumbs** | the chain above you | the tree is deep and the sidebar is gone |
| **ToC** | this page's own headings | one page is long enough to get lost in |
| **A link in prose** | exactly one next step | always — every page should end with one |`);

		h2("Sidebar — for a section you live in");

		demo(() => {
			new Sidebar({ brand: "Docs", pages }).style({ width: "15em", "--sidebar-bg": "var(--surface)" });
		}, "An entry with its own `pages` is a titled **group**. Entries are `{title, url, icon}` — which is exactly what `Page.nav_for(name)` returns, so a parent hands its nav straight in and the sidebar, the tab bar and the cards cannot name a child three ways.");

		md("It is a `View` subclass, not a layout tier — **any page can render one**, and the page that does decides where it goes. `/framework/` puts it in a flex row; the home page does the same thing with a different list.");

		h2("Previews — for an index");

		md("`this.previews()` draws a card per child, and it works *before* those children exist: it can only use the name and the url that name must have. Add `load_all_children()` and the cards draw with real titles and icons — the Router waits for the imports before rendering, so there is no redraw and no name-then-title flicker.");

		md("Cards can claim a share of the grid, which is how an index becomes a dashboard with no second component:");

		code.js(`.page-preview.wide   // grid-column: span 2
.page-preview.tall   // grid-row: span 2
.page-preview.big    // both`);

		md("[See the arrangements](/framework/core/Page/layouts/dashboard/).");

		h2("Tabs — for a fixed set");

		code.js(`content(){ this.tabs("guide api"); }
this.tabs("guide api").ac("vertical")   // the same set, as a left rail`);

		md("Which children are tabs is decided **at placement**, not marked on the child — so a page can have several sets, and a child in none of them renders wherever it would have anyway. The first tab's link is *this page's* url, so `/tabs/` is the default tab rather than a second url showing the same thing.");

		md("**A tab bar has no overflow handling at all** — fine at six, unusable at twenty, and it will never warn you. The test: a fixed set, none of them with children of their own, that you flip between rather than drill into. An open-ended list is an index, not a bar.");

		h2("Crumbs — for depth");

		demo(crumbs, "No component and no CSS: `flex wrap v-center h4` plus `.page-link`, which Router already marks. `page.chain()` gives you `[root … me]` if you want to build it from the tree instead of by hand.");

		h2("ToC — for length");

		md("`toc()` finds this page's own `h2`/`h3` itself. Nothing is declared and nothing is registered, so **adding a section adds it to the rail**. It skips headings that are not sections of the page — a demo's `h1`, a file tree's labels, a readme inside `md.details`.");

		md("It becomes a real second column above `82em` and disappears below it. Rail on the right of this very page, if your window is wide enough.");

		h2("And one link at the end");

		md("The cheapest navigation there is, and the most used: **every page names the next one.** A section is a path, not a fan-out — if a reader finishes a page and has to go back to an index to continue, the page did not finish.");

		md("Next: [Children](/framework/core/Page/children/) — how a page knows what is under it in the first place.");
	}
});
