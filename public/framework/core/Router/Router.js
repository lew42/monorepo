import { Page } from "../Page/Page.class.js";

/**
 * Router — opt-in, single instance (app.router). Turns in-page navigation into
 * no-reload (pushState) navigation, and handles back/forward.
 *
 *   app.router = new Router({ app });   // enable; without it, links full-load
 *
 * It owns *when & what* (a URL changed → here's the page); the App's pager owns
 * *where & how* (swap it in). The Router never renders — it calls app.render_url.
 *
 * Link interception is a single delegated listener, so pages use ordinary
 * `a().href(url)` / page.link() and get SPA for free — no per-link wiring. It
 * only upgrades a click when it's SAFE to:
 *   • we're currently showing a re-renderable Page (so Back can redraw it), and
 *   • the target is a registered Page (sync lookup — no import, no side effects).
 * Everything else (external links, bare pages, unknown routes, modified clicks)
 * falls through to a normal full-page navigation.
 */
export class Router {

	constructor(config){
		Object.assign(this, config); // { app }
		this.listen();
	}

	listen(){
		document.addEventListener("click", e => this.intercept(e));
		window.addEventListener("popstate", () => this.app.render_url(window.location.pathname));
	}

	intercept(e){
		if (e.defaultPrevented) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // new tab

		const a = e.target.closest?.("a");
		if (!a || !a.href) return;

		const url = new URL(a.href);
		if (url.origin !== window.location.origin) return;   // external

		if (!(this.app.current instanceof Page)) return;      // on a bare page → full nav
		if (!Page.registry.has(url.pathname)) return;         // unknown route → full nav

		e.preventDefault();
		this.go(url.pathname);
	}

	// programmatic navigation (also used by e.g. ColumnPager's close button)
	go(url){
		if (url !== window.location.pathname)
			window.history.pushState({}, "", url);
		this.app.render_url(url);
	}

	// ── debug surface (for a future route-admin UI) ──
	get current(){ return this.app.current; }
	get routes(){ return [...Page.registry.keys()].sort(); }
}

export default Router;
