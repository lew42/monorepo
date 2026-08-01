import { View, div, h1, a } from "../View/View.js";

export class Page {

	constructor(...args){
		this.children = {};
		this.assign(...args);
		this.initialize?.();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// "/docs/page.js" -> "/docs/"
	get url(){
		return this._url ?? new URL(".", this.meta.url).pathname;
	}

	set url(url){ this._url = url; }

	// ── the tree ──────────────────────────────────────────────

	add(name, page){
		page.name = name;
		page.parent = this;
		page.app = this.app;
		this.children[name] = page;

		// convenience — pg.comments.preview(). never clobbers a real property,
		// so a page named "title" or "url" can't break the page it's added to.
		if (!(name in this)) this[name] = page;

		return page;
	}

	// resolve ONE path segment. memory first, then the filesystem,
	// then let the page claim it (dynamic pages).
	async child(name){
		if (Object.hasOwn(this.children, name)) return this.children[name];

		const page = await Page.import(this.url + name + "/");
		if (page) return this.add(name, page);

		return this.route?.(name) ?? null;
	}

	static async import(url){
		try { return (await import(url + "page.js")).default ?? null; }
		catch { return null; }
	}

	// [root … this] — walks .parent, so it's a method, not a property
	// Called from router.show(page)
	chain(){
		const chain = [this];
		for (let p = this; p.parent; ) chain.unshift(p = p.parent);
		return chain;
	}

	// ── rendering ─────────────────────────────────────────────
	// built once. `content` is yours; `$content` is what a container
	// hides when a child takes over.

	render(){
		return this.view ??= div.c("page", () => {
			this.$content = div.c("page-content", () => {
				if (this.title) h1.c("page-title", this.title);
				this.content?.();
			});
		});
	}

	// ── being shown ───────────────────────────────────────────
	// the Router calls these. `parent ?? app` is whoever contains me.

	activate(){
		(this.parent ?? this.app).show(this);
	}

	deactivate(){
		(this.parent ?? this.app).hide(this);
	}

	// ── showing a child ───────────────────────────────────────
	// THE extension point. default: the child replaces my content.
	// override for columns, tabs, or anything else.

	show(child){
		this.$content.hide();
		this.view.append(child.render());
	}

	hide(child){
		child.view.remove();
		this.$content.show();
	}

	// ── links ─────────────────────────────────────────────────

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	go(){ return this.app.router.go(this.url); }
}

export default Page;
