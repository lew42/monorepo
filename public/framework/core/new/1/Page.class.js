import { div, h1, a, is } from "../../View/View.js";

/* A node: a url, some content, and children declared EITHER way —
 *
 *     import intro from "./intro/page.js";
 *     new Page({ children: [intro] })        eager — imported with me
 *     new Page({ children: "intro guide" })  lazy  — imported when walked to
 *
 * Both tiers compose at any depth. The eager tier is new/0's; the lazy tier is
 * what new/0 could not have, because its recursive adopt() assumed the whole
 * tree was already in memory.
 */
export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();
		this.declare();
		this.initialize?.();   // the seam for inline children — add() them here, before anything walks

		console.log(`new ${this.log_label()} — "${this.title}", children [${[...this.children.keys()].join(", ")}]`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		this.title ??= this.name;
		return this;
	}

	/* ONE map, name -> Page | null, in declaration order.
	 *
	 *   undefined   not a child of mine        -> 404
	 *   null        declared, not loaded yet   -> import it
	 *   Page        here                       -> use it
	 *
	 * Setting an existing key never moves it, so a name keeps its declared
	 * position when it resolves — nothing has to track order separately.
	 *
	 *   children: "intro api"      names, loaded when asked for
	 *   children: [intro, api]     already-imported pages
	 *   children: [intro, "api"]   both
	 */
	declare(){
		const list = typeof this.children === "string" ? this.children.trim().split(/\s+/)
		           : this.children ?? [];

		this.children = new Map();

		list.forEach(child => typeof child === "string"
			? this.children.set(child, null)
			: this.add(child.name, child));

		return this;
	}

	/* Attach a child. THE one place `parent` is assigned. Three shapes, cheapest
	 * first — the last two are how a page with no file of its own exists:
	 *
	 *   add("alpha", "just some text")              a string IS the content
	 *   add("alpha", () => p("hi"))                 a content function
	 *   add("alpha", { title: "A", content(){} })   options
	 *   add("alpha", new Page({ … }))               a Page you built
	 *
	 * The url is MINE plus the name I'm giving it, so an inline page never writes
	 * a path and moving a parent moves its whole subtree with it.
	 */
	add(name, child = {}){
		const page = child instanceof Page ? child
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child);

		page.assign({ name, parent: this, app: this.app }).naming();
		this.children.set(name, page);
		this.alias(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	alias(name, page){
		const key = name.replaceAll("-", "_");
		if (!(key in this)) this[key] = page;
	}

	// [root … me]
	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	/* One url segment -> a page: memory, then the filesystem, then no.
	 *
	 * This is also the ONE place `app` is handed down — on the walk, to the page
	 * about to need it. Nothing recurses it over the tree at boot, so a lazy
	 * child gets it exactly the same way an eager one does.
	 *
	 * Safe to call twice for the same name before the first resolves: the module
	 * registry hands both callers the same module, so `export default new Page()`
	 * runs once.
	 */
	async child(name){
		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app });             // here already

		if (known === null){                                           // declared — go get it
			console.log(`${this.log_label()}.child("${name}") — import("${this.url + name}/page.js")`);
			const page = await Page.load(this.url + name + "/");
			return page ? this.add(name, page) : null;
		}

		/* Never declared. I may still claim it — route() is how a page owns urls
		 * it could not list in advance (`/items/42/`).
		 *
		 * It runs after the DECLARATION, not after the filesystem, which is the
		 * ordering starter got stuck on: only declared names ever hit the network,
		 * so a dynamic name costs no doomed 404, and route() structurally cannot
		 * shadow a page.js — a file you want is a file you declared.
		 */
		const claimed = this.route?.(name);
		return claimed ? this.add(name, claimed) : null;
	}

	/* A module that throws is NOT a module that isn't there, and this is the one
	 * place the distinction gets lost. Swallowing both turns a syntax error in a
	 * page you just wrote into a silent 404.
	 */
	static async load(url){
		try { return (await import(url + "page.js")).default ?? null; }
		catch (error){
			if (!Page.missing(error))
				console.error(`Page.load("${url}page.js") — the file EXISTS but failed to load:`, error);
			return null;
		}
	}

	static missing(error){
		return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
			.test(error?.message ?? "");
	}

	/* Where I mount, in order of how specific the claim is:
	 *
	 *   1. my parent put ME somewhere        `regions`  — one named child (a tab)
	 *   2. an ancestor claimed the subtree   `$pages`   — everything below it
	 *   3. the app                                       — the default, flat
	 *
	 * A page claims a subtree by assigning `this.$pages`; tabs() claims single
	 * children, which is why two tab sets on one page can't share a `$pages` and
	 * needed their own level.
	 */
	container(){
		const mine = this.parent?.regions?.get(this.name);
		if (mine) return mine;

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return page.$pages;

		return this.app.$pages;
	}

	// Placement, and nothing else. Router.activate() calls this root-to-leaf over
	// the entering slice, so my ancestors — and their regions — already exist.
	activate(){
		const container = this.container();

		if (this.render().el.parentNode !== container.el)
			container.append(this.view);

		return this;
	}

	// Nothing to undo by default — Router drops my classes a moment later and CSS
	// takes me off screen. Override to release a socket, a timer, a <video>.
	deactivate(){ return this; }

	// built once, so nothing is ever thrown away and rebuilt
	render(){
		if (this.view) return this.view;

		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			// a function builds; anything else IS the content — a string, a view,
			// an array. The capture callback's return value is appended.
			return is.fn(this.content) ? this.content() : this.content;
		})
			.ac(this.name && "page-" + this.name)   // style THIS page
			.ac(this.col)                            // per-page column width
			.ac(this.classes);                       // style pages LIKE this one

		console.groupEnd();
		return this.view;
	}

	// navigate to me — the programmatic twin of clicking my link()
	go(){ return this.app.router.go(this.url); }

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	preview(){ return a.c("page-preview", this.title).href(this.url); }

	/* Synchronous, and it must stay that way: awaiting child() here would import
	 * every declared child just to read its title, which is the whole thing
	 * laziness exists to avoid. Measured — the async version fetched all four
	 * child modules on a cold load of "/".
	 *
	 * So an unresolved child is drawn from what a name already tells us: the
	 * segment, and the url it must have. The card says "columns" until you visit
	 * it and then says "Columns". That is the honest cost, and it is visible.
	 *
	 * The POJO is never stored, never adopted, never given identity — it is a
	 * string and a url on the way to an <a>. Not the rejected stub.
	 */
	previews(){
		return div.c("page-previews", () => this.children.forEach((page, name) =>
			page ? page.preview() : a.c("page-preview", name).href(this.url + name + "/")));
	}

	// Import every declared child. Opt-in, and the only reason to want it is
	// real titles in a tab bar — see tabs(). Call it from initialize().
	load_all_children(){
		return this.loading = Promise.all([...this.children.keys()].map(name => this.child(name)));
	}

	/* A bar of links, and the panel those children mount into. Returns the view,
	 * so you place it and class it:
	 *
	 *     this.$tabs = this.tabs("what why").ac("vertical");
	 *     this.$more = this.tabs("state notes");
	 *
	 * Which children are tabs is decided HERE, at placement — not marked on the
	 * child. So a page can have several sets, and a child in none of them is an
	 * ordinary child that renders wherever it would have anyway.
	 *
	 * ONE tab is imported: the first, because it has to be rendered so that this
	 * page's own url shows something. The rest are labelled by their declared
	 * NAME, which is deterministic — a title would depend on which url you
	 * happened to arrive on, and that is exactly the bar-reads-differently bug.
	 * load_all_children() in initialize() opts into real titles for all of them.
	 *
	 * The first tab's link is THIS page's url, not the child's, so /tabs/ is the
	 * default tab rather than a second url showing the same thing. Only the FIRST
	 * set can do that — my url means one thing — so a second tabs() on the same
	 * page is ordinary: every tab links to its own url and nothing is default.
	 */
	tabs(names){
		const list = names ? names.trim().split(/\s+/) : [...this.children.keys()];
		const owns_url = !this.default_tab && (this.default_tab = list[0]);
		let $bar, $panel;

		// placed NOW, while the captor is still ours; filled once the first tab lands
		const $tabs = div.c("tabs", () => {
			$bar = div.c("tab-bar");
			$panel = div.c("tab-panel");
		});

		this.regions ??= new Map();
		list.forEach(name => this.regions.set(name, $panel));

		// The first is always loaded, so it can show its title. The rest stay
		// names: a label that appears only when you happen to have visited that
		// tab is exactly the bar-reads-differently bug.
		const label = (name, i) => {
			const page = this.children.get(name);
			return (this.loading || i === 0) && page?.title ? page.title : name;
		};

		const filling = Promise.resolve(this.loading ?? this.child(list[0])).then(() => {
			$bar.append(() => list.forEach((name, i) =>
				a.c("tab", label(name, i))
					.href(owns_url && !i ? this.url : this.url + name + "/")));

			// EVERY set renders its default — a panel whose set has nothing in the
			// chain falls back to it, so no panel is ever blank. Which one shows is
			// read entirely off the url, so a reload reproduces what clicking did.
			const first = this.children.get(list[0]);
			if (first) $panel.append(first.render().ac("default"));

			// these links were built after mark() ran, so they missed the pass
			this.app?.router?.mark_links();
		});

		// so a cold load waits for the bar instead of painting an empty one
		this.app?.loaders.push(filling);

		return $tabs;
	}
}

export default Page;
