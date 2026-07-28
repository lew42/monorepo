import { View, div, h1, a, span, is } from "../View/View.js";

// the look of what this class renders — page, title, link/crumb/preview
View.stylesheet(import.meta, "Page.css");

/**
 * Page — a titled, linkable, dormant unit of content.
 *
 * Dormant: creating a Page renders nothing, so `export default new Page(...)`
 * is always import-safe. It renders when something places it (a Pager, or
 * View.append → render()).
 *
 * A Page knows three things and no more:
 *   1. its content       — content() (or a string/view)
 *   2. its place in a tree — children (declared) + parent (adopted, see below)
 *   3. how to link to itself — link() / crumb() / preview()
 *
 * It does NOT know about routing (that's Router) or layout/structure (that's a
 * Pager / ColumnPager). Those are separate, opt-in concerns.
 *
 * ── The tree & adoption ──────────────────────────────────────────────
 * A parent declares `children: [a, b]`. In the constructor it *adopts* them:
 * `child.parent = this`. Because a child module is imported (and constructed)
 * before its parent, the children already exist when the parent runs — so this
 * is plain, safe assignment, no import cycle. Imports flow DOWN (parent imports
 * child); `.parent` links point UP. See michael/loading.md for the full analysis.
 *
 * ── The registry ─────────────────────────────────────────────────────
 * Every Page with a url registers itself in `Page.registry` (url → page), so a
 * Router or ColumnPager can resolve a path to a live page synchronously, no
 * dynamic import. (Only works for already-loaded pages; that's the point of
 * eager-loading a topic's subtree — see loading.md §5–7.)
 */
export default class Page {

	static registry = new Map();

	constructor(...args){
		this.assign(...args);

		// adopt declared children (wire the upward .parent links)
		if (this.children)
			this.children.forEach(child => child.parent = this);

		// register for synchronous url → page lookup
		if (this.meta || this._url)
			Page.registry.set(this.url, this);
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	// ── url (derived from import.meta, so links are never hard-coded) ──
	// "/docs/page.js"   -> "/docs/"
	// "/docs/x.page.js" -> "/docs/x"
	set url(url){ this._url = url; }

	get url(){
		if (this._url)
			return this._url;

		const path = new URL(this.meta.url).pathname;

		if (path.endsWith("/page.js"))
			return path.slice(0, -"page.js".length); // keep trailing slash

		if (path.endsWith(".page.js"))
			return path.slice(0, -".page.js".length);

		return path;
	}

	// ── tree walking (synchronous, via the adopted .parent links) ──
	// [root … this]
	get chain(){
		const chain = [this];
		let p = this;
		while (p.parent){ p = p.parent; chain.unshift(p); }
		return chain;
	}

	get root(){
		let p = this;
		while (p.parent) p = p.parent;
		return p;
	}

	// nearest ancestor (incl. self) that owns a `pager`, else self.
	// This is who should render when THIS page is the target: a deep page under
	// a ColumnPager topic returns the topic; a plain page returns itself.
	host(){
		let p = this;
		while (p){ if (p.pager) return p; p = p.parent; }
		return this;
	}

	// "/a/b/" -> "/a/", "/a/b" -> "/a/", top-level -> null. URL string math, used
	// only by the loader to climb ancestors when the tree isn't already loaded
	// (the `.parent` links come from adoption; this derives the url to import).
	get parent_url(){
		const trimmed = this.url.endsWith("/") ? this.url.slice(0, -1) : this.url;
		const i = trimmed.lastIndexOf("/");
		return i <= 0 ? null : trimmed.slice(0, i + 1);
	}

	// ── loading (the filesystem router) ──
	// The inverse of the `url` getter above: a page url → the module that defines
	// it. Both directions of the one convention, side by side.
	// "/" -> "/page.js", "/a/" -> "/a/page.js", "/a/b" -> "/a/b.page.js"
	static module_url(url){
		return url.endsWith("/") ? url + "page.js" : url + ".page.js";
	}

	// Import the page for `url`. Returns whatever the module default-exported —
	// a Page, a view, a function, or undefined (a "bare page" that rendered
	// itself at module top). App.load_page is the caller; it duck-types the rest.
	static async load(url = window.location.pathname){
		const page = (await import(Page.module_url(url))).default;

		if (page instanceof Page)
			await page.load_ancestors();

		return page;
	}

	// A deep page (/a/b/c/) is imported alone, so its ancestors — and the layout
	// one of them may own — aren't loaded. Climb the url importing them; adoption
	// wires `.parent` as each constructs, so host() can then find the topic.
	// A page with no pager-owning ancestor (or an already-loaded one) = no-op.
	async load_ancestors(){
		let url = this.parent_url;

		while (!this.host().pager && url){
			let parent;
			try { parent = (await import(Page.module_url(url))).default; }
			catch { break; }                      // no page.js up there — stop climbing
			if (!(parent instanceof Page)) break; // reached the site root / a bare page
			url = parent.parent_url;
		}

		return this;
	}

	// ── rendering ──
	// render() is what a container places. If this page declares a `pager`
	// (a layout class like ColumnPager), instantiate it; otherwise plain content.
	//
	// `app` is forwarded, not looked up: App assigns it to us in load_page (see
	// the adoption note there), and a Pager needs it for `app.page` / `app.router`.
	// A Page never uses `app` itself — it's purely a conduit to the layout tier.
	render(){
		return this.pager ? new this.pager({ root: this, app: this.app }) : this.body();
	}

	// body() is ALWAYS the plain content (title + content). A ColumnPager fills
	// its columns with body() — never render() — so a topic that owns a pager
	// doesn't recurse into it when shown as a column.
	body(){
		return this.view = div.c("page", () => {
			if (this.title)
				h1.c("page-title", this.title);

			if (is.fn(this.content))
				return this.content.call(this, this); // this === the page
			else
				return this.content; // string / view / array / undefined
		}).ac(this.classes);
	}

	// ── link representations (plain anchors — a Router intercepts the clicks) ──
	link(text){
		return a.c("page-link", text ?? this.title).href(this.url);
	}

	crumb(){
		return a.c("page-crumb", this.title).href(this.url);
	}

	// a preview card, for a parent to list this child
	preview(){
		return a.c("page-preview").href(this.url).append(() => {
			div.c("page-preview-title", this.title);
			if (this.description)
				div.c("page-preview-desc", this.description);
		});
	}

	// render all children as preview cards (call inside a parent's content())
	previews(){
		return div.c("page-previews", () => {
			(this.children || []).forEach(child => child.preview());
		});
	}

	// ── activation: document-level side effects for THE current page ──
	activate(){
		if (this.title)
			document.title = this.title;

		if (this.description)
			this.describe(this.description);

		if (this.theme)
			View.body().ac(this.theme);

		return this;
	}

	deactivate(){
		if (this.theme)
			View.body().rc(this.theme);

		return this;
	}

	describe(text){
		let meta = document.head.querySelector('meta[name="description"]');

		if (!meta){
			meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			document.head.append(meta);
		}

		meta.setAttribute("content", text);
	}
}

export { Page };
