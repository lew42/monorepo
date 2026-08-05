/* Everything between "a url changed" and "the DOM reflects it".
 *
 * new/0's App had resolve() and mark(). Both live here now: the moment resolving
 * a segment can await an import, it stopped being boot logic. App keeps boot and
 * the one container; Router keeps the url.
 */
export class Router {

	constructor(...args){
		this.assign(...args);   // user config first, then what App injects — later wins
		this.listen();
		console.log("router.listen() — click + popstate wired");
	}

	assign(...args){ return Object.assign(this, ...args); }

	listen(){
		document.addEventListener("click", e => this.click(e));
		window.addEventListener("popstate", () => {
			console.log(`── POPSTATE ${location.pathname} ${"─".repeat(36)}`);
			this.load(location.pathname);
		});
	}

	click(e){
		const link = this.link_clicked(e);
		if (!link) return;

		e.preventDefault();
		console.log(`── CLICK ${link.pathname} ${"─".repeat(39)}`);
		this.go(link.pathname);
	}

	// the anchor this click should navigate — or null, meaning "not ours"
	link_clicked(e){
		if (e.defaultPrevented || e.button) return null;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;   // new tab

		const link = e.target.closest?.("a[href]");
		if (!link || link.target || link.hasAttribute("download")) return null;
		if (link.origin !== location.origin) return null;                   // external
		if (link.hash && link.pathname === location.pathname) return null;  // #section
		if (/\.\w+$/.test(link.pathname)) return null;                      // /readme.md

		return link;
	}

	/* Load first, push second: a failed navigation leaves no history entry.
	 *
	 * There is no synchronous "is this a real page" gate any more. core/Router
	 * asked Page.registry, which cannot answer for a child that hasn't been
	 * imported — exactly the pages laziness exists for. So: try the walk, and
	 * hand the url to the browser only if it genuinely doesn't resolve.
	 */
	async go(url){
		console.log(`router.go("${url}")`);

		if (await this.load(url)){
			history.pushState({}, "", url);
			console.log(`  ↳ history.pushState("${url}")`);
		} else {
			console.log(`  ↳ load failed — handing "${url}" to the browser`);
			location.assign(url);
		}
	}

	async load(url){
		const page = await this.load_segments(url);

		if (page){
			/* A page imported on THIS navigation has just called View.stylesheet()
			 * at module scope, and its <link> is not in document.styleSheets yet —
			 * so without this the page's first render paints unstyled and then
			 * snaps. Only the first visit; every later one is already resolved.
			 *
			 * Here and NOT inside activate(), which must stay synchronous: its
			 * "no awaits past this point" guarantee is what lets a site wrap the
			 * whole swap in document.startViewTransition(). Found by the motion
			 * seat, whose missing animation was simply louder than a missing margin.
			 */
			await this.app.styles_loaded();
			this.activate(page);
		}
		else console.log(`router.load("${url}") — 404, nothing resolves it`);

		return !!page;
	}

	// The walk IS the loader. Each hop awaits page.child(name), which imports on a
	// miss — so when this returns, every page in the chain exists, root-to-leaf,
	// with parent and app already assigned.
	async load_segments(url){
		let page = this.app.root;

		for (const name of url.split("/").filter(Boolean)){
			page = await page.child(name);
			if (!page) return null;
		}

		return page;
	}

	/* Make THIS the current page. `page.activate()` means the other thing — "I am
	 * entering the chain" — and the two only ever meet inside this method, which
	 * is exactly where a reader wants to see the relationship.
	 *
	 * Only what changed: shared leading pages are never touched.
	 */
	activate(page){
		const from = this.chain();                     // /a/b/c/ -> [root, a, b, c]
		const to = page.chain();                       // /a/x/   -> [root, a, x]
		const shared = this.shared_depth(from, to);    // 2 — root, a stay

		// no awaits past this point, so the group is guaranteed to close
		console.groupCollapsed(`router.activate(${page.log_label()})`);

		from.slice(shared).reverse().forEach(p => p.deactivate());   // deepest first
		to.slice(shared).forEach(p => p.activate());                 // shallowest first

		this.active = page;
		this.mark();
		document.title = page.title ?? document.title;

		/* A page you navigate to starts at the top. The REGION scrolls, not the
		 * page (Page.css), so one scroll position is shared by everything mounted
		 * in it — arriving halfway down a page you have never seen is not a
		 * feature. Back lands at the top too; remembering a position per url is a
		 * Map that has to be written on every navigation and never gets cleaned up,
		 * and nobody has asked to return mid-page yet.
		 *
		 * `.closest(".pages")` and not `parentNode`: a page mounted in a tab panel
		 * has `.tab-panel` as its parent, and the scroller is above that. `.pages`
		 * is the arrangement contract's own class, so this asks for the contract.
		 *
		 * Worth knowing why this looked unnecessary: the browser clamps scrollTop
		 * to the new content height, so navigating to a SHORT page self-corrects
		 * and reads as working. It only misbehaves when both pages are taller than
		 * the region — which is most docs pages, and none of the quick tests.
		 */
		page.view.el.closest(".pages")?.scrollTo(0, 0);

		/* "A navigation happened." Duck-typed like page.activate?.(), so it costs
		 * nothing until a site defines it — and the site is the only tier that
		 * should care. Crumbs, prev/next, closing a drawer and moving focus all
		 * need this moment and none of them can be written without it; the
		 * alternative was a hand-written super call into mark() with no subclass,
		 * in a file where nobody would guess why. Requested by the chrome seat.
		 *
		 * `from` because the hook fires on the first paint too, and two seats
		 * independently re-derived "is this the first" — one from `from.length`,
		 * one by counting. It is computed on line one of activate() and was
		 * being thrown away. */
		this.app.navigated?.(page, from);

		console.log(`from   ${from.map(p => p.url).join(" › ") || "(none)"}`);
		console.log(`to     ${to.map(p => p.url).join(" › ")}`);
		console.log(`shared ${shared} untouched`);
		console.groupEnd();
	}

	chain(){ return this.active ? this.active.chain() : []; }

	// how many leading pages two chains have in common
	shared_depth(from, to){
		let i = 0;
		while (from[i] && from[i] === to[i]) i++;
		return i;
	}

	// Scoped to $app, never `document`. On a cold load $app is still detached —
	// a document query would find zero links and nothing would light up.
	root(){ return this.app.$app.el; }

	/* Wipe, then reapply down the NEW chain. A page that left needs nothing
	 * undone, only its classes gone — which is a query, not a lifecycle call.
	 *
	 * Two classes and a link pass. That is the whole of what this tier writes;
	 * every arrangement is CSS a page or a site opted into by name. No `order`
	 * either — pages are appended root-to-leaf and never moved, so DOM order is
	 * already chain order.
	 */
	mark(){
		this.root().querySelectorAll(".active-page, .active-ancestor")
			.forEach(node => node.classList.remove("active-page", "active-ancestor"));

		this.chain().forEach(page =>
			page.view.ac(page === this.active ? "active-page" : "active-ancestor"));

		this.mark_links(this.active.url);
	}

	/* `here` is the ACTIVE PAGE'S url, not location.pathname: go() pushes history
	 * only after the load succeeds, so mid-navigation the browser still shows the
	 * url we're leaving. The page knows where it is; ask it.
	 *
	 * Callable with no argument so anything that renders links LATE can re-run it
	 * — a tab bar filled after an import has missed the pass that mark() did.
	 */
	mark_links(here = this.active?.url){
		if (!here) return;

		this.root().querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;

			/* An in-page anchor resolves its .pathname to the page you are ON, so
			 * every `href="#section"` matched `here` and got .active — measured 9
			 * of 9 by the content seat. Ask the ATTRIBUTE, not the resolved url:
			 * a fragment link is a scroll, never a destination. */
			if (link.getAttribute("href")?.startsWith("#")) return;
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export default Router;
