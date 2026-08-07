import { View, div, h1, a, span, icon, is } from "../View/View.js";

/* css: .pages, .page, .active-page, .active-ancestor, .page-title,
   .page-link, .page-previews, .page-preview, .page-preview-title */
View.stylesheet(import.meta, "Page.css");

/* A node: a url, some content, and children declared either way —
 *
 *     children: [intro]        eager — imported with me
 *     children: "intro guide"  lazy  — imported when walked to
 *
 * Both compose at any depth. Design record: core/Page/readme.md.
 */
export class Page {

	/* Declared so `alias()`'s `if (!(key in this))` guard can see them. Without
	 * this, a child named `view` or `$pages` overwrote real state and blanked the
	 * page ON A COLD LOAD ONLY — it worked on a click, because the property had not
	 * been written yet. */
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
		this.initialize?.();   // the seam for inline children — add() them here

		console.log(`new ${this.log_label()} — "${this.title}", children [${[...this.children.keys()].join(", ")}]`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	// Idempotent, so construction and adoption cannot produce different objects.
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
	 * Setting an existing key never moves it, so a name keeps its declared position
	 * when it resolves.
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

	/* Attach a child. THE one place `parent` is assigned. Four shapes:
	 *
	 *   add("alpha", "just some text")              a string IS the content
	 *   add("alpha", () => p("hi"))                 a content function
	 *   add("alpha", { title: "A", content(){} })   options
	 *   add("alpha", new Page({ … }))               a Page you built
	 *
	 * The url is MINE plus the name, so an inline page never writes a path and
	 * moving a parent moves its whole subtree with it.
	 */
	add(name, child = {}){
		// Adoption goes in through the CONSTRUCTOR, not after it: initialize() runs
		// at the end of it, and an inline page used to reach there with no parent and
		// therefore no url — so any child IT added computed `undefinedkid/`, silently.
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		page.naming();
		this.children.set(name, page);
		this.alias(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	/* What render() READS, which is not the same as what the class assigns above:
	 * a child named `content` would make a page render THE CHILD as its own
	 * content, silently, and one named `classes` throws "arg.split is not a
	 * function". A Set and not more class fields — an instance field shadows a
	 * prototype method, so `content;` would break every subclass defining one.
	 */
	static reserved = new Set(["content", "classes", "col", "icon", "activated", "deactivated"]);

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
	 * Also the ONE place `app` is handed down — on the walk, to the page about to
	 * need it. Safe to call twice for the same name before the first resolves: the
	 * module registry hands both callers the same module.
	 */
	async child(name){
		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app });             // here already

		if (known === null){                                           // declared — go get it
			console.log(`${this.log_label()}.child("${name}") — import("${this.url + name}/page.js")`);
			const page = await Page.load(this.url + name + "/");
			return page ? this.add(name, page) : null;
		}

		/* Never declared. I may still claim it — route() is how a page owns urls it
		 * could not list in advance (`/items/42/`). It runs after the DECLARATION and
		 * before nothing, so a dynamic name costs no doomed 404 and structurally
		 * cannot shadow a page.js.
		 *
		 * `is.fn` and not `?.` — alias() writes a child onto `this` by name, so a
		 * child called "route" makes `this.route` a Page and `this.route?.(name)`
		 * throws where it should have 404'd.
		 */
		const claimed = is.fn(this.route) && this.route(name);
		return claimed ? this.add(name, claimed) : null;
	}

	// A module that throws is NOT a module that isn't there. Swallowing both turns a
	// syntax error in a page you just wrote into a silent 404.
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
	 *   3. the app                                      — the default, flat
	 */
	container(){
		const mine = this.parent?.regions?.get(this.name);
		if (mine) return this.mounts_in(mine, `region of ${this.parent.log_label()}`);

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()}`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	// container() is the one step a reader of THIS file cannot see — a parent it
	// never mentions decides where it lands. So the choice is logged rather than
	// silent.
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

	// Router drops my classes a moment later and CSS takes me off screen, so there
	// is nothing to undo by default. `activated()`/`deactivated()` are yours, for
	// PAGE-LOCAL things — a timer, a focus, a <video> to release.
	deactivate(){
		this.deactivated?.();
		return this;
	}

	// built once, so nothing is ever thrown away and rebuilt
	render(){
		if (this.view) return this.view;

		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			// a function builds; anything else IS the content — a string, a view, an
			// array. The capture callback's return value is appended.
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

	/* How I present a child in navigation, answerable WITHOUT importing it.
	 *
	 *     nav: { start: "Start here" }                   // just a label
	 *     nav: { core: { label: "Core", icon: "grid" } } // and an icon
	 *
	 * Three sources, weakest first: the segment, then the child's own `title` and
	 * `icon` once it is imported, then whatever I declare here. So an icon lives on
	 * the page it belongs to — change it once and every menu follows — and a parent
	 * that needs a different word for one menu still has the last say.
	 *
	 * Synchronous, and it must stay that way: awaiting child() here would import
	 * every declared child just to read its title. `load_all_children()` is the
	 * explicit way to buy that.
	 */
	nav_for(name){
		const child = this.children.get(name);
		const entry = this.nav?.[name];

		return {
			url: this.url + name + "/",
			label: child?.title ?? name,
			icon: child?.icon,
			...(is.str(entry) ? { label: entry } : entry),
		};
	}

	// A card per child. Real titles and icons if this page opted into
	// load_all_children() — the Router waited for it before rendering me — and
	// bare declared names forever if it stayed lazy: the honest, visible cost.
	previews(){
		return div.c("page-previews", () => this.cards());
	}

	// one card per child, into whatever is capturing
	cards(){
		this.children.forEach((page, name) => {
			const nav = this.nav_for(name);

			a.c("page-preview").href(nav.url).append(() => {
				if (nav.icon) icon(nav.icon);
				span.c("page-preview-title", nav.label);
			});
		});
	}

	preview(){ return a.c("page-preview", this.title).href(this.url); }

	/* Import every declared child — the opt-out of laziness, and the reason to want
	 * it is that titles and icons then live on the pages themselves instead of being
	 * repeated by every menu that lists them. Call it from initialize().
	 *
	 * Each child's own `loading` is awaited too, so opt-ins COMPOSE: this promise
	 * means "my opted-in subtree is ready", however deep the opt-ins go — and a
	 * child that stayed lazy stays lazy. Router.load() awaits the chain's `loading`
	 * before activating, so a page draws once, with real titles, never
	 * names-then-sharpen.
	 */
	load_all_children(){
		return this.loading = Promise.all([...this.children.keys()]
			.map(name => this.child(name).then(child => child?.loading)));
	}

	/* A bar of links, and the panel those children mount into. Returns the view, so
	 * you place it and class it:
	 *
	 *     this.$tabs = this.tabs("what why").ac("vertical");
	 *
	 * Which children are tabs is decided HERE, at placement — not marked on the
	 * child — so a page can have several sets, and a child in none of them renders
	 * wherever it would have anyway.
	 *
	 * The first tab's link is THIS page's url, not the child's, so /tabs/ is the
	 * default tab rather than a second url showing the same thing. Only the FIRST
	 * set can do that; a second tabs() on the same page is ordinary.
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

		// The first tab is always loaded so it can show its title. The rest stay
		// NAMES unless load_all_children() was called: a label that appears only when
		// you happen to have visited that tab is the bar-reads-differently bug.
		const label = (name, i) => {
			if (this.nav?.[name]) return this.nav_for(name).label;

			const page = this.children.get(name);
			return (this.loading || i === 0) && page?.title ? page.title : name;
		};

		const filling = Promise.resolve(this.loading ?? this.child(list[0])).then(() => {
			// `tab-default` marks the one whose href is MY url. Every sibling url
			// starts with it, so mark_links() gives it `.in-path` on every tab in the
			// set — true, and the wrong signal for a flat bar. CSS reads the class;
			// the knowledge stays here, where `owns_url` is known.
			$bar.append(() => list.forEach((name, i) =>
				a.c("tab", label(name, i))
					.ac(owns_url && !i && "tab-default")
					.href(owns_url && !i ? this.url : this.url + name + "/")));

			// EVERY set renders its default, so no panel is ever blank. Which one
			// shows is read entirely off the url, so a reload reproduces a click.
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
