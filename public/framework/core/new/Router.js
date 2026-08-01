export class Router {

	// the one piece of state. everything else is derived from the tree.
	active = null;

	constructor(...args){
		this.assign(...args);
		this.listen();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// [root … active] — computed from .parent links, never stored
	pages(){ return this.active ? this.active.chain() : []; }

	// ── input ─────────────────────────────────────────────────

	listen(){
		document.addEventListener("click", e => this.click(e));
		window.addEventListener("popstate", () => this.load(location.pathname));
	}

	click(e){
		if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

		const el = e.target.closest?.("a[href]");
		if (!el || el.target || el.hasAttribute("download")) return;
		if (el.origin !== location.origin) return;
		if (el.hash && el.pathname === location.pathname) return;
		if (/\.\w+$/.test(el.pathname)) return;   // /readme.md — not a page

		e.preventDefault();
		this.go(el.pathname);
	}

	// load first, push after: a failed navigation leaves no history entry
	async go(url){
		if (await this.load(url) === false) return location.assign(url);
		if (url !== location.pathname) history.pushState({}, "", url);
	}

	// ── url -> page ───────────────────────────────────────────
	// walk one segment at a time; each page resolves its own child.
	// `add()` sets .parent as we go, so the last page knows the whole path.

	async load(url){
		this.loading = url;

		let page = this.app.root;

		for (const name of url.split("/").filter(Boolean)){
			page = await page.child(name);
			if (!page) return false;
		}

		if (this.loading !== url) return true;   // a newer navigation started
		this.show(page);
		return true;
	}

	// ── swap ──────────────────────────────────────────────────
	// only what changed: shared leading pages are never touched.

	show(page){
		const from = this.pages(); // /a/b/c/d/
		const to = page.chain(); // /a/b/x/y/

		// find common ancestor, /a/b/, keep = 1
		let keep = 0;
		while (from[keep] && from[keep] === to[keep]) keep++;

		// deactivate d then c
		for (const p of from.slice(keep).reverse()) p.deactivate();
		
		// activate x then y
		for (const p of to.slice(keep)) p.activate();

		this.active = page;
		this.mark();
		document.title = page.title ?? document.title;
	}

	mark(){
		for (const p of this.pages()){
			p.active = true;
			p.active_page = p === this.active;
			p.active_ancestor = !p.active_page;
			p.view?.tc("active-page", p.active_page).tc("active-ancestor", p.active_ancestor);
		}
	}
}

export default Router;
