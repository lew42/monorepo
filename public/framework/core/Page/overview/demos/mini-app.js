import { View, div, span, a, icon } from "/app.js";

View.stylesheet(import.meta, "mini-app.css");

/**
 * mini_app(page, { nav }) — a real Page tree, navigating inside a box.
 *
 *     mini_app(docs)                   // opens at the root
 *     mini_app(laces, { nav: true })   // opens deep, with a rail
 *
 * It plays App and Router for one tree, and nothing else: it owns the region
 * pages mount in, walks `child()` on a click, and marks what it shows. The pages
 * inside are ordinary Pages doing their own `render()`, `previews()`, `chain()`.
 *
 * ⚠ Give the root a fictional url and build the tree with `add()` or object
 * children. A name string (`children: "intro"`) probes the SERVER for a page.js.
 *
 * Design record — and the two things it must not borrow from the real app:
 * core/Page/readme.md.
 */
export default function mini_app(page, options){
	return new MiniApp({ page }, options);
}

class MiniApp extends View {

	render(){
		this.root = this.page.chain()[0];

		this.$url = div.c("mini-app-url");

		div.c("mini-app-body", () => {
			if (this.nav) this.$nav = div.c("mini-app-nav");
			this.$pages = div.c("mini-app-pages");
		});

		// It IS the app for this tree — container() asks `app.$pages` for the root, and
		// walks up to the ROOT's `$pages` for everything under it. Both, so a page that
		// was never navigated to still lands here.
		this.root.assign({ app: this, $pages: this.$pages });

		this.rail();
		this.show(this.page);
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
		if (page !== this.page) this.page.chain().forEach(p => p.deactivate());

		page.chain().forEach(p => p.activate());
		this.page = page;

		this.crumbs();
		this.mark();
		return this;
	}

	// The url, one link per segment — an address bar that is also a breadcrumb.
	crumbs(){
		this.$url.empty(() => this.page.chain().forEach(page =>
			a.c("mini-app-crumb", page === this.root ? page.url : page.name + "/").href(page.url)));
	}

	// nav_for() per child — the same entries a Sidebar or previews() reads.
	rail(){
		this.$nav?.empty(() => {
			a.c("mini-app-link", this.root.title).href(this.root.url);

			this.root.children.forEach((_, name) => {
				const nav = this.root.nav_for(name);

				a.c("mini-app-link").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span(nav.label);
				});
			});
		});
	}

	/* `default` is the arrangement contract's own word for "shown without being
	 * routed to" (Page.css), and the only mark that survives in here: the real
	 * Router.mark() wipes `.active-page` / `.active-ancestor` from the whole app on
	 * every navigation, and mark_links() does the same to `.active` / `.in-path`. */
	mark(){
		this.$pages.el.querySelectorAll(".page.default")
			.forEach(el => el.classList.remove("default"));

		this.page.view.ac("default");

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

export { mini_app, MiniApp };
