import { Page, p, a, div } from "/app.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, tree_census, module_waterfall } from "/perf/ui.js";

// The routes this site actually has. Hand-listed on purpose: nothing crawls the
// filesystem at runtime, which is the same reason the sidebar is hand-typed.
const ROUTES = [
	"/replace/child/", "/columns/child/grandchild/", "/tabs/api/", "/tabs/guide/",
	"/full/left/deeper/", "/full/right/", "/nav/children/lazy/", "/nav/inline/",
	"/nav/link/", "/nav/replace/", "/nav/route/", "/perf/walk/a/b/c/d/e/",
];

export default new Page({
	meta: import.meta,
	title: "Laziness, verified",

	content(){
		code(source(Page.prototype.child), "Page.child() — read off the live prototype");

		p("A name becomes a network request exactly once, on the first walk that needs it. Everything below is that claim, checked against this browser.").ac("note");

		section("What this document has actually paid for");

		measured(async () => {
			await this.app.ready;
			const { pages, names, views, nodes } = tree_census(this.app.root);
			return [
				["Page objects in memory", pages],
				["declared names still unimported", names],
				["views built (never thrown away)", views],
				["DOM nodes those views hold", nodes],
				["page.js requests this document made", performance.getEntriesByType("resource")
					.filter(entry => /page\.js(\?|$)/.test(entry.name)).length],
			];
		}, "the live tree — Page objects vs names still waiting");

		p("Navigate around and come back: the first two numbers trade against each other and never reset. That is laziness, and it is one Map.").ac("note");

		section("This document's page modules");

		measured(module_waterfall);

		section("Watch laziness die");

		gated(async () => {
			const before = tree_census(this.app.root);
			const t0 = performance.now();

			// Resolve every route WITHOUT navigating — the same walk load_segments()
			// does, minus activate(). This is what an eager tree would have cost at
			// boot, and after this button the rest of the page proves it.
			for (const url of ROUTES){
				let page = this.app.root;
				for (const name of url.split("/").filter(Boolean)) page = await page.child(name) ?? page;
			}

			const ms = performance.now() - t0;
			const after = tree_census(this.app.root);

			return {
				head: ["", "before", "after"],
				rows: [
					["Page objects", before.pages, after.pages],
					["names still unimported", before.names, after.names],
					["views built", before.views, after.views],
					["page.js requests", "", performance.getEntriesByType("resource")
						.filter(entry => /page\.js(\?|$)/.test(entry.name)).length],
					["ms to import all of it", "", ms],
				],
			};
		}, "resolve every route in the site, serially, the way the Router would");

		p("Gated, and one-way: it imports the whole site into this document. That is precisely the cost `children: \"a b c\"` avoids, and pressing the button is the only honest way to show a number that is otherwise never paid.").ac("note");

		div.c("row", () => {
			a.c("page-link", "the memoized view →").href("/perf/memo/");
			a.c("page-link", "first paint →").href("/perf/paint/");
		});
	},
});
