import { View, div, span, a, img } from "../View/View.js";
import { Pager } from "./Pager.js";

View.stylesheet(import.meta, "ColumnPager.css");

/**
 * ColumnPager — a Pager that lays a page and its ancestors out as a drill-down:
 * a persistent sidebar (the topic + its children), breadcrumbs, and the last two
 * of the ancestor chain side by side. The left column is the parent (acting as
 * nav); the right is the focused page.
 *
 *   new Page({ meta, title, children: [...], pager: ColumnPager });
 *
 * A topic declares `pager: ColumnPager`; its descendants are plain Pages. When
 * any descendant is the target, `Page.host()` resolves to the topic, the App
 * mounts this ColumnPager, and `leaf()` is the page being viewed.
 *
 * Columns are filled with `page.body()` (plain content), never `page.render()`,
 * so a topic that owns a ColumnPager never recurses into it.
 *
 * Navigation is plain `<a href>` (from page.link()/crumb()) — the Router
 * intercepts the clicks globally, and App.mark_links() adds `.active` /
 * `.in-path` — so there are no per-link handlers or url checks here.
 *
 * DOM: .column-pager > (.sidebar, .backdrop, .main > (.topbar, .columns))
 *
 * ── Customizing ──────────────────────────────────────────────────────────
 * Every piece below is its own method, so a topic overrides one by subclassing.
 * Name the subclass and you also get a CSS hook for free — classify() turns the
 * constructor chain into classes, so `.docs-pager` scopes styles to one topic:
 *
 *   pager: class DocsPager extends ColumnPager { nav(){ ... } }
 *
 * Data-only knobs on the topic, for when a subclass is overkill:
 *   brand      text beside the logo   (default: the topic's title)
 *   brand_url  where the logo points  (default: "/")
 *   logo       image url              (default: the document's <link rel=icon>)
 *   col        classes on a page's column — see ColumnPager.css
 */
export class ColumnPager extends Pager {

	// View.initialize() → append(this.render): builds the layout into `this`
	render(){
		this.chain = this.leaf().chain; // [topic … leaf]

		this.sidebar();

		// backdrop dims content behind the off-canvas sidebar (narrow layout)
		div.c("backdrop").click(() => this.rc("nav-open"));

		div.c("main", () => {
			this.topbar();
			this.columns();
		});
	}

	// ── sidebar: brand + the topic's children ──
	sidebar(){
		div.c("sidebar", () => {
			this.brand();
			this.nav();
		});
	}

	/* [ LOGO Framework ] — two links, two destinations:
	 *   the logo  → the site root ("/", or root.brand_url)
	 *   the text  → this topic's own url, so it's the way back to the section
	 *
	 * Both derive from data the topic already has (title, url), so a topic gets
	 * a correct brand with no configuration. Override `brand` for other text. */
	brand(){
		return div.c("brand", () => {
			const logo = this.logo();

			if (logo)
				a(() => img().attr("src", logo).attr("alt", ""))
					.href(this.root.brand_url ?? "/").ac("brand-logo");

			a(this.root.brand ?? this.root.title)
				.href(this.root.url).ac("brand-title");
		});
	}

	/* The document already declares the site's icon — reuse it rather than
	 * hardcoding an asset path into a framework class. `logo` on the topic wins;
	 * a site with no <link rel=icon> just gets the text. */
	logo(){
		return this.root.logo ?? document.querySelector('link[rel~="icon"]')?.href;
	}

	nav(){
		div.c("sidebar-nav", () => {
			(this.root.children || []).forEach(child => child.link().ac("sidebar-link"));
		});
	}

	// ── topbar: burger (narrow layout) + breadcrumbs ──
	topbar(){
		div.c("topbar", () => {
			div.c("burger", "☰").click(() => this.tc("nav-open"));
			this.crumbs();
		});
	}

	crumbs(){
		div.c("breadcrumbs", () => {
			this.chain.forEach((pg, i) => {
				if (i) span.c("crumb-sep", "›");
				pg.crumb();
			});
		});
	}

	// ── columns: only ever the last two of the chain ──
	columns(){
		div.c("columns", () => {
			const cols = this.chain.slice(-2);
			cols.forEach((pg, i) => this.column(pg, cols.length === 2 && i === 0));
		});
	}

	// one column: a bar (path + close) over the page's plain content
	column(pg, secondary){
		return div.c("column")
			.ac(secondary ? "secondary" : "active")
			.ac(pg.col) // per-page width, e.g. col: "narrow" — just classes
			.append(() => {
				this.col_bar(pg);
				div.c("col-body", () => pg.body());
			});
	}

	col_bar(pg){
		div.c("col-bar", () => {
			span.c("col-path", pg.url);
			span.c("col-close", "✕").click(() => this.close(pg));
		});
	}

	// X climbs out to the column's parent
	close(pg){
		if (pg.parent)
			window.app.router?.go(pg.parent.url);
	}
}

export default ColumnPager;
