import { Page, md, demo } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Move the tree",
	description: "Option A — relocate chain/host/crumb to the tier that uses them. Cheap, reversible.",

	content(){

		md("**The smallest change that closes most of the gap.** Not a deletion — a move.");

		md("Every tree member is consumed *only* by the layout tier. Yet they live on `Page`, whose own docblock claims it \"does NOT know about layout\". Right now that's false: `host()` is layout knowledge sitting in `Page`.");

		md("### Option A — statics on `Pager`");

		demo(() => {
			// Pager.js
			//   static chain(page){ … }        // was: page.chain
			//   static host(page){ … }         // was: page.host()
			//   static async load_ancestors(page){ … }
			//
			// Page.class.js keeps: url, link, preview, previews, content, render,
			//                      activate, children/parent, registry
		}, "`Page` drops to roughly **120 lines** — Arya's shape plus previews and the registry. The capability is identical; only the address changes.");

		md(`| | for | against |
|---|---|---|
| **A. move to Pager** | dependency arrow finally matches the docs; \`Page\` readable in one screen | \`Pager.chain(page)\` reads worse than \`page.chain\` |
| **B. leave it** | call sites stay pretty | \`Page\` keeps growing toward the layout tier |
| **C. delete + inline into ColumnPager** | smallest total code | gives up on a second layout ever existing |`);

		md("### My call: A, but not yet");

		md("Do it **after** deciding the [top-down question](./top-down) — because top-down loading deletes `load_ancestors()` and `parent_url` outright rather than moving them, and it may take `host()` with them. Moving code you're about to delete is wasted motion.");

		md("If top-down is rejected, do A immediately: it's mechanical, ~30 minutes, and fully reversible.");

		md("### What C would cost");

		md("`TabPager` already uses `root?.children` and `leaf()`. Inlining the tree into `ColumnPager` means `TabPager` either duplicates it or loses mounted mode. Two structures ship today, so **C is already off the table** — recorded so it isn't re-proposed.");
	}
});
