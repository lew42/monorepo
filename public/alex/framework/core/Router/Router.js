import Page from "../Page/Page.js";
import ErrorPage from "../Page/ErrorPage.js";

/* Client-side pushState router.
 *
 * - intercepts clicks on internal links (see on_click for what's skipped)
 * - caches one Page per path: revisits re-activate the cached instance
 * - legacy side-effect pages (no default export) can't re-render without a
 *   fresh module eval, so navigating to them falls back to a full page load
 * - the App delegates the initial page load to router.show(initial: true)
 */
export default class Router {

	constructor(app) {
		this.app = app;
		this.pages = new Map(); // path -> Page | Router.LEGACY
		this.current = null;
		this.token = 0; // navigation counter — stale async navigations abort

		history.replaceState({ scroll: window.scrollY }, "");

		document.addEventListener("click", e => this.on_click(e));
		window.addEventListener("popstate", e => this.on_popstate(e));

		// keep the current history entry's scroll position up to date
		window.addEventListener("scroll", () => {
			clearTimeout(this.scroll_timeout);
			this.scroll_timeout = setTimeout(() => {
				history.replaceState({ ...(history.state || {}), scroll: window.scrollY }, "");
			}, 100);
		}, { passive: true });
	}

	on_click(e) {
		if (e.defaultPrevented || e.button !== 0 ||
			e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

		const link = e.target.closest && e.target.closest("a");
		if (!link) return;

		if ((link.target && link.target !== "_self") ||
			link.hasAttribute("download") ||
			link.hasAttribute("data-no-router") ||
			link.origin !== location.origin) return;

		// same-page hash links stay native
		if (link.pathname === location.pathname && link.hash) return;

		e.preventDefault();
		this.navigate(link.pathname + link.search + link.hash);
	}

	on_popstate(e) {
		return this.show(location.pathname).then(() => {
			window.scrollTo(0, (e.state && e.state.scroll) || 0);
		});
	}

	navigate(url) {
		if (url === location.pathname + location.search + location.hash) return;
		history.pushState({ scroll: 0 }, "", url);
		return this.show(location.pathname).then(() => window.scrollTo(0, 0));
	}

	// the one and only way pages get activated (initial load + every navigation)
	async show(path, options = {}) {
		const token = ++this.token;
		let page = this.pages.get(path);

		if (page === Router.LEGACY)
			return this.full_load(path);

		if (!page) {
			let mod;
			try {
				mod = await import(this.app.constructor.path_to_page_url(path));
			} catch (error) {
				console.error(error);
				page = new ErrorPage({ error }); // not cached — next visit retries
			}

			if (mod) {
				page = Page.from(mod.default);

				if (page) {
					this.pages.set(path, page);
				} else {
					// legacy side-effect page: renders itself on import
					this.pages.set(path, Router.LEGACY);
					if (!options.initial)
						return this.full_load(path);
					// the initial legacy page rendered into app.$app before the
					// router could track it — adopt that DOM, otherwise it stays
					// forever (current === null → never deactivated)
					page = this.adopt_legacy();
				}
			}
		}

		if (token !== this.token)
			return this.current; // a newer navigation superseded this one

		if (this.current === page)
			return page;

		if (this.current)
			this.current.deactivate();

		this.current = page;
		this.app.page = page;

		if (page)
			page.activate(this.app.$app);

		return page;
	}

	// wrap the initial legacy page's side-effect DOM in a Page, so the
	// normal activate/deactivate cycle removes it on the next navigation
	adopt_legacy() {
		const page = new Page();
		page.rendered = true; // already rendered — activate() must not re-render
		page.el.append(...this.app.$app.el.childNodes);
		return page;
	}

	// legacy pages can only render via a fresh page load
	full_load(path) {
		if (path === location.pathname) {
			location.reload();
		} else {
			this.app.$app.hide(); // hide side-effect fallout until the reload
			location.assign(path);
		}
		return null;
	}
}

Router.LEGACY = "legacy";

export { Router };
