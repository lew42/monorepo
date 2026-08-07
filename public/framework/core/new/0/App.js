import { View, div, h1, el } from "../../View/View.js";

/* No Router yet. App itself walks location.pathname to a page, because children
 * are direct imports — the whole tree already exists the moment "/page.js" is
 * imported, so resolving a url is an array walk, not a load.
 *
 * Logging is console.* called directly, never through a helper, and groups only
 * ever wrap fully synchronous work — a group opened before an await stays open
 * across it and swallows whatever logs next.
 */
export class App {

	constructor(...args){
		this.loaders = [];

		const { promise, resolve } = Promise.withResolvers();
		this.ready = Object.assign(promise, { resolve });

		this.assign(...args);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return "app"; }

	async instantiate(){
		console.log(`app.instantiate() ${location.pathname} ${"─".repeat(40)}`);

		this.config();
		this.render();
		await this.load();
		this.initialize();
		this.inject();
		this.ready.resolve();

		console.log("  ↳ app.inject() — $app appended to <body>, first paint");
	}

	// Empty on purpose. A site overrides render() for chrome and initialize()
	// for anything that needs the first page to already be on screen.
	config(){}
	initialize(){}

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$pages = div.c("pages");
		});

		// $pages, NOT $app. A page's view is built by an element factory, which
		// auto-appends to the captor — so the captor has to be the place pages
		// actually live. With $app it worked only because mount() reparented
		// every view immediately afterwards, and any other caller of render()
		// would have quietly left one stranded beside the sidebar.
		View.set_captor(this.$pages);
		console.log("app.render() — chrome built, still detached from <body>");
	}

	// The try covers activate() as well as the import: activate() renders the
	// whole chain, which runs every content() there is. Left unguarded, a throw
	// in any one of them skips inject() and paints nothing at all.
	async load(){
		console.log('app.load() — import("/page.js"); its direct imports pull the whole tree with it');

		try {
			this.root = (await import("/page.js")).default.adopt(this);

			const page = this.resolve(location.pathname);
			if (!page) throw new Error(`404 — nothing matches "${location.pathname}"`);

			page.activate();
		}
		catch (error){ return this.error(error); }

		await this.loaded();
	}

	// The whole router, for now: one segment at a time through pages that are
	// already in memory. No import, no network, no filesystem.
	resolve(pathname){
		let page = this.root;

		for (const name of pathname.split("/").filter(Boolean)){
			page = page.child(name);
			if (!page) return null;
		}

		console.log(`app.resolve("${pathname}") → ${page.log_label()}`);
		return page;
	}

	/* One page is THE page. Mark the chain, pick the mode, and let CSS decide
	 * what any of that looks like — nothing here hides or moves anything.
	 *
	 * Wipe-then-reapply rather than a diff: with every page retained forever and
	 * visibility entirely in CSS, a page that leaves the chain needs nothing
	 * undone, only its classes removed. Called by Page.activate().
	 */
	mark(page){
		this.page = page;
		const chain = page.chain();

		console.groupCollapsed(`app.mark(${page.log_label()})`);

		this.$pages.el.querySelectorAll(".active-page, .active-ancestor")
			.forEach(node => node.classList.remove("active-page", "active-ancestor"));

		// `order`, not re-appending: append() on an attached node is a
		// detach+attach, which resets the scroll position of every column.
		chain.forEach((p, i) => p.view
			.ac(p === page ? "active-page" : "active-ancestor")
			.style("order", i));

		// nearest the leaf wins, so a deep page can override its topic's mode
		this.$app.attr("data-mode", chain.findLast(p => p.mode)?.mode ?? "replace");
		this.mark_links(page.url);

		console.log(`chain   ${chain.map(p => p.url).join(" › ")}`);
		console.log(`mode    ${this.$app.el.dataset.mode}`);
		console.groupEnd();
	}

	/* One pass over $app: light up every link pointing at where we are. Same
	 * job as marking the chain, so it happens in the same place — a sidebar
	 * built once in site/app.js would otherwise only ever be right on boot.
	 *
	 * `here` is the ACTIVE PAGE'S url, not location.pathname: activate() can be
	 * called with no navigation at all, and then the browser's url is stale.
	 */
	mark_links(here){
		this.$app.el.querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}

	inject(){ this.$body.append(this.$app); }

	// into $pages, not $app — emptying $app deletes the chrome, so the one page
	// that most needs the sidebar would be the one page without it
	error(error){
		console.error(error);
		this.$pages.empty(() => {
			div.c("page active-page", () => {
				h1("Page Load Error");
				el.c("pre", "error", error.message);
			});
		});
	}

	// A method, not a getter — it allocates a fresh Promise.all every call.
	loaded(){ return Promise.all(View.stylesheets.concat(this.loaders)); }

	static stylesheet(meta, url){ return View.stylesheet(meta, url); }
}

export default App;
export * from "../../View/View.js";
export * from "./Page.class.js";
