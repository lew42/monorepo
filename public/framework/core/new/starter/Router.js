// chains are identified by path — a title can repeat, a url can't
const urls = pages => pages.map(page => page.url).join(" › ") || "(none)";

export class Router {

	constructor(...args){
		this.assign(...args);
		this.listen();
		console.log("router.listen() — click + popstate wired");
	}

	assign(...args){ return Object.assign(this, ...args); }

	// ── listening ─────────────────────────────────────────────

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

	// ── navigating ────────────────────────────────────────────
	// load first, then push: a failed navigation leaves no history entry.

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
		console.group(`router.load("${url}")`);

		const page = await this.load_segments(url);

		if (page) this.activate(page);
		else console.log(`  ↳ 404 — nothing resolves "${url}"`);

		console.groupEnd();
		return !!page;
	}

	// Walk the url one segment at a time, each page resolving its own child.
	// Named for its caller because that's all it is — a step of load(), not a
	// second way in. If resolving a url WITHOUT navigating ever becomes a real
	// feature, that's the moment to give it a name of its own.
	async load_segments(url){
		const segments = url.split("/").filter(Boolean);
		console.group(`router.load_segments("${url}") — [${segments.join(", ")}]`);

		let page = this.app.root;

		for (const name of segments){
			page = await page.child(name);

			if (!page){
				console.groupEnd();   // the 404 exit still has to close the group
				return null;
			}
		}

		console.log(`  ↳ chain = ${urls(page.chain())}`);
		console.groupEnd();
		return page;
	}

	// ── swapping ──────────────────────────────────────────────
	// only what changed. shared leading pages are never touched.

	activate(page){
		const from = this.chain();          // /a/b/c/d/ -> [root, a, b, c, d]
		const to = page.chain();            // /a/b/x/y/ -> [root, a, b, x, y]
		const shared = this.shared_depth(from, to);   // 3 — root, a, b stay

		const leaving = from.slice(shared).reverse();   // d, then c
		const entering = to.slice(shared);              // x, then y

		// no awaits past this point, so the group is guaranteed to close
		console.groupCollapsed(`router.activate(${page.log_label()})`);
		console.log(`from    ${urls(from)}`);
		console.log(`to      ${urls(to)}`);
		console.log(`shared  ${shared} — ${urls(to.slice(0, shared))} untouched`);

		leaving.forEach(leaver => leaver.deactivate());
		entering.forEach(enterer => enterer.activate());

		this.active = page;
		this.mark();
		document.title = page.seo_title?.() ?? page.title ?? document.title;
		console.log(`document.title = "${document.title}"`);
		console.groupEnd();
	}

	chain(){ return this.active ? this.active.chain() : []; }

	// how many leading pages two paths have in common
	shared_depth(from, to){
		let i = 0;
		while (from[i] && from[i] === to[i]) i++;
		return i;
	}

	// Everything is scoped to $app, never `document`. On a cold load $app is
	// still detached — it isn't appended to <body> until after this runs — so a
	// document query finds zero links and nothing lights up on first paint.
	root(){ return this.app.$app.el; }

	// wipe first, then re-apply: a page that left the chain must lose its class,
	// and tc() only ever touches `this` so a bulk clear across pages can't use it.
	mark(){
		this.root().querySelectorAll(".active-page, .active-ancestor")
			.forEach(el => el.classList.remove("active-page", "active-ancestor"));

		this.chain().forEach(page => {
			page.active = page === this.active ? "page" : "ancestor";
			page.view?.ac("active-" + page.active);
		});

		console.log(`router.mark() — ${this.chain().map(page => `${page.url}(${page.active})`).join(" ")}`);
		this.mark_links(this.active.url);
	}

	// One pass over $app: light up every link pointing at where we are.
	//
	// `here` is the ACTIVE PAGE'S url, not location.pathname. go() pushes state
	// only after the load succeeds, so during this call the browser is still
	// showing the url we're leaving — reading it marked every navigation one
	// step behind. The page knows where it is; ask it.
	mark_links(here){
		let active = 0, in_path = 0;

		this.root().querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;
			if (link.classList.toggle("active", link.pathname === here)) active++;
			if (link.classList.toggle("in-path", link.pathname !== here
				&& link.pathname !== "/" && here.startsWith(link.pathname))) in_path++;
		});

		console.log(`router.mark_links("${here}") — ${active} .active, ${in_path} .in-path`);
	}
}

export default Router;
