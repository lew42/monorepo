import { Page, p, a, ul, li, div, button } from "/app.js";
import { section } from "../../ui.js";
import { probe, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Open #6 — a nav that is derived AND lazy",

	content(){
		p("The readme says building a nav from `app.root`'s children would import every one of them to read their titles. That is true of titles. It is not true of a nav — because `children` is a Map whose *keys* are known without importing anything, which is exactly what `previews()` already relies on.");

		// Built from the children Map, live, at render time. The whole tree below
		// is a walk over what is already in memory — no child() call, no await,
		// no import. Rebuild it after navigating and it will have grown.
		this.$derived_nav = div.c("derived-nav", () => { this.branch(app.root); });

		probe("what did drawing that cost", (log) => {
			const here = app.router.active;
			const before = performance.getEntriesByType("resource").filter(e => e.name.endsWith("page.js")).length;

			here.$derived_nav.empty(() => { here.branch(app.root); });

			log("page modules before the redraw:", before);
			log("page modules after  the redraw:",
				performance.getEntriesByType("resource").filter(e => e.name.endsWith("page.js")).length);
			log("");
			log("Zero. A name is a string; only a title needs a module.");
		});

		p("A loaded child shows its `title`; an unvisited one shows its declared `name`, in the declared position, linking to the url the name must have. Identical to `previews()`, and identical to what `tabs()` decided for its labels.").ac("note");

		section("The honest limit");

		p("It is progressive, not complete. A lazy subtree has no keys until its parent module is imported, so this nav can only ever show one level past whatever you have already visited. Walk into `/deep/nesting/a/b/` and come back — the tree below will have grown three levels. That is not a bug to fix; it is what laziness *is*, and a sitemap is the thing you cannot have for free.");

		div.c("row", () => {
			button.c("page-link", "redraw").click(() => this.$derived_nav.empty(() => { this.branch(app.root); }));
			a.c("page-link", "go make it grow →").href("/deep/nesting/a/b/c/");
		});

		section("What is actually missing");

		p("Not derivation — that works today, at zero cost. What is missing is when to redraw. `Router.mark()` is the one place that knows a navigation finished, and it tells nobody: it writes two classes, re-runs the link pass, and returns. So this nav goes stale the moment you use it, and the redraw button above exists only because there is no hook.");

		probe("the same one-line seam /deep/chrome/ asked for", (log) => {
			log("at the end of Router.mark():");
			log("");
			log("    this.app.navigated?.(this.active);");
			log("");
			log("site/app.js then owns its own chrome, once:");
			log("");
			log("    navigated(){ this.$nav.empty(() => { this.branch(this.root); }); }");
			log("");
			log("Duck-typed like host?.() and activate?.() already are. It does not");
			log("teach Router what a nav is, and it is the same seam the inert");
			log("policy needs — two open items, one line.");
		});

		whole(import.meta);
	},

	/* One level of the tree, from what is in memory. Recursive, synchronous, and
	 * it never calls child() — the whole point is that it cannot import. */
	branch(page){
		return ul(() => page.children.forEach((child, name) => li(() => {
			// .nav-link is the site's own sidebar class, borrowed — so this tree
			// picks up .active and .in-path from mark_links() with no code at all
			a.c("nav-link", child ? child.title : name).href(page.url + name + "/");
			if (child?.children.size) this.branch(child);
		})));
	}
});
