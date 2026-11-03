import { div, h1, a, is } from "../../View/View.js";

// A node: url, content, and children (eager or lazy); see doc/notes.md
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

	// ONE map: name → Page|null; order stable on resolve; see doc/notes.md
	declare(){
		const list = typeof this.children === "string" ? this.children.trim().split(/\s+/)
		           : this.children ?? [];

		this.children = new Map();

		list.forEach(child => typeof child === "string"
			? this.children.set(child, null)
			: this.add(child.name, child));

		return this;
	}

	// Attach child (THE one place parent assigned); adoption in constructor; doc/notes.md
	add(name, child = {}){
		// ⚠ Adoption in constructor (initialize runs end); assign(...args) wins left-to-right
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		page.naming();
		this.children.set(name, page);
		this.alias(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	// Reserved child names (Set not fields); alias() guard block; doc/notes.md
	static reserved = new Set(["content", "classes", "col"]);

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

	// child() routing: memory → filesystem → route(); ONE place app handed down
	async child(name){
		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app });             // here already

		if (known === null){                                           // declared — go get it
			console.log(`${this.log_label()}.child("${name}") — import("${this.url + name}/page.js")`);
			const page = await Page.load(this.url + name + "/");
			return page ? this.add(name, page) : null;
		}

		// ⚠ route() after DECLARATION not filesystem; is.fn not ?. (alias writes by name)
		const claimed = is.fn(this.route) && this.route(name);
		return claimed ? this.add(name, claimed) : null;
	}

	// ⚠ Module throw != missing; swallowing both hides syntax errors
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

	// container() hierarchy: regions → $pages → app.$pages; doc/notes.md
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

		return this;
	}

	// Nothing to undo by default (Router drops classes, CSS hides)
	deactivate(){ return this; }

	// built once, so nothing is ever thrown away and rebuilt
	render(){
		if (this.view) return this.view;

		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			// Function builds content; other types ARE content
			return is.fn(this.content) ? this.content() : this.content;
		})
			.ac(this.name && "page-" + this.name)   // style THIS page
			.ac(this.col)                            // per-page column width
			.ac(this.classes);                       // style pages LIKE this one

		console.groupEnd();
		return this.view;
	}

	// Navigate (programmatic twin of link click)
	go(){ return this.app.router.go(this.url); }

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	preview(){ return a.c("page-preview", this.title).href(this.url); }

	// previews() synchronous (not async child() calls); POJO never adopted; doc/notes.md
	previews(){
		return div.c("page-previews", () => this.children.forEach((page, name) =>
			page ? page.preview() : a.c("page-preview", name).href(this.url + name + "/")));
	}

	// Import every declared child (opt-in for real tab titles)
	load_all_children(){
		return this.loading = Promise.all([...this.children.keys()].map(name => this.child(name)));
	}

	// tabs() at placement not on child; ONE imported (first); default only on FIRST set; doc/notes.md
	tabs(names){
		const list = names ? names.trim().split(/\s+/) : [...this.children.keys()];
		const owns_url = !this.default_tab && (this.default_tab = list[0]);
		let $bar, $panel;

		// Placed NOW (captor still ours); filled when first tab lands
		const $tabs = div.c("tabs", () => {
			$bar = div.c("tab-bar");
			$panel = div.c("tab-panel");
		});

		this.regions ??= new Map();
		list.forEach(name => this.regions.set(name, $panel));

		// First always loaded; rest stay names (bar-reads-differently bug)
		const label = (name, i) => {
			const page = this.children.get(name);
			return (this.loading || i === 0) && page?.title ? page.title : name;
		};

		const filling = Promise.resolve(this.loading ?? this.child(list[0])).then(() => {
			$bar.append(() => list.forEach((name, i) =>
				a.c("tab", label(name, i))
					.href(owns_url && !i ? this.url : this.url + name + "/")));

			// EVERY set renders default; which shows read from url (reload reproduces click)
			const first = this.children.get(list[0]);
			if (first) $panel.append(first.render().ac("default"));

			// Built after mark() ran; need explicit mark_links() call
			this.app?.router?.mark_links();
		});

		// Cold load waits for bar render before showing empty panel
		this.app?.loaders.push(filling);

		return $tabs;
	}
}

export default Page;
