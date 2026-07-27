import { View, div, span, a } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Pager } from "./Pager.js";

View.stylesheet(import.meta, "ColumnPager.css");

/**
 * ColumnPager — a Pager that renders a page and its ancestors as a drill-down:
 * a persistent sidebar (the topic + its children), breadcrumbs, and the last
 * two of the ancestor chain as side-by-side columns. The left column is the
 * parent (acting as nav); the right is the focused page.
 *
 *   new Page({ meta, title, children: [...], pager: ColumnPager });
 *
 * A topic declares `pager: ColumnPager`; its descendants are plain Pages. When
 * any descendant is the target, Page.host() resolves to the topic, the App
 * mounts this ColumnPager, and it reads window.location to render the columns.
 *
 * It fills columns with `page.body()` (plain content), never `page.render()`,
 * so a topic that owns a ColumnPager never recurses into it.
 *
 * Navigation is plain `<a href>` (from page.link()/crumb()) — the Router
 * intercepts the clicks globally, so there are no per-link handlers here.
 *
 * DOM: .column-pager > (.sidebar, .backdrop, .main > (.topbar, .columns)).
 * .main is just the layout region beside the sidebar (topbar + columns).
 */
export class ColumnPager extends Pager {

	constructor(root){
		super({ root }); // root = the topic that owns this ColumnPager
	}

	// View.initialize() → append(this.render): builds the layout into `this`
	render(){
		const leaf = this.leaf();
		const chain = leaf.chain; // [root … leaf]

		this.sidebar(chain[0]);

		// backdrop dims content behind the off-canvas sidebar (narrow layout)
		div.c("backdrop").click(() => this.rc("nav-open"));

		div.c("main", () => {
			div.c("topbar", () => {
				div.c("burger", "☰").click(() => this.tc("nav-open"));
				div.c("breadcrumbs", () => {
					chain.forEach((pg, i) => {
						if (i) span.c("crumb-sep", "›");
						pg.crumb();
					});
				});
			});
			div.c("columns", () => {
				const cols = chain.slice(-2); // only ever two visible
				cols.forEach((pg, i) => this.column(pg, cols.length === 2 && i === 0));
			});
		});
	}

	// the page for the current URL (registry lookup; falls back to the topic)
	leaf(){
		return Page.registry.get(window.location.pathname) || this.root;
	}

	// data-driven sidebar: brand = the topic, nav = its children
	sidebar(root){
		const here = window.location.pathname;
		div.c("sidebar", () => {
			// root.link().ac("brand");
			a("Home").href("/").ac("brand");
			div.c("sidebar-nav", () => {
				(root.children || []).forEach(child => {
					const link = child.link().ac("sidebar-link");
					if (here.startsWith(child.url)) link.ac("active");
				});
			});
		});
	}

	// one column: a bar (path + close) over the page's plain content
	column(pg, secondary){
		div.c("column " + (secondary ? "secondary" : "active"), () => {
			div.c("col-bar", () => {
				span.c("col-path", pg.url);
				span.c("col-close", "✕").click(() => this.close(pg));
			});
			div.c("col-body", () => pg.body());
		});
	}

	// X climbs out to the column's parent
	close(pg){
		if (pg.parent)
			window.app.router?.go(pg.parent.url);
	}
}

export default ColumnPager;
