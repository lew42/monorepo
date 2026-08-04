import { View, div, h1, a, is } from "../View/View.js";

/* css: .pages, .page, .active-page, .active-ancestor, .cols, .page-title,
   .page-link, .page-previews, .page-preview */
View.stylesheet(import.meta, "Page.css");

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

	/* Every property this class assigns after construction, declared.
	 *
	 * No initialisers and no behaviour change — the point is `alias()`, which
	 * refuses to shadow an existing property with `if (!(key in this))`. That
	 * guard was complete for the prototype and blind to these seven, so a child
	 * named `view` or `$pages` overwrote real state and blanked the page **on a
	 * cold load only** — it worked on a click, because the property had not been
	 * written yet. Declaring them makes the guard true. Found by the url seat.
	 *
	 * The side benefit is the one that pays for the lines: a reader now learns
	 * this class's whole mutable surface from the top of the file.
	 */
	view;          // built once by render(), never rebuilt
	regions;       // named child -> container, written by tabs()
	$pages;        // I claim the subtree below me
	loading;       // load_all_children()'s promise
	default_tab;   // the first tabs() set owns this page's url
	parent;        // assigned by add(), the one place
	app;           // assigned on the walk, in child()

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
		/* Adoption goes in through the CONSTRUCTOR, not after it.
		 *
		 * `initialize()` runs at the end of the constructor, so an inline page
		 * used to reach it with no parent and therefore no url — and any child it
		 * added there computed `undefinedkid/`, silently. Every route()-built page
		 * is in exactly that position. Passing `adopt` as a second argument works
		 * because the constructor is `assign(...args)` and later args win, the
		 * same shape as `new Router(this.router, { app: this })`.
		 *
		 * `new Page({…})` built by hand and passed in stays un-adopted until this
		 * line, and should: you constructed it before anything adopted it, so
		 * there was no url for it to have. Found by the url seat.
		 */
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		page.naming();
		this.children.set(name, page);
		this.alias(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	/* What render() READS, which is not the same as what the class assigns.
	 *
	 * The seven class fields above stop a child shadowing state. These three are
	 * the other half: a child named `content` makes a page render THE CHILD as
	 * its own content, silently, and one named `classes` throws
	 * "arg.split is not a function". `content` is an ordinary section name.
	 *
	 * A Set and not three more class fields — an instance field shadows a
	 * prototype method, so `content;` would break every
	 * `class X extends Page { content(){ … } }`. The seven above are safe only
	 * because none of them is ever a method.
	 */
	static reserved = new Set(["content", "classes", "col", "activated", "deactivated"]);

	alias(name, page){
		const key = name.replaceAll("-", "_");
		if (!Page.reserved.has(key) && !(key in this)) this[key] = page;
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
		 *
		 * `is.fn` and not `?.` — alias() writes a child onto `this` by name, so a
		 * child called "route" makes `this.route` a Page, and `this.route?.(name)`
		 * throws TypeError where it should have 404'd.
		 */
		const claimed = is.fn(this.route) && this.route(name);
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
		if (mine) return this.mounts_in(mine, `region of ${this.parent.log_label()}`);

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()}`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	// container() is the one step a reader of THIS file cannot see — a parent it
	// never mentions decides where it lands. Kept (it is what makes tabs, columns
	// and nested arrangements expressible at all), so the answer is to make the
	// choice observable rather than declarative. Eric's request, after ten recipes.
	mounts_in(view, claim){
		console.log(`${this.log_label()}.container() → ${claim}`);
		return view;
	}

	// Placement, and nothing else. Router.activate() calls this root-to-leaf over
	// the entering slice, so my ancestors — and their regions — already exist.
	activate(){
		const container = this.container();

		if (this.render().el.parentNode !== container.el)
			container.append(this.view);

		this.activated?.();
		return this;
	}

	// Router drops my classes a moment later and CSS takes me off screen, so
	// there is nothing to undo by default.
	deactivate(){
		this.deactivated?.();
		return this;
	}

	/* activated() / deactivated() are yours — a timer, a focus, a fetch, a
	 * <video> to release. PAGE-LOCAL things.
	 *
	 * Not global chrome: navigating UP runs neither (the page you land on never
	 * left the chain), and a pair of show/hide calls has no depth, so two pages
	 * both hiding something breaks when the first one leaves. Appearance that
	 * depends on which page is active is a class — see `hides-nav`.
	 */

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
