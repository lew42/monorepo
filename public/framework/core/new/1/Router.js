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

		if (page) this.activate(page);
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
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export default Router;
