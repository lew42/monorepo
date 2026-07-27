import { Page, p } from "/app.js";
import mvp from "./mvp/page.js";
import tabs from "./tabs/page.js";

export default new Page({
	meta: import.meta,
	title: "Pager",
	description: "A div.pager that shows one page and swaps it.",
	children: [mvp, tabs],
	content(){
		p("A `Pager` is a `div.pager` that holds one `.active` page and swaps it on command. No history, no URLs, no activation — just the DOM swap. That makes it useful on its own (tabs, wizards, in-app view switching) and the base for richer layouts like `ColumnPager`.");
		p("The App creates one Pager as its main content area — every page is swapped in and out of `app.pager`.");
		this.previews();
	}
});
