import { App } from "/framework/core/new/0/App.js";
import { View, div, a } from "/framework/core/View/View.js";
import Socket from "/framework/dev/Socket/Socket.js";

export * from "/framework/core/View/View.js";
export { Page } from "/framework/core/new/0/Page.class.js";

// The site's chrome. App.render() is a handful of lines on purpose — a site that
// wants a sidebar overrides it, and everything here is built ONCE, outside
// $pages, so navigation can never touch it.
//
// Every $prop is named for the class it carries: $sidebar_inner IS
// div.c("sidebar-inner"). See "Name $props after the class they carry" in CLAUDE.md.
export default window.app = new App({

	// Live reload. The site opts in, not the framework — App knows nothing about
	// sockets. Socket.singleton() only connects on localhost, so this line is
	// inert anywhere else. The server calls reload() on it.
	socket: Socket.singleton(),

	// the site name. Page.seo_title() puts it in front of the page title.
	title: "new/0",

	//  [url, text]   a link          ["Heading"]   a section label
	nav: [
		["/", "Home"],

		["The trio"],
		["/app/", "App"],
		["/page/", "Page"],
		["/router/", "Router"],

		["How it works"],
		["/loading/", "Load order"],
		["/loading/resolve/", "Url → chain", "sub"],
		["/nesting/", "Nesting"],
		["/dynamic/", "Dynamic urls"],
		["/inline/", "Inline pages"],

		["Layouts"],
		["/layouts/", "Four layouts"],
		["/layouts/replace/", "1 · Replace", "sub"],
		["/layouts/column/", "2 · Columns", "sub"],
		["/layouts/tabs/", "3 · Tabs", "sub"],
		["/layouts/takeover/", "4 · Takeover", "sub"],

		["Open questions"],
		["/state/", "Keeping state"],
		["/areas/", "Multiple areas"],
		["/beyond/", "Beyond the url"],
	],

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$sidebar = div.c("sidebar", () => {
				this.$sidebar_inner = div.c("sidebar-inner", () => {
					div.c("brand", "new/0");
					div.c("nav", () => {
						this.nav.forEach(([url, text, sub]) => text
							? a.c(sub ? "nav-link sub" : "nav-link", text).href(url)
							: div.c("nav-head", url));
					});
					div.c("hint", "Each link is a plain <a href>. The Router upgrades the click.");
				});
			});

			// the root page mounts itself in here — the one thing an App owes a Page
			this.$main = div.c("main", () => {
				this.$pages = div.c("pages");
			});
		});

		View.set_captor(this.$app);
		console.log("app.render() — OVERRIDDEN by site/app.js, sidebar + $pages built once");
	},

	// ── layout 4: a page takes the whole window ───────────────────────────
	// The chrome belongs to the site, so the site is what puts it away. A page
	// opts in from its own file with `activate(){ this.app.takeover(this); }` —
	// one visible line, and nothing in the base classes knows this exists.

	takeover(page){
		console.log(`app.takeover(${page.log_label()}) — sidebar and $main hidden`);
		this.$app.ac("takeover").append(page.render().ac("takeover-page"));
	},

	restore(page){
		console.log(`app.restore(${page.log_label()}) — chrome comes back`);
		this.$app.rc("takeover");
		page.view.remove();
	},
});
