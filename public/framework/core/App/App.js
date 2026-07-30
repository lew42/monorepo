import { el, div, View, h1 } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Router } from "../Router/Router.js";
import Socket from "../../dev/Socket/Socket.js";

// load first, so the CSS layers are defined before anything else paints
View.stylesheet(import.meta, "../../framework.css");

export default class App {

	constructor(...args) {
		this.loaders = []; // stylesheets and fonts to await before injecting
		this.assign(...args);
		this.instantiate();
	}

	async instantiate() {
		this.config();       // 1. setup (socket, router)
		this.render();       // 2. build $app, become the captor
		await this.load();   // 3. load the page + await stylesheets/fonts
		this.initialize();   // 4. hook for subclasses
		this.inject();       // 5. put $app in the document
		this.ready.resolve();
	}

	config() {
		this.config_socket();
		this.config_router();
	}

	// opt out with `new App({ router: false })`; otherwise navigation is no-reload.
	// `this.router` may be undefined or a POJO of options; either way it merges,
	// then `{ app: this }` lands on top. No branch, because every constructor in
	// the framework is Object.assign-based and later args win.
	config_router() {
		if (this.router !== false)
			this.router = new Router(this.router, { app: this });
	}

	render() {
		this.$body = View.body();
		this.$app = div.c("app");
		View.set_captor(this.$app); // page.js modules render here
	}

	async load() {
		await this.load_page();
		await this.loaded; // stylesheets/fonts a page added during its module load
	}

	initialize() {}

	inject() {
		this.$body.append(this.$app);
	}

	// ── page loading ──────────────────────────────────────────────────────
	// The whole flow, and the navigation handler (the Router calls it with a url;
	// popstate with none). Everything here is duck-typed: the default export may
	// be a Page, a view, a function, or nothing at all.
	//
	// Loading happens FIRST, while the current page stays on screen; the swap is
	// synchronous — no await between empty() and append() — so the browser never
	// paints an empty $app. No white flash.
	async load_page(url = window.location.pathname) {
		let page;
		try { page = await Page.load(url); }
		catch (error) { return this.error(error); }

		this.page?.deactivate?.(); // leave the current page (its theme, etc.)
		this.page = page;          // set before render: a pager reads app.page

		// host() = the ancestor that owns the layout, or the page itself. A bare
		// page (no default export) already rendered itself — nothing to swap.
		if (page) {
			const host = page.host?.() ?? page;

			// Adoption — a Page learns its app from whoever renders it, exactly
			// as a child learns its `.parent` from whoever declares it. A Page is
			// built in userland at module scope (`export default new Page(…)`),
			// so App has no constructor to inject into; this is the seam it does
			// have. Guarded on `.host` so bare exports are left alone — assigning
			// a property to a default-exported *string* throws in strict mode.
			if (page.host)
				page.app = host.app = this;

			// A topic defines pager() and builds it right there in its own page.js; an
			// ordinary page has none and just renders. Both branches are one
			// duck-typed call — nothing here knows what a Pager is.
			this.$app.empty().append(host.pager?.() ?? host);
		}

		page?.activate?.();        // document.title / meta / theme
		this.mark_links();
	}

	// Reflect the current url in the DOM, in one pass over the freshly rendered
	// $app: a link to the current path gets `.active`, a link to one of its
	// ancestors gets `.in-path`. Sidebars, breadcrumbs, preview cards and inline
	// links all light up with no per-link logic anywhere — CSS decides what each
	// kind of link does with the class.
	mark_links() {
		const here = window.location.pathname;

		for (const a of this.$app.el.querySelectorAll("a[href]")) {
			if (a.origin !== window.location.origin) continue;

			if (a.pathname === here)
				a.classList.add("active");
			else if (a.pathname.endsWith("/") && here.startsWith(a.pathname))
				a.classList.add("in-path");
		}
	}

	error(error) {
		console.error(error);
		this.$app.empty(() => {
			h1("Page Load Error");
			el.c("pre", "error", error.message);
		});
	}

	// ── the rest ──────────────────────────────────────────────────────────
	config_socket() {
		const h = window.location.hostname;
		if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".localhost"))
			this.socket = Socket.singleton();
	}

	// load a predefined font (see Font, below), awaited before inject
	font(name) {
		if (!Font.fonts[name]) throw "Unknown font";
		if (Font.fonts[name].font) return console.warn("font already loaded");

		const font = new Font(Font.fonts[name]);
		const loaded = font.load();
		this.loaders.push(loaded);
		Font.fonts[name].font = font;
		return loaded;
	}

	stylesheet(meta, url) {
		return View.stylesheet(meta, url);
	}

	get ready() {
		if (!this._ready) {
			let resolve;
			this._ready = new Promise((res) => { resolve = res; });
			this._ready.resolve = resolve;
		}
		return this._ready;
	}

	get loaded() {
		return Promise.all(View.stylesheets.concat(this.loaders));
	}

	assign(...args) {
		return Object.assign(this, ...args);
	}

	static stylesheet(meta, url) {
		return View.stylesheet(meta, url);
	}

	/* An ALIAS, not a second implementation — the logic lives in Page.module_url
	 * (next to the `url` getter it inverts). The name stays because it's public
	 * API that other code was written against: arya/lib/Router.js calls it at
	 * runtime, and arya's + castin's doc pages describe it in prose. Deleting it
	 * breaks their routers and makes their documentation describe a function
	 * that doesn't exist.
	 *
	 * "/" → "/page.js", "/a/" → "/a/page.js", "/a/b" → "/a/b.page.js" */
	static path_to_page_url(path) {
		return Page.module_url(path);
	}

	static meta_path(meta, path) {
		return new URL(path, meta.url).href;
	}
}

class Font {
	constructor(...args) {
		Object.assign(this, ...args);
		this.fontface = new FontFace(this.name, `url(${this.url})`, this.options);
	}
	async load() {
		await this.fontface.load();
		document.fonts.add(this.fontface);
	}
}

Font.fonts = {
	Montserrat: {
		name: "Montserrat",
		url: "https://fonts.gstatic.com/s/montserrat/v30/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
		options: { weight: '100 900' }
	},
	"Material Icons": {
		name: "Material Icons",
		url: "https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
		options: { style: "normal", weight: "400" }
	}
};

export { App };
export * from "../View/View.js";
export * from "../Page/Page.class.js";
