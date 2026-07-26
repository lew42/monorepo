import { View, div, a, span, is } from "../View/View.js";
import App from "../App/App.js";
import { Page } from "./Page.class.js";

// generic Page2 UX (shell / sidebar / columns / breadcrumbs). Loads once.
View.stylesheet(import.meta, "Page2.css");

/**
 * Page2 — a Page that renders inside a two-column, drill-down shell.
 *
 * The big idea: a page's parent is derivable from its URL ("/a/b/" -> "/a/"),
 * so no page.js ever imports its parent. When a Page2 becomes THE page, it
 * walks UP the URL, imports each ancestor's page.js (dormant, safe), and
 * renders the last two of that chain as columns — the rest become breadcrumbs.
 *
 * Because clicking a link and hard-reloading its URL both run the same chain()
 * logic, /a/b/ looks identical whether you navigated to it or reloaded onto it.
 * That is the whole reason this exists — no hash router, no circular imports.
 */
export default class Page2 extends Page {

	// "/a/b/" -> "/a/", "/michael/" -> null (root of this app)
	get parent_url(){
		const trimmed = this.url.endsWith("/") ? this.url.slice(0, -1) : this.url;
		const idx = trimmed.lastIndexOf("/");
		if (idx <= 0) return null;
		return trimmed.slice(0, idx + 1);
	}

	// [root ... this] — imports each ancestor's page.js (dormant, cached).
	// stops at the first ancestor that isn't a Page2 (e.g. the site root).
	static async chain(leaf){
		const pages = [leaf];
		let current = leaf;
		while (current.parent_url){
			let mod;
			try { mod = await import(App.path_to_page_url(current.parent_url)); }
			catch { break; }
			const parent = mod.default;
			if (!(parent instanceof Page2)) break;
			pages.unshift(parent);
			current = parent;
		}
		return pages;
	}

	// ---- THE page: render the whole shell into $app ------------------------

	// overrides Page.render — App appends this into $app, so this IS the shell.
	render(){
		Page2.bind();

		this.$shell = div.c("page2", () => {
			this.$sidebar = div.c("sidebar"); // filled once the root is known (fill)
			// backdrop dims content behind the off-canvas sidebar (mobile only)
			div.c("backdrop").click(() => this.$shell.rc("nav-open"));
			div.c("shell", () => {
				div.c("topbar", () => {
					// burger toggles the sidebar; hidden on wide layouts via CSS
					div.c("burger", "☰").click(() => this.$shell.tc("nav-open"));
					this.$breadcrumbs = div.c("breadcrumbs");
				});
				this.$columns = div.c("columns loading");
			});
		});

		this.fill(); // async: import ancestors, place sidebar + columns
		return this.$shell;
	}

	async fill(){
		const chain = await Page2.chain(this);

		// sidebar = the root of the chain (as brand) + its children as top-level nav
		this.render_sidebar(chain[0]);

		this.$breadcrumbs.empty(() => {
			chain.forEach((pg, i) => {
				if (i) span.c("crumb-sep", "›");
				pg.crumb();
			});
		});

		const cols = chain.slice(-2); // only ever two visible
		this.$columns.rc("loading").empty(() => {
			cols.forEach((pg, i) => pg.render_column(cols.length === 2 && i === 0));
		});
	}

	// data-driven: brand links to the root, nav lists whatever the root declares
	// as children. No hardcoded sections — add a child and it appears here.
	render_sidebar(root){
		const here = window.location.pathname;
		this.$sidebar.empty(() => {
			a.c("brand").text(root.title).href(root.url).click(Page2.nav(root.url));
			div.c("sidebar-nav", () => {
				(root.children || []).forEach(child => {
					const link = a.c("sidebar-link").text(child.title).href(child.url).click(Page2.nav(child.url));
					if (here.startsWith(child.url)) link.ac("active");
				});
			});
		});
	}

	// one column: a bar (path + close) over the page's own content
	render_column(secondary){
		return div.c("column " + (secondary ? "secondary" : "active"), () => {
			div.c("col-bar", () => {
				span.c("col-path", this.url);
				span.c("col-close", "✕").click(() => Page2.close(this));
			});
			div.c("col-body", () => this.column());
		});
	}

	// the page's own content (title + content), used to fill a column.
	// (Page.render is the shell now, so plain content lives here.)
	column(){
		return div.c("page", () => {
			if (this.title)
				div.c("page-title", this.title);
			if (is.fn(this.content))
				return this.content.call(this, this);
			return this.content;
		}).ac(this.classes);
	}

	// ---- listings & links (hybrid: click = pushState, right-click = new tab)

	// a preview card for a parent to list this child
	preview(){
		return a.c("preview").href(this.url)
			.append(() => {
				div.c("preview-title", this.title);
				if (this.description)
					div.c("preview-desc", this.description);
			})
			.click(Page2.nav(this.url));
	}

	// render all children as preview cards (call inside a parent's content())
	previews(){
		return div.c("previews", () => {
			(this.children || []).forEach(child => child.preview());
		});
	}

	// override Page.link with the hybrid behavior
	link(text){
		return a.c("page-link").text(text ?? this.title).href(this.url).click(Page2.nav(this.url));
	}

	crumb(){
		return a.c("crumb").text(this.title).href(this.url).click(Page2.nav(this.url));
	}

	// ---- activation --------------------------------------------------------

	activate(){
		Page2.bind();
		Page2.current?.deactivate?.();
		super.activate(); // document.title, meta description, body theme
		Page2.current = this;
		return this;
	}

	deactivate(){
		if (this.theme)
			View.body().rc(this.theme);
		return this;
	}

	// ---- client-side navigation -------------------------------------------

	// click handler factory: pushState + re-render, unless a modifier is held
	// (ctrl/cmd/shift/middle-click fall through to the real href = new tab).
	//
	// We only hijack navigation when we're ALREADY inside the Page2 SPA world
	// (a Page2 is active). Crossing the boundary to/from a bare page is left as a
	// real browser navigation: bare pages can't re-render from a cached module, so
	// SPA-ing across the boundary would strand history (a full reload mid-stack
	// truncates the forward entries). Full loads keep back/forward intact.
	static nav(url){
		return function(e){
			if (!(Page2.current instanceof Page2)) return; // entering: let the browser navigate
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
			e.preventDefault();
			Page2.show(url);
		};
	}

	// a link was clicked: navigate to url. render_app decides in-place vs full-nav,
	// and only pushes history when the target renders in place.
	static async show(url){
		await Page2.render_app(url, true); // push = true (this is a fresh navigation)
	}

	// rebuild $app for a path. `push` = add a history entry (true for clicks, false
	// for popstate, where the URL has already changed). The pushState/popstate/load
	// twin of App.load_page.
	static async render_app(url, push = false){
		let mod;
		try {
			mod = await import(App.path_to_page_url(url));
		} catch (error){
			console.error(error);
			return;
		}

		const leaf = mod.default;

		// Page2 pages are re-renderable, so swap them in place (fast, no reload).
		if (leaf instanceof Page2){
			if (push && url !== window.location.pathname)
				window.history.pushState({}, "", url);
			window.app.$app.empty();
			window.app.$app.append(leaf); // append -> leaf.render() = shell
			leaf.activate();
			return;
		}

		// Anything else — a bare side-effect page (h1() at module top, no export),
		// a plain function/View default, or another site page — can't be re-rendered
		// from a cached module. Hand off to a real browser navigation so it loads
		// fresh (its natural model), WITHOUT a prior pushState, so back/forward stay
		// intact. On popstate the URL is already `url`, so this reloads it correctly.
		window.location.assign(url);
	}

	// X on a column climbs out to that column's parent
	static close(pg){
		const pu = pg.parent_url;
		if (pu) Page2.show(pu);
	}

	static bind(){
		if (Page2._bound) return;
		Page2._bound = true;
		window.addEventListener("popstate", () => Page2.render_app(window.location.pathname));
	}
}

// page2({ meta, title, description, children, content(){} })
// page2(import.meta, "Title", () => {...})
export function page2(meta, title, content){
	if (is.pojo(meta))
		return new Page2(meta);
	if (is.fn(title))
		return new Page2({ meta, content: title });
	return new Page2({ meta, title, content });
}

export { Page2 };
