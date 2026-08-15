import { Page, md, p } from "/app.js";
import mvp from "./mvp/page.js";
import anatomy from "./anatomy/page.js";

export default new Page({
	meta: import.meta,
	title: "ColumnPager",
	description: "The drill-down layout — you're looking at it.",
	children: [mvp, anatomy],
	content(){

		md("> **This class is history.** `Pager`, `TabPager` and `ColumnPager` left core, and the framework tree no longer ships them — an arrangement is a CSS class a page opts into, see [Page](/framework/core/Page/). Nothing here runs; the code below is a record of how the drill-down worked.");

		md("A `ColumnPager` is a `Pager` that renders a page and its ancestors as a drill-down: a sidebar (the topic + its children), breadcrumbs, and the last two of the chain as side-by-side columns. This whole michael site *was* one, until arrangements became CSS classes.");
		p("It's `ColumnPager extends Pager`: the same swap container, with a `render()` that lays out the chain. Tabs or a dashboard grid would be sibling structures built the same way.");
		this.previews();
	}
});
