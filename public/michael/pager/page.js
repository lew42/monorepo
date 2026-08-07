import { Page, md, p } from "/app.js";
import mvp from "./mvp/page.js";
import tabs from "./tabs/page.js";

export default new Page({
	meta: import.meta,
	title: "Pager",
	description: "A div.pager that shows one page and swaps it.",
	children: [mvp, tabs],
	content(){

		md("> **This class has left core.** `Pager`, `TabPager` and `ColumnPager` now live in `framework/core/legacy/` and `/app.js` no longer exports them. An arrangement is a CSS class a page opts into — see [Page](/framework/core/Page/). The examples below still run, against the legacy class, imported directly.");

		p("A `Pager` is a `div.pager` that holds one `.active` page and swaps it on command. No history, no URLs, no activation — just the DOM swap. That makes it useful on its own (tabs, wizards, in-app view switching) and the base for richer layouts like `ColumnPager`.");
		p("The App itself doesn't use a Pager — it renders pages straight into `$app`. A Pager is optional: reach for one when you want your own swap container, or extend it (like `ColumnPager`) for a richer layout.");
		this.previews();
	}
});
