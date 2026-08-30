import { View, div, span, a, icon } from "../../core/View/View.js";
import demo from "./demo.js";

/* css: app.css styles .page, .page-title, .page-preview and .page-link — Page.css
   owns all four. */
import "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "app.css");

/**
 * demo.app(page, { nav }) — a real Page tree, navigating inside a box.
 *
 *     demo.app(docs)                   // opens at the root
 *     demo.app(laces, { nav: true })   // opens deep, with a rail
 *
 * It plays App and Router for one tree, and nothing else: it owns the region
 * pages mount in, walks `child()` on a click, and marks what it shows. The pages
 * inside are ordinary Pages doing their own `render()`, `previews()`, `chain()`.
 *
 * A page in there may hand itself a `$pages` and become a region of its own — that
 * is what the catalog arrangement does, and `mark()` below is what keeps such a
 * parent on screen beside its child.
 *
 * ⚠ A title is address enough — the root's url derives from it (`Web` → `/web/`).
 * Build the tree with `add()` or object children: a name string
 * (`children: "intro"`) probes the SERVER for a page.js.
 *
 * Design record — and the two things it must not borrow from the real app:
 * core/Page/readme.md.
 */
demo.app = (page, options) => new DemoApp({ page }, options);

class DemoApp extends View {

	/* Which page the box is the app FOR. The tree's own root by default — an
	 * in-memory tree has no parent, so that is the whole of it. `scope:` names a
	 * different one, for a box showing a page that also lives in the real site:
	 * `page.demo()` hands in the page itself, and everything above it stays outside.
	 * ⚠ Every walk below goes through `trail()` for the same reason. */
	root_of(){ return this.scope ?? this.page.chain()[0]; }

	// The chain from the box's root down. Identical to `page.chain()` when the root
	// IS the tree's root (`indexOf` is 0), and only the part inside the box when a
	// `scope:` put real ancestors above it — activating those would render the site.
	trail(page = this.page){
		const chain = page.chain();
		return chain.slice(Math.max(chain.indexOf(this.root), 0));
	}

	render(){
		this.root = this.root_of();

		this.$url = div.c("demo-app-url");

		div.c("demo-app-body", () => {
			if (this.nav) this.$nav = div.c("demo-app-nav");
			this.$pages = div.c("demo-app-pages");
		});

		// It IS the app for this tree — container() asks `app.$pages` for the root, and
		// walks up to the ROOT's `$pages` for everything under it. Both, so a page that
		// was never navigated to still lands here.
		this.root.assign({ app: this, $pages: this.$pages });

		this.rail();
		this.show(this.page);

		// A name, not a look: which page in here is the root is the one thing CSS
		// cannot ask, and a stage uses it to stop the root's `h1` competing with the
		// title of the page the whole box is an example on (exhibit.css).
		this.root.view.ac("demo-app-root");
	}

	/* Any anchor inside a miniature is miniature navigation, and preventDefault()
	 * beats the real Router to it — link_clicked() bails on `e.defaultPrevented`.
	 * ⚠ Only urls under the root: a link to the real site inside a demo page must
	 * stay real, and a walk off the tree would probe the server for a page.js. */
	initialize(){
		super.initialize();

		this.click(e => {
			const link = e.target.closest?.("a[href]");
			if (!link || !this.el.contains(link)) return;
			if (!link.pathname.startsWith(this.root.url)) return;

			e.preventDefault();
			this.go(link.pathname);
		});
	}

	// The Router's walk, in miniature. Nothing is fetched — a demo tree is built in
	// memory, so every child() answers from its Map.
	async go(url){
		let page = this.root;

		for (const name of url.replace(this.root.url, "").split("/").filter(Boolean))
			page = await page.child(name);

		if (page) this.show(page);
	}

	// The whole chain, like Router.activate() — minus its shared-depth diff, which
	// is an optimisation a box this size cannot notice.
	show(page){
		if (page !== this.page) this.trail().forEach(p => p.deactivate());

		this.trail(page).forEach(p => this.place(p));
		this.page = page;

		this.crumbs();
		this.mark();

		// The one hook out: a toolbar over this box has to follow what it shows.
		this.shown?.(page);
		return this;
	}

	/* The root mounts HERE, whatever its real parent already granted it. `container()`
	 * answers a REGION first, so a page that is a tab of the real site — every child
	 * of an `ext/Doc` is — would send the box's own root to that tab panel and leave
	 * this one empty. Identical to `activate()` for a tree with no parent, which is
	 * every caller but `page.demo()`. Everything below the root activates normally:
	 * their containers are inside this box. */
	place(page){
		if (page !== this.root) return page.activate();

		if (page.render().el.parentNode !== this.$pages.el) this.$pages.append(page.view);

		page.activated?.();
		page.column_host()?.reveal_column(page);
		return page;
	}

	// The url, one link per segment — an address bar that is also a breadcrumb.
	crumbs(){
		this.$url.empty(() => this.trail().forEach(page =>
			a.c("demo-app-crumb", page === this.root ? page.url : page.name + "/").href(page.url)));
	}

	// nav_for() per child — the same entries a Sidebar or previews() reads.
	rail(){
		this.$nav?.empty(() => {
			a.c("demo-app-link", this.root.title).href(this.root.url);

			this.root.children.forEach((_, name) => {
				const nav = this.root.nav_for(name);

				a.c("demo-app-link").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span(nav.label);
				});
			});
		});
	}

	/* `default` is the arrangement contract's own word for "shown without being
	 * routed to" (Page.css), and the only mark that survives in here: the real
	 * Router.mark() wipes `.active-page` / `.active-ancestor` from the whole app on
	 * every navigation, and mark_links() does the same to `.active` / `.in-path`.
	 *
	 * ⚠ The whole chain, filtered by containment — `.active-ancestor:has(.page.active-page)`
	 * written in JS. A parent whose child mounts in a region OF ITS OWN has to stay
	 * visible; one that hands its child to the box does not, or the two stack. */
	mark(){
		this.$pages.el.querySelectorAll(".page.default")
			.forEach(el => el.classList.remove("default"));

		this.trail().forEach(page => {
			if (page.view?.el.contains(this.page.view.el)) page.view.ac("default");
		});

		this.el.querySelectorAll("a[href]").forEach(link => {
			const current = this.current(link.pathname);
			current ? link.setAttribute("aria-current", current) : link.removeAttribute("aria-current");
		});
	}

	// mark_links()'s two answers, as the attribute's two values. ⚠ The root is
	// excluded from `location` for the same reason `.tab-default` is: every url in
	// the tree starts with it, so it would read as selected from anywhere.
	current(url){
		const here = this.page.url;

		return here === url ? "page"
			: url !== this.root.url && here.startsWith(url) ? "location"
			: null;
	}
}

export default demo.app;
export { DemoApp };
