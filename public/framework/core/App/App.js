import { View, div, h1, el } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Router } from "../Router/Router.js";
import { Font } from "./Font.js";

// load first, so the CSS layers are defined before anything else paints
View.stylesheet(import.meta, "../../framework.css");

/* Boot, and the one flat container. App no longer resolves urls — the moment a
 * segment can need an import, that became navigation, and navigation is the
 * Router's. What is left here is the six-step lifecycle and `$pages`.
 */
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
		console.log(`app.instantiate() ${location.pathname} ${"─".repeat(40)}`);

		this.config();
		this.render();
		await this.load();
		this.initialize();
		this.inject();
		this.ready.resolve();

		console.log("  ↳ app.inject() — $app appended to <body>, first paint");
	}

	// Empty on purpose. A site overrides render() for chrome; config() is where a
	// Router option or a font would land.
	config(){}
	initialize(){}

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$pages = div.c("pages");
		});

		// $pages, NOT $app. A page's view is built by an element factory, which
		// auto-appends to the captor — so the captor has to be where pages live.
		View.set_captor(this.$pages);
		console.log("app.render() — chrome built, still detached from <body>");
	}

	/* The one import that isn't behind a click. Everything below the root is a
	 * name until the Router walks to it.
	 *
	 * The try covers the first navigation too, not just the import: activate()
	 * renders every page in the chain, which runs every content() there is, and a
	 * throw in any of them would otherwise skip inject() and paint nothing.
	 */
	async load(){
		console.log('app.load() — import("/page.js"), the walk needs an origin');

		try {
			// the only page handed `app` directly; every other page gets it from
			// its parent on the walk, in Page.child()
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

	/* Wait for a typeface before first paint. Called from config(), which runs
	 * before render(), so the promise is on `loaders` well before load() awaits
	 * them — a font asked for later still loads, it just isn't waited for. */
	font(name){
		const loading = Font.load(name);
		this.loaders.push(loading);
		return loading;
	}

	// into $pages, not $app — emptying $app deletes the chrome, so the one page
	// that most needs navigation would be the one page without it
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

	/* Stylesheets only, and it can never reject.
	 *
	 * Router.load() awaits this before activating so a lazily imported page's
	 * <link> is applied before its first paint. It must NOT await `loaders`:
	 * that list only grows (tabs() pushes a .then() chain with no .catch()), so
	 * awaiting it per navigation means one rejected loader kills EVERY later
	 * navigation — measured, and silently, because click() never awaits go().
	 * allSettled, so a 404 stylesheet costs a warning and not the router.
	 */
	styles_loaded(){ return Promise.allSettled(View.stylesheets); }

	static stylesheet(meta, url){ return View.stylesheet(meta, url); }

	/* ── compatibility, not API ──────────────────────────────────────────────
	 * Both of these are aliases kept for consumers OUTSIDE framework/, per
	 * framework/readme.md §8: rename freely in here, alias on the way out. The
	 * rewrite dropped them and took four sections of the site down with them —
	 * `app.stylesheet()` alone is called at module scope by alex/, arya/ and
	 * castin/, so its absence 404'd all three.
	 *
	 * Neither is a second implementation and neither should grow one. */

	stylesheet(meta, url){ return View.stylesheet(meta, url); }

	/* The OLD url convention: `/a/` → `/a/page.js`, `/a/b` → `/a/b.page.js`.
	 * The router no longer works this way — Page.child() walks declared children
	 * and every node is a directory — so this cannot delegate to anything; it is
	 * the old rule, frozen, for the sandbox Routers that still call it
	 * (arya/lib/Router.js, alex/framework/core/Router/Router.js). Do not build on it. */
	static path_to_page_url(path){
		return path.endsWith("/") ? path + "page.js" : path + ".page.js";
	}
}

export default App;
export * from "./Font.js";
export * from "../View/View.js";
export * from "../Page/Page.class.js";
export * from "../Router/Router.js";
