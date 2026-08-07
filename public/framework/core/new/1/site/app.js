import { App } from "/framework/core/new/1/App.js";
import { View, div, a } from "/framework/core/View/View.js";
import Socket from "/framework/dev/Socket/Socket.js";

export * from "/framework/core/View/View.js";
export { Page } from "/framework/core/new/1/Page.class.js";

// The site's chrome, built ONCE outside $pages so navigation can never touch it.
// This is where ColumnPager's sidebar went: it was never layout.
export default window.app = new App({

	socket: Socket.singleton(),

	//  [url, text]  — hand-typed on purpose. A nav built from app.root's children
	//  would have to import every one of them to read their titles, which is the
	//  thing laziness exists to avoid. See the readme.
	nav: [
		["/", "Home"],
		["/replace/", "Replace"],
		["/columns/", "Columns"],
		["/tabs/", "Tabs"],
		["/dynamic/", "route()"],
		["/full/", "Full"],
	],

	//  The Navigation Recipes library — one section per council seat. Same shape as
	//  `nav`, rendered under its own heading so the primitives above stay the floor.
	recipes: [
		["/nav/", "Primitives"],
		["/compound/", "Compound"],
		["/deep/", "Deep & edges"],
		["/library/", "Layout library"],
		["/chrome/", "Chrome"],
		["/patterns/", "Applied IA"],
		["/motion/", "Motion"],
		["/a11y/", "Access"],
		["/perf/", "Cost"],
		["/async/", "Async"],
		["/urls/", "URL design"],
		["/content/", "Content"],
		["/forms/", "Forms"],
		["/versus/", "Versus"],

		//  Drifted out of this list while the tree grew — 8 sections existed and
		//  were unreachable from the sidebar. Exactly the cost of hand-typing it;
		//  /kit/ derives the same nav from app.root with zero modules.
		["/compose/", "Compose"],
		["/start/", "Start here"],
		["/state/", "State"],
		["/mutation/", "Mutation"],
		["/sitemap/", "Sitemap"],
		["/budget/", "Budget"],
		["/kit/", "Derived chrome"],
	],

	//  The design records, one per seat. Separate from `recipes` because these
	//  are what the council CONCLUDED, not what it built.
	council: [["/council/", "The council"]],

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$sidebar = div.c("sidebar", () => {
				div.c("brand", "new/1");
				div.c("nav", () => {
					this.nav.forEach(([url, text]) => a.c("nav-link", text).href(url));
					div.c("nav-heading", "recipes");
					this.recipes.forEach(([url, text]) => a.c("nav-link", text).href(url));
					div.c("nav-heading", "records");
					this.council.forEach(([url, text]) => a.c("nav-link", text).href(url));
				});
				div.c("hint", "Links are plain <a href>. The Router upgrades the click — no reload, and the console shows exactly which modules were fetched.");
			});

			this.$pages = div.c("pages");
		});

		// $pages, not $app — a page's view auto-appends to the captor.
		View.set_captor(this.$pages);
		console.log("app.render() — OVERRIDDEN by site/app.js, sidebar + $pages built once");
	},
});
