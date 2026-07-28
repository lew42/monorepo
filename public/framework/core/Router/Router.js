import { Page } from "../Page/Page.class.js";

/**
 * Router — turns in-page links into no-reload (pushState) navigation, and
 * handles back/forward. Created by App.config_router (opt out with
 * `new App({ router: false })`).
 *
 * It never renders — it decides *when* to navigate and calls `app.load_page(url)`.
 *
 * Link interception is one delegated listener, so pages use ordinary
 * `a().href(url)` / `page.link()` and get SPA for free. It only upgrades a click
 * when it's SAFE to redraw on Back: we're on a real Page (`app.page`), and the
 * target is a registered Page (a sync lookup — no import, no side effects).
 * Everything else (external, bare pages, unknown routes, modified clicks) falls
 * through to a normal full navigation — which is what keeps history honest.
 */
export class Router {

	constructor(config) {
		Object.assign(this, config); // optional config from new App({ router: {...} })
		this.listen();
	}

	get app() { return window.app; }

	listen() {
		document.addEventListener("click", e => this.intercept(e));
		window.addEventListener("popstate", () => this.app.load_page());
	}

	intercept(e) {
		if (e.defaultPrevented) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // new tab

		const a = e.target.closest?.("a");
		if (!a || !a.href) return;
		if (a.target && a.target !== "_self") return;  // new tab/frame — let the browser
		if (a.hasAttribute("download")) return;        // a download, not a navigation

		const url = new URL(a.href);
		if (url.origin !== window.location.origin) return; // external

		// an in-page anchor (#section on this same path): the browser scrolls.
		// Without this we'd preventDefault and re-render the page instead.
		if (url.hash && url.pathname === window.location.pathname) return;

		if (!(this.app.page instanceof Page)) return;      // on a bare page → full nav
		if (!Page.registry.has(url.pathname)) return;      // unknown route → full nav

		e.preventDefault();
		this.go(url.pathname);
	}

	// programmatic navigation (also used by e.g. a ColumnPager's close button)
	go(url) {
		if (url !== window.location.pathname)
			window.history.pushState({}, "", url);
		this.app.load_page(url);
	}

	get routes() { return [...Page.registry.keys()].sort(); } // debug
}

export default Router;
