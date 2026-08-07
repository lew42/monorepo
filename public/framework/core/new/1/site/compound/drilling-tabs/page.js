import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

/* Every page on this screen is inline. There is one file in this directory and
 * it is this one — /compound/drilling-tabs/api/specs/ is four url segments with
 * nothing at all behind them. */
export default new Page({
	meta: import.meta,
	title: "Drilling tabs",

	initialize(){
		// A tab that claims a region keeps its own children inside its own panel.
		// That one line is the whole difference from `tabs-in-a-column`, where the
		// tab claimed nothing and its child escaped to the outer column grid.
		const overview = this.add("overview", {
			title: "Overview",
			content(){
				p("I am a tab AND a section. `this.$pages = div.c(\"pages\")` claims my subtree, so my children mount inside me, inside the panel — the tab bar above never moves.");
				a.c("page-link", "notes →").href(this.url + "notes/");
				this.$pages = div.c("pages");
			}
		});

		overview.add("notes", () => {
			p("Two navigations, one screen: the bar still says Overview, and I am inside its panel. The url `/compound/drilling-tabs/overview/notes/` is the entire state.");
			a.c("page-link", "← back").href("/compound/drilling-tabs/overview/");
		});

		const api = this.add("api", {
			title: "API",
			content(){
				p("The same, from a tab that is NOT the first. This is the case that needs the three `.tabs-drill` rules — without them the bar highlights Overview and Overview's panel renders beside me.");
				div.c("row", () => {
					a.c("page-link", "detail →").href(this.url + "detail/");
					a.c("page-link", "specs →").href(this.url + "specs/");
				});
				this.$pages = div.c("pages");
			}
		});

		api.add("detail", () => {
			p("Inside API's region, inside API's panel, two levels below the tab bar — and the bar still highlights `api`. It reads `api` rather than `API` because only the FIRST tab is loaded when the bar is built, so every other label is its declared name, deterministically.");
			a.c("page-link", "← back").href("/compound/drilling-tabs/api/");
		});

		api.add("specs", () => {
			p("A sibling of `detail`, and it replaces it — API claimed one region, so its children take turns in it. Drilling and replacing are the same mechanism at different depths.");
			a.c("page-link", "← back").href("/compound/drilling-tabs/api/");
		});

		// A tab that drills nowhere, in the same bar. Nothing marks a page as
		// "drillable"; it either claimed a region or it didn't.
		this.add("guide", {
			title: "Guide",
			content(){ p("An ordinary tab with no children and no region. It sits in the same bar as two that drill, and neither of them had to know."); }
		});
	},

	content(){
		when("a tab is really a small section — Settings › Billing › Invoices — and you want the tab bar to stay put while you move inside it.");

		// `tabs-drill` is opt-in, exactly like `cols` and `full`: a class this file
		// chose, interpreted by CSS, understood by nothing in the framework.
		this.$tabs = this.tabs("overview api guide").ac("tabs-drill");

		section("The file");

		this_file(import.meta);

		cost("three CSS corrections, written out in `compound/compound.css` and all three arguably bugs in `site/styles.css`: the bar's first-tab fallback lights the wrong tab, the default panel renders beside the drilled one, and the panel unpads its direct child only.");
	}
});
