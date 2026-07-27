import { Page, p, pre, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Router",
	description: "Opt-out, no-reload navigation.",
	content(){
		p("`Router` turns in-page links into `pushState` navigation and handles back/forward. `App.config_router` wires it by default; opt out with `new App({ router: false })` and every link becomes a normal full page load.");

		h2("One delegated listener");
		p("It catches clicks on `document` and upgrades them — no per-link wiring, pages just write ordinary `a().href(url)`. But it only upgrades a click when it's safe: you're on a real Page, and the target is a registered Page. Everything else (external links, bare pages, modified clicks) falls through to a full navigation, which is what keeps back/forward honest.");

		pre(`app.router.go("/framework/core/View/");   // programmatic navigation`);

		p("It owns *when* to navigate and calls `app.load_page(url)`; the App owns the loading, the Page owns the content. Three small, separate things.");
	}
});
