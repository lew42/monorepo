import { Page, p } from "/app.js";
import mvp from "./mvp/page.js";
import anatomy from "./anatomy/page.js";

export default new Page({
	meta: import.meta,
	title: "ColumnPager",
	description: "The drill-down layout — you're looking at it.",
	children: [mvp, anatomy],
	content(){
		p("A `ColumnPager` is a `Pager` that renders a page and its ancestors as a drill-down: a sidebar (the topic + its children), breadcrumbs, and the last two of the chain as side-by-side columns. **You are inside one right now** — this whole michael site is a ColumnPager.");
		p("It's `ColumnPager extends Pager`: the same swap container, with a `render()` that lays out the chain. Tabs or a dashboard grid would be sibling structures built the same way.");
		this.previews();
	}
});
