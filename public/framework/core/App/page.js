import { Page, p, pre, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "App",
	description: "Boots the page and loads whatever the URL points at.",
	content(){
		p("`App` is the substrate. `app.js` creates the singleton (`window.app`) and re-exports the framework, so pages import everything from `/app.js`. App builds `$app`, then loads the page for the URL.");

		h2("The URL is the router");
		p("`/` → `/page.js`, `/a/` → `/a/page.js`, `/a/b` → `/a/b.page.js`. `App.load_page` imports that module, appends its default export, and calls `.activate?.()` — all duck-typed, so the default can be a Page, a function, a view, or nothing at all (a page that renders at module top).");

		pre(`async load_page(url = location.pathname){
    this.$app.empty();
    const page = this.page = await this.import_page(url);
    if (page instanceof Page){
        await this.load_topic(page);   // load ancestors for a drill-down
        this.$app.append(page.host()); // the topic's layout, or the page
        page.activate();               // title / meta / theme
    } else if (page) this.$app.append(page);
}`);

		p("That's the whole flow. `load_topic` is the one concession to the ColumnPager drill-down (climb the URL to load a deep page's ancestors); everything else is dead simple.");
	}
});
