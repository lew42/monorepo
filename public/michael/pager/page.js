import { Page, md, p } from "/app.js";
import mvp from "./mvp/page.js";
import tabs from "./tabs/page.js";

export default new Page({
	meta: import.meta,
	title: "Pager",
	description: "A div.pager that shows one page and swaps it.",
	children: [mvp, tabs],
	content(){

		md("> **This class is history.** `Pager`, `TabPager` and `ColumnPager` left core, and the framework tree no longer ships them — an arrangement is a CSS class a page opts into, see [Page](/framework/core/Page/). The demos below still run: `Pager` is vendored beside them, in `michael/pager/legacy/`.");

		p("A `Pager` is a `div.pager` that holds one `.active` page and swaps it on command. No history, no URLs, no activation — just the DOM swap. That makes it useful on its own (tabs, wizards, in-app view switching) and the base for richer layouts like `ColumnPager`.");
		p("The App itself doesn't use a Pager — it renders pages straight into `$app`. A Pager is optional: reach for one when you want your own swap container, or extend it (like `ColumnPager`) for a richer layout.");
		this.previews();
	}
});
