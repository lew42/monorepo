import { el, div, View, h1, h2, h3, p, is } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Pager } from "../Pager/Pager.js";
import Socket from "../../dev/Socket/Socket.js";

// this needs to load immediately, so the layers are properly defined
View.stylesheet(import.meta, "../../framework.css");

export default class App {

	constructor(...args) {
		this.loaders = []; // stylesheets and fonts (promises)
		this.assign(...args);
		this.instantiate();
	}

	async instantiate() {
		this.config(); // 1
		this.render(); // 2
		await this.load(); // 3
		this.initialize(); // 4
		this.inject(); // 5
		this.ready.resolve(); // 6
	}

	// 1. initial setup, requests
	config() {
		this.config_socket();
	}

	// 2. pre-render before page.js loading
	render() {
		this.$body = View.body();
		this.$app = div.c("app");
		View.set_captor(this.$app);

		// the main content container — pages are swapped in/out of here.
		this.pager = new Pager();      // captures into $app
		View.set_captor(this.pager);   // bare pages + the initial page render here
	}

	// 3. request and await the page, and then all the loaders
	async load() {
		// wait until page module has finished
		await this.load_page();

		// page module can add additional loaders (stylesheets, fonts)
		await this.loaded;
	}

	// 4. post render, pre-dom-injection
	initialize() {}

	// 5. inject this.$app into <body>
	inject() {
		this.$body.append(this.$app);
	}

	config_socket(){
		const h = window.location.hostname;
        if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".localhost")) {
            this.socket = Socket.singleton();
        }
	}

	// 3. initial page load
	async load_page() {
		await this.render_url(window.location.pathname);
		this.booted = true; // after boot, navigating to a bare page = full reload
	}

	// resolve a URL to its page. Registered (already-loaded) pages resolve
	// synchronously with no import; otherwise fall back to a dynamic import.
	// "/" -> "/page.js"; "/path/" -> "/path/page.js"; "/path/sub" -> "/path/sub.page.js"
	async resolve(url) {
		const hit = Page.registry.get(url);
		if (hit) return hit;

		try {
			const mod = await import(App.path_to_page_url(url));
			return mod.default; // may be a Page, a function/view, or undefined (bare)
		} catch (error) {
			this.render_error(error);
			return null;
		}
	}

	// resolve + render (used for the initial load, popstate, and Router.go)
	async render_url(url) {
		const page = await this.resolve(url);
		if (page instanceof Page)
			await this.ensure_topic(page);
		this.render_page(page, url);
	}

	// If a page's pager-owning topic isn't loaded yet (a deep hard-reload with no
	// eager import of the topic), climb the URL importing ancestors until a
	// pager-owner appears. Adoption wires each `.parent` as the ancestor
	// constructs, so `page.host()` then finds the topic. A topic that's already
	// loaded (eager import / registry) makes this a no-op — no climb, no import.
	async ensure_topic(page) {
		let url = page.parent_url;
		while (!page.host().pager && url) {
			let mod;
			try { mod = await import(App.path_to_page_url(url)); }
			catch { break; }
			if (!(mod.default instanceof Page)) break; // hit the site root / a bare page
			url = mod.default.parent_url;
		}
	}

	// swap the resolved page into the main pager and manage activation
	render_page(page, url) {
		if (page instanceof Page) {
			this.current?.deactivate?.();
			this.pager.show(page.host()); // a topic renders its ColumnPager; else plain content
			page.activate();              // the actual target sets title/meta/theme
			this.current = page;
			return;
		}

		if (page) {
			// a function / view default (no activation protocol)
			this.pager.show(page);
			return;
		}

		// null = load error (already rendered by render_error) — do nothing.
		if (page === null)
			return;

		// undefined = bare page (no default export): its module side effects
		// already rendered into the captor on the initial load. On a later (SPA)
		// navigation we can't re-run a cached module, so do a real browser load.
		if (this.booted)
			window.location.assign(url);
	}

	render_error(error) {
		console.error(error);
		this.pager.show(() => {
			h1("Page Load Error");
			el.c("pre", "error", error.message);
		});
	}

	// loads a predefined font (see Font class below)
	font(name) {
		if (!Font.fonts[name])
			throw "Unknown font";

		if (Font.fonts[name].font) {
			console.warn("font already loaded");
			return;
		}

		const font = new Font(Font.fonts[name]);
		const loaded = font.load(); // promise
		this.loaders.push(loaded); // save the promise
		Font.fonts[name].font = font; // cache the font
		return loaded; // allow await app.font(...)
	}

	stylesheet(meta, url) {
		return View.stylesheet(meta, url);
	}

	get ready() {
		if (!this._ready) {
			let resolve;
			this._ready = new Promise((res) => {
				resolve = res;
			});
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

	static path_to_page_url(path) {
		// "/" -> "/page.js"
		// "/path/" -> "/path/page.js"
		if (path.endsWith("/")) {
			return path + "page.js";

			// "/sub" -> "/sub.page.js" or
			// "/path/sub" -> "/path/sub.page.js"
		} else {
			return path + ".page.js";
		}
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
		options: {
			weight: '100 900'
		}
	},
	"Material Icons": {
		name: "Material Icons",
		url: "https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
		options: {
			style: "normal",
			weight: "400"
		}
	}
};

export { App };
export * from "../View/View.js";
export * from "../Page/Page.class.js";