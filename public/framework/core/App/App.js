import { View, div, h1, el } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Router } from "../Router/Router.js";
import { Font } from "./Font.js";

export class App {

	constructor(...args){
		this.loaders = [];

		const { promise, resolve } = Promise.withResolvers();
		this.ready = Object.assign(promise, { resolve });

		this.assign(...args);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return "app"; }

	async instantiate(){
		try {
			this.config();
			this.render();
			await this.load();
			this.initialize();
			this.inject();
		}
		catch (error){ this.error(error); }
		// ⚠ resolve() stays outside the catch — a throw above must still settle
		// ready, or await app.ready hangs forever.
		this.ready.resolve();
	}

	// Empty on purpose — the seams a site overrides.
	config(){}
	initialize(){}

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$pages = div.c("pages");
		});

		// ⚠ $pages, NOT $app: a page's view is built by an element factory, which
		// auto-appends to the captor, so the captor has to be where pages live.
		View.set_captor(this.$pages);
	}

	// ⚠ The try covers the first navigation too — a throw in any content() would
	// otherwise skip inject() and paint nothing at all.
	async load(){
		try {
			// the only page handed `app` directly; every other gets it from its
			// parent on the walk, in Page.child()
			this.root = (await Page.load("/"))?.assign({ app: this });
			if (!this.root) throw new Error("no /page.js — the root is the one page that must exist");

			this.router = new Router(this.router, { app: this });

			if (!await this.router.load(location.pathname))
				throw new Error(`404 — nothing matches "${location.pathname}"`);
		}
		catch (error){ return this.error(error); }

		await this.loaded();
	}

	inject(){ this.$body.append(this.$app); }

	// Waited for before first paint only if called from config().
	font(name){
		const loading = Font.load(name);
		this.loaders.push(loading);
		return loading;
	}

	// ⚠ Into $pages, not $app — emptying $app deletes the chrome, so the one page
	// that most needs navigation would be the one page without it.
	error(error){
		console.error(error);
		this.$pages.empty(() => {
			div.c("page active-page", () => {
				h1("Page Load Error");
				el.c("pre", "error", error.message);
			});
		});
	}

	// A method, not a getter — it allocates a fresh Promise.all every call.
	loaded(){ return Promise.all(View.stylesheets.concat(this.loaders)); }

	// ⚠ Stylesheets only. Must NOT await `loaders` — that list only grows, so one
	// rejected loader would silently kill every later navigation. doc/loaders.md.
	styles_loaded(){ return Promise.allSettled(View.stylesheets); }

	static stylesheet(meta, url){ return View.stylesheet(meta, url); }

	// Compatibility for consumers outside framework/, not API. Neither of the two
	// below may grow an implementation. doc/aliases.md.

	stylesheet(meta, url){ return View.stylesheet(meta, url); }

	static path_to_page_url(path){
		return path.endsWith("/") ? path + "page.js" : path + ".page.js";
	}
}

export default App;
export * from "./Font.js";
export * from "../View/View.js";
export * from "../Page/Page.class.js";
export * from "../Router/Router.js";
