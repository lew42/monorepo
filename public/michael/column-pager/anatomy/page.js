import { Page, md, p, pre, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Anatomy",
	description: "sidebar / breadcrumbs / columns.",
	content(){

		md("> **This class is history.** `Pager`, `TabPager` and `ColumnPager` left core, and the framework tree no longer ships them — an arrangement is a CSS class a page opts into, see [Page](/framework/core/Page/). Nothing here runs; the code below is a record of how the drill-down worked.");

		p("Every part was the ColumnPager reading the tree:");

		h3("Sidebar");
		p("The topic (the `brand`) plus its `children`, fully data-driven. Add a child to the topic and it appears here automatically. Below 45em it collapses into the ☰ burger overlay.");

		h3("Breadcrumbs");
		p("The full `chain` from root to the current page — for climbing out when you've gone deeper than the two visible columns.");

		h3("Columns");
		p("The last two of the chain. The left column is the parent, acting as navigation; the right is the focused page. Each is filled with plain `page.render()` — a Page never mounts its own layout (the App does), so a topic cannot recurse into itself. The ✕ closes a column and climbs to its parent.");

		h3("Identical on reload");
		p("Clicking a link and hard-reloading a URL run the same `chain` logic, so `/a/b/` looks the same either way — no per-page layout knowledge, no hash router.");

		pre(`render(){
    const leaf  = this.leaf();      // Page.registry.get(location.pathname)
    const chain = leaf.chain;       // [root … leaf]
    this.sidebar(chain[0]);         // topic + children
    // breadcrumbs = chain
    // columns     = chain.slice(-2)   (fill with pg.render())
}`);
	}
});
