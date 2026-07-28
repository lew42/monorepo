import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Tree",
	description: "children + adoption.",
	content(){
		p("A parent declares its children by importing them. The constructor *adopts* them — setting `child.parent = this` — so every page can walk up to its root.");

		pre(`import a from "./a/page.js";
import b from "./b/page.js";

export default new Page({
    meta: import.meta,
    title: "Topic",
    children: [a, b]
});`);

		p("Imports flow DOWN (a parent imports its children); the `.parent` links point UP, wired by adoption. No child ever imports its parent, so there is no import cycle — the reliable way to build the tree.");

		p("This gives synchronous tree-walking, no `await`:");

		pre(`page.chain    // [root … page]
page.root     // the topmost ancestor
page.host()   // nearest ancestor that owns a pager (the topic)`);

		p("The `chain` is exactly what a ColumnPager renders as breadcrumbs + columns. The full analysis of why this beats mutual imports and dynamic-import climbing lives in the Loading section.");
	}
});
