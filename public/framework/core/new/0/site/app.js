import { App } from "/framework/core/new/0/App.js";
import { View, div, a } from "/framework/core/View/View.js";
import Socket from "/framework/dev/Socket/Socket.js";

export * from "/framework/core/View/View.js";
export { Page } from "/framework/core/new/0/Page.class.js";

// The site's chrome. App.render() is a handful of lines on purpose — a site that
// wants a sidebar overrides it, and everything here is built ONCE, outside
// $pages, so activation can never touch it.
export default window.app = new App({

	socket: Socket.singleton(),

	//  [url, text]  a link      third slot = indent
	nav: [
		["/", "Home"],
		["/about/", "About"],
		["/docs/", "Docs — columns"],
		["/docs/intro/", "Intro", "sub"],
		["/docs/guide/", "Guide", "sub"],
		["/focus/", "Focus — full"],
	],

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$sidebar = div.c("sidebar", () => {
				div.c("brand", "new/0");
				div.c("nav", () => {
					this.nav.forEach(([url, text, sub]) =>
						a.c(sub ? "nav-link sub" : "nav-link", text).href(url));
				});
				div.c("hint", "Every link is a plain <a href>. With no Router that's a real page load — and the SPA fallback is what makes it work.");
			});

			// the one thing an App owes a Page
			this.$pages = div.c("pages");
		});

		// $pages, not $app — a page's view auto-appends to the captor, so the
		// captor has to be where pages live. See the note in App.render().
		View.set_captor(this.$pages);
		console.log("app.render() — OVERRIDDEN by site/app.js, sidebar + $pages built once");
	},
});
