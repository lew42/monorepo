import { Page, md, demo } from "/app.js";

import audit from "./audit.page.js";
import tree from "./tree.page.js";
import topdown from "./top-down.page.js";
import registry from "./registry.page.js";

export default new Page({
	meta: import.meta,
	title: "Simplifying Page",
	description: "What Page carries, what it's for, and what to cut — with the three open questions.",
	col: "narrow",
	children: [audit, tree, topdown, registry],

	content(){

		md("`Page` is **209 lines**. Arya's is **54**. Alex's is **115** and isn't even a tree. The gap is real and most of it has one cause.");

		md("### The short version");

		md(`| | lines | has a tree | has a layout tier |
|---|---|---|---|
| **arya** \`lib/Page.js\` | 54 | no | no (the Router *is* the layout) |
| **alex** \`Page.js\` | 115 | no | no |
| **core** \`Page.class.js\` | 209 | yes | yes |`);

		md("Every member that isn't in Arya's 54 lines is there to serve **one** of two things: the drill-down layout, or the Router's safety gate. Nothing is there by accident — but nothing is free either.");

		md("### Already done");

		md(`Four members had **zero** consumers and are gone: \`root\`, the \`url\` setter,
\`Router.routes\`, and \`theme\`/\`deactivate()\`. Two more collapsed:

- \`pager:\` → \`Pager:\` — a class, so it's capitalized, and **\`Page\` no longer instantiates it**. \`App.load_page\` does.
- \`body()\` is gone. Because \`render()\` no longer dispatches to a layout, it has exactly one meaning, and the second render path deleted itself.`);

		demo(() => {
			// Before: two methods, and you had to know which one a container called
			//   render(){ return this.pager ? new this.pager({...}) : this.body(); }
			//   body(){ return div.c("page", ...); }
			//
			// After: one.
			//   render(){ return div.c("page", ...); }
		}, "The whole `render()` / `body()` split existed so a topic shown *as a column* wouldn't recurse into its own ColumnPager. Move the instantiation to App and the problem doesn't exist.");

		md("### Still open");

		md("Three questions, one page each. They're ordered by how much they'd change:");

		this.previews();

		md("Reading order: **[the audit](./audit)** (what's left, and who uses it) → **[move the tree](./tree)** (where it should live) → **[top-down loading](./top-down)** (the idea that dissolves most of it). **[The registry gate](./registry)** is independent and has the biggest user-visible payoff.");
	}
});
