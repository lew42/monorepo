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

	// opt out with `new App({ router: false })`; otherwise navigation is no-reload
	config_router() {
		if (this.router !== false)
			this.router = new Router(this.router);
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
	// The whole flow. Import the module for `url`, render it into $app, activate
	// it. Also the navigation handler (Router calls it with a url; popstate with
	// none). "/" → "/page.js", "/a/" → "/a/page.js", "/a/b" → "/a/b.page.js".
	async load_page(url = window.location.pathname) {
		// Load everything FIRST, while the current page stays on screen, then swap
		// synchronously — empty() and append() run with no await between them, so
		// the browser never paints an empty $app. No white flash.
		const page = await this.import_page(url);
		if (page instanceof Page)
			await this.load_topic(page); // load ancestors so a deep page finds its topic

		this.page?.deactivate?.(); // leave the current page (its theme, etc.)
		this.page = page;

		if (page instanceof Page) {
			this.$app.empty();
			this.$app.append(page.host()); // render the topic's layout, or the page itself
			page.activate();               // document.title / meta / theme
		} else if (page) {
			this.$app.empty();
			this.$app.append(page);        // a plain function/view default (no activate)
		}
		// else: a bare page (no default export) already rendered itself into $app
		// via import side effects — nothing to swap, so don't empty.
	}

	async import_page(url) {
		try {
			return (await import(App.path_to_page_url(url))).default;
		} catch (error) {
			this.error(error);
		}
	}

	// A deep page (e.g. /a/b/c/) is imported alone, so its ancestors — and the
	// layout one of them may own — aren't loaded. Climb the url importing them;
	// adoption wires `.parent` as each constructs, so `page.host()` finds the
	// nearest ancestor with a `pager`. A page with no such ancestor (or already
	// loaded) just renders itself. No-op when nothing needs loading.
	async load_topic(page) {
		let url = page.parent_url;
		while (!page.host().pager && url) {
			let parent;
			try { parent = (await import(App.path_to_page_url(url))).default; }
			catch { break; }
			if (!(parent instanceof Page)) break; // reached the site root / a bare page
			url = parent.parent_url;
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

	// "/" → "/page.js", "/a/" → "/a/page.js", "/a/b" → "/a/b.page.js"
	static path_to_page_url(path) {
		return path.endsWith("/") ? path + "page.js" : path + ".page.js";
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
