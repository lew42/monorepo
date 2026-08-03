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

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$sidebar = div.c("sidebar", () => {
				div.c("brand", "new/1");
				div.c("nav", () => {
					this.nav.forEach(([url, text]) => a.c("nav-link", text).href(url));
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
