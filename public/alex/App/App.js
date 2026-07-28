import { el, div, View, h1, h2, h3, p, is } from "../View/View.js";
import Socket from "../../dev/Socket/Socket.js";
import Page from "../Page/Page.js";
import Router from "../Router/Router.js";

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
		this.router = new Router(this);
	}

	// 2. pre-render before page.js loading
	render() {
		this.$body = View.body();
		this.$app = div.c("app");

		View.set_captor(this.$app);
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

	// the router handles the initial page load like any other navigation
	async load_page() { // 3
		this.page = await this.router.show(window.location.pathname, { initial: true });
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

export { App, Page, Router };
export * from "../View/View.js";