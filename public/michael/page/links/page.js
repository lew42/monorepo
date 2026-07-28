import { Page, p, pre, div, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Links",
	description: "link / crumb / preview.",
	content(){
		p("A Page renders links to itself in three styles — all plain `<a>` anchors, so an opt-in Router upgrades the clicks to no-reload navigation with zero per-link wiring.");

		pre(`page.link()        // <a class="page-link">Title</a>
page.crumb()       // breadcrumb style
page.preview()     // a title + description card
parent.previews()  // all children as preview cards`);

		h3("Live — this page linking to its siblings");
		p("Each anchor below is `sibling.link()`, generated from the tree. No URL is hard-coded; every page derives its own from `import.meta`.");

		div.c("card flex gap wrap", () => {
			(this.parent?.children || []).forEach(sib => sib.link());
		});

		p("Because they're the tree's own pages, clicking one opens it in the column to the right — the same links drive the whole drill-down.");
	}
});
