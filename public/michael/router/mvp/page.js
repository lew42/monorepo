import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "app.router = new Router.",
	content(){
		p("One line enables it. Without it, links do full page loads — still perfectly functional (bare pages, plain `href`s all work).");

		pre(`app.router = new Router({ app });`);

		p("It never renders — on a navigation it calls `app.render_url(url)`, which resolves the page and swaps it into `app.pager`. Back/forward work because it listens to `popstate` and re-renders from the URL.");

		p("Anything can navigate programmatically:");

		pre(`app.router.go("/docs/elements/");`);

		p("(That's what a ColumnPager's ✕ close button calls to climb to the parent.)");
	}
});
