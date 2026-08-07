/* Everything between "a url changed" and "the DOM reflects it".
 *
 * App keeps boot and the one container; Router keeps the url. Design record —
 * the walk, the chain diff, and what was backed out: core/Router/readme.md.
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

	// Load first, push second: a failed navigation leaves no history entry. There is
	// no synchronous "is this a real page" gate — that cannot be answered for a child
	// nobody has imported, which is exactly the pages laziness exists for.
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
			// Styles, then titles, awaited HERE and not in activate(), which must stay
			// synchronous (document.startViewTransition). allSettled: a broken child or
			// a 404'd stylesheet must not block navigation. See doc/styles-loaded.md.
			await this.app.styles_loaded();
			await Promise.allSettled(page.chain().map(p => p.loading));

			this.activate(page);
		}
		else console.log(`router.load("${url}") — 404, nothing resolves it`);

		return !!page;
	}

	// The walk IS the loader. Each hop awaits page.child(name), which imports on a
	// miss — so when this returns, every page in the chain exists, root-to-leaf, with
	// parent and app already assigned.
	async load_segments(url){
		let page = this.app.root;

		for (const name of url.split("/").filter(Boolean)){
			page = await page.child(name);
			if (!page) return null;
		}

		return page;
	}

	/* Make THIS the current page — and only what changed: shared leading pages are
	 * never touched. `page.activate()` means the other thing, "I am entering the
	 * chain"; the two only meet here. See doc/chain-diff.md. */
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

		// The REGION scrolls, not the page — hence `.closest(".pages")`, not
		// parentNode. Removing this looks safe (scrollTop clamps); it isn't.
		// See doc/scroll-reset.md.
		page.view.el.closest(".pages")?.scrollTo(0, 0);

		// "A navigation happened." Duck-typed, so it costs nothing until a site
		// defines it. `from` too — the hook fires on first paint. doc/navigated.md.
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

	// Scoped to $app, never `document`. On a cold load $app is still detached — a
	// document query would find zero links and nothing would light up.
	root(){ return this.app.$app.el; }

	/* Wipe, then reapply down the NEW chain. A page that left needs nothing undone,
	 * only its classes gone — a query, not a lifecycle call. See doc/marking.md. */
	mark(){
		this.root().querySelectorAll(".active-page, .active-ancestor")
			.forEach(node => node.classList.remove("active-page", "active-ancestor"));

		this.chain().forEach(page =>
			page.view.ac(page === this.active ? "active-page" : "active-ancestor"));

		this.mark_links(this.active.url);
	}

	/* `here` is the ACTIVE PAGE'S url, not location.pathname — go() pushes history
	 * only after the load succeeds. Callable with no argument, so links rendered
	 * late (a tab bar) can re-run the pass. See doc/marking.md. */
	mark_links(here = this.active?.url){
		if (!here) return;

		this.root().querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;

			// Ask the ATTRIBUTE: an in-page anchor resolves its .pathname to the page
			// you are ON, so every href="#section" would match `here`.
			if (link.getAttribute("href")?.startsWith("#")) return;

			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export default Router;
