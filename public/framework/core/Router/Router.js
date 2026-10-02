import { Page } from "../Page/Page.class.js";

export class Router {

	constructor(...args){
		this.assign(...args);
		this.listen();
	}

	assign(...args){ return Object.assign(this, ...args); }

	listen(){
		document.addEventListener("click", e => this.click(e));
		window.addEventListener("popstate", () => this.popped());
	}

	// Back/Forward. An entry that stays on the page already showing (only its
	// `?query` or `#hash` differs — the phone's ✦ sheet steps, ext/drawer/rail.js)
	// is not a navigation: reloading it scrolled the page to the top and re-fired
	// `navigated()` on every step (sheet-as-page, 2026-09-30).
	//
	// ⚠ `navigated()` fires HERE, not inside `activate()` any more (nav-before-push,
	// one-dictation bug 3/4) — see `go()`'s own comment for why.
	popped(){
		if (this.active && location.pathname === this.path) return;
		this.load(location.pathname).then(ok => { if (ok) this.app.navigated?.(this.active, this._nav_from); });
	}

	click(e){
		const link = this.link_clicked(e);
		if (!link) return;

		e.preventDefault();

		// THE PAGE THAT HOLDS THE LINK DECIDES where it opens: a url to go to, or
		// nothing when it showed the link itself. The link carries no target.
		// core/Page/doc/open.md.
		const page = Page.of(link) ?? this.active;
		const url = page ? page.open_link(link) : link.pathname;
		if (!url) return;

		// ⚠ The whole url — `pathname` alone silently ATE the fragment on a
		// cross-page link. Where it LANDS is still the top; readme.md's Open list.
		this.go(url + link.search + link.hash);
	}

	// the anchor this click should navigate — or null, meaning "not ours"
	link_clicked(e){
		if (e.defaultPrevented || e.button) return null;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;   // new tab

		const link = e.target.closest?.("a[href]");
		if (!link || link.target || link.hasAttribute("download")) return null;
		if (link.origin !== location.origin) return null;                   // external
		if (link.hash && link.pathname === location.pathname) return null;  // #section
		if (/\.md$/i.test(link.pathname)) return link.search ? null : link; // x.md opens its page; x.md?raw the file
		if (/\.\w+$/.test(link.pathname)) return null;                      // /style.css

		return link;
	}

	// Load first, push second, so a failed navigation leaves no history entry. There
	// is no synchronous "is this a real page" gate — see doc/registry-gate.md.
	//
	// ⚠ NAV-BEFORE-PUSH (one-dictation, bug 3/4, 2026-10-01 — proven headless: a mount
	// that reads `drawer.page()`/`location.pathname` from inside `navigated()` got the
	// PAGE IT LEFT, forever one step behind, because `activate()` (which used to call
	// `app.navigated?.()` itself) always ran — and finished — before the line below
	// ever touched the url. `go()` now calls `navigated()` itself, AFTER `pushState()`,
	// so anything that reads the current page from inside it sees the page it just
	// arrived at, not the one before. `popped()` (Back/Forward) calls it right after
	// its own `load()` instead, since the browser already moved `location` before
	// `popped()` ever runs — reordering here would do nothing for that path and isn't
	// needed. `this._nav_from` is set by `activate()`, read here a tick later.
	async go(url){
		// The walk resolves the PATH; history keeps the whole url.
		if (await this.load(new URL(url, location.origin).pathname)){
			history.pushState({}, "", url);
			this.app.navigated?.(this.active, this._nav_from);
		} else {
			location.assign(url);
		}
	}

	async load(url){
		const page = await this.load_segments(url);

		if (page){
			// Awaited HERE, never in activate(), which must stay synchronous for
			// document.startViewTransition(). allSettled: a broken child or a 404'd
			// stylesheet must not block navigation. doc/styles-loaded.md.
			await this.app.styles_loaded();
			await Promise.allSettled(page.chain().map(p => p.loading));

			this.activate(page);
			this.path = url;   // the path showing now — `popped()` compares against it
		}

		return !!page;
	}

	// The walk IS the loader: each hop awaits page.child(name), which imports on a
	// miss — so when this returns the whole chain exists, with parent and app set.
	async load_segments(url){
		let page = this.app.root;

		for (const name of url.split("/").filter(Boolean)){
			page = await page.child(name);
			if (!page) return null;
		}

		return page;
	}

	// Only what changed: shared leading pages are never touched. doc/chain-diff.md.
	activate(page){
		const from = this.chain();                     // /a/b/c/ -> [root, a, b, c]
		const to = page.chain();                       // /a/x/   -> [root, a, x]
		const shared = this.shared_depth(from, to);    // 2 — root, a stay

		// no awaits past this point — activate() must stay synchronous
		from.slice(shared).reverse().forEach(p => p.deactivate());   // deepest first
		to.slice(shared).forEach(p => p.activate());                 // shallowest first

		this.active = page;
		this._nav_from = from;   // read a tick later, by whichever caller fires navigated() — go() or popped()
		this.mark();
		document.title = page.title ?? document.title;

		// ⚠ The REGION scrolls, not the page — hence `.closest(".pages")`. Removing
		// this looks safe (scrollTop clamps); it isn't. doc/scroll-reset.md.
		page.view.el.closest(".pages")?.scrollTo(0, 0);

		// `navigated()` (duck-typed; doc/navigated.md) is NOT called here any more —
		// `go()`/`popped()` call it themselves, each after `location` truly reflects
		// this page (see `go()`'s own "nav-before-push" comment). Calling it here ran
		// it before `go()`'s `history.pushState()`, so anything reading the current
		// page from inside it (`ext/drawer/rail.js`'s ✦ sheet, `drawer.page()`) saw
		// the page just LEFT, not the one just reached.
	}

	chain(){ return this.active ? this.active.chain() : []; }

	// how many leading pages two chains have in common
	shared_depth(from, to){
		let i = 0;
		while (from[i] && from[i] === to[i]) i++;
		return i;
	}

	// ⚠ Scoped to $app, never `document`: on a cold load $app is still detached, so
	// a document query would find zero links and nothing would light up.
	root(){ return this.app.$app.el; }

	// Unmark what I marked, then mark the new chain — a page that left needs nothing
	// undone, only its classes gone. ⚠ Never a query across $app: it would also strip
	// the marks a widget wrote on a page of its own. doc/marking.md.
	mark(){
		this.marked?.forEach(view => view.rc("active-page active-ancestor"));

		this.marked = this.chain().map(page =>
			page.view.ac(page === this.active ? "active-page" : "active-ancestor"));

		this.mark_links(this.active.url);
	}

	// ⚠ `here` is the ACTIVE PAGE'S url, not location.pathname — go() pushes history
	// only after the load succeeds. Callable bare, so links rendered late can re-run.
	mark_links(here = this.active?.url){
		if (!here) return;

		this.root().querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;

			// ⚠ Ask the ATTRIBUTE: an in-page anchor resolves its .pathname to the
			// page you are ON, so every href="#section" would match `here`.
			if (link.getAttribute("href")?.startsWith("#")) return;

			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export default Router;
