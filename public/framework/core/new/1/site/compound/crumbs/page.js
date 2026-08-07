import { Page, p, div, span, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

/* A page's chain never changes, so its trail is correct the moment it is built
 * and correct forever after. That is why this needs no update, no subscription
 * and no help from the Router: it is not live state, it is a fact about where
 * the page sits in the tree.
 */
function trail(page){
	return div.c("row crumbs", () => page.chain().forEach((step, i) => {
		if (i) span("›");
		step.link();
	}));
}

export default new Page({
	meta: import.meta,
	title: "Crumbs",

	initialize(){
		const alpha = this.add("alpha", {
			title: "Alpha",
			content(){
				trail(this);
				p("My trail has five links and I wrote none of them. `chain()` walks `.parent` to the root; `link()` is a plain `<a href>` every page already has.");
				a.c("page-link", "Beta →").href(this.url + "beta/");
			}
		});

		alpha.add("beta", {
			title: "Beta",
			content(){
				trail(this);
				p("Column 3, and one link longer. `Router.mark_links()` gives the last crumb `.active` and every other crumb `.in-path`, so the trail lights itself — no crumb compares `window.location`.");
			}
		});
	},

	content(){
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {

				trail(this);

				when("a tree is deep enough that `where am I` is a real question — which is every drill-down, every columns layout, and every `route()` tree.");

				a.c("page-link", "Alpha →").href(this.url + "alpha/");

				section("The whole trail");

				p("`chain()` returns `[root … me]`. That is the entire navigation layer: six lines, no state, no framework support, and it composes with anything because it reads the tree rather than the screen.").ac("note");

				section("The file");

				this_file(import.meta);

				cost("nothing, and that is the point worth stating — a trail is derived, so it can never disagree with where you are. Its one real limit is that it shows the tree, not your history: arriving at Beta from a search result gives the same trail as walking there.");
			});
		});
	}
});
