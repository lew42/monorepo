import { App, el, div, a, h1, p, pre } from "/app.js";
import sections from "./nav.js";

/*
 * A history.pushState router, scoped to one subtree.
 *
 * Links outside Router.scope are left completely alone, so this can run inside a
 * site where nothing else knows the router exists. Inside the scope, a click
 * imports that path's page.js and swaps only <main>. The sidebar never re-renders.
 *
 * The trick that makes this possible is class Page: because importing a page has
 * no side effects, the same module can be rendered again on a second visit.
 */
export default class Router {

	static scope = "/arya/";

	static singleton() {
		if (!Router._singleton) Router._singleton = new Router();
		return Router._singleton;
	}

	// called by Page.render(), so the first page to render brings up the shell
	mount(page) {
		if (!this.$shell) {
			this.build();
			this.listen();
		}
		this.show(page);
	}

	build() {
		this.links = new Map();

		this.$shell = div.c("docs", () => {
			el.c("aside", "docs-nav", () => {
				a.c("docs-home", "lew42 framework").href("/");

				for (const section of sections) {
					div.c("docs-section", () => {
						div.c("docs-section-title", section.title);
						for (const page of section.pages) {
							this.links.set(page.path, a.c("docs-link", page.title).href(page.path));
						}
					});
				}
			});

			this.$main = el.c("main", "docs-main");
		});
	}

	listen() {
		document.addEventListener("click", e => {
			if (e.defaultPrevented || e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

			const anchor = e.target?.closest?.("a[href]");
			if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

			const url = new URL(anchor.href);
			if (url.origin !== location.origin) return;
			if (!url.pathname.startsWith(Router.scope)) return; // not ours, let the browser have it

			e.preventDefault();
			this.go(url.pathname);
		});

		window.addEventListener("popstate", () => this.load(location.pathname));
	}

	go(path) {
		if (path === this.page?.path) return;
		history.pushState(null, "", path);
		this.load(path);
	}

	async load(path) {
		if (path === this.page?.path) return;

		// a fast second click must not be overwritten by a slow first import
		const token = ++this.token;
		this.$shell.ac("loading");

		try {
			const mod = await import(App.path_to_page_url(path));
			if (token !== this.token) return;
			this.show(mod.default);
		} catch (error) {
			if (token !== this.token) return;
			this.fail(path, error);
		} finally {
			if (token === this.token) this.$shell.rc("loading");
		}
	}

	show(page) {
		this.page = page;
		document.title = `${page.title} · lew42 framework`;
		this.$main.empty().append(() => page.content());
		this.sync();
		window.scrollTo(0, 0);
	}

	fail(path, error) {
		console.error(error);
		this.page = null;
		this.$main.empty().append(() => {
			h1("Not found");
			p(`Nothing renders at ${path}.`);
			pre.c("error", error.message);
		});
		this.sync();
	}

	sync() {
		for (const [path, link] of this.links) {
			link.rc("active");
			if (path === this.page?.path) link.ac("active");
		}
	}

	token = 0;
}
