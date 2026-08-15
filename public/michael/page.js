import { Page, Sidebar, p, div, a, h1, View, md } from "/app.js";
import elements from "./elements/page.js";
import layout from "./layout/page.js";
import components from "./components/page.js";
import sections from "./sections/page.js";
import branding from "./branding/page.js";
import previews from "./previews/page.js";
// framework class docs (Page / Pager / ColumnPager / Router)
import pageDoc from "./page/page.js";
import pagerDoc from "./pager/page.js";
import columnPagerDoc from "./column-pager/page.js";
import routerDoc from "./router/page.js";

// michael-specific doc styles (demo boxes, cards).
View.stylesheet(import.meta, "styles.css");

export default new Page({
	meta: import.meta,
	title: "Michael",
	description: "A live, categorized tour of the framework's essential styles.",
	children: [previews, pageDoc, pagerDoc, columnPagerDoc, routerDoc, elements, layout, components, sections, branding],

	// Its own nav beside its own region — the shape /framework/ uses.
	classes: "hides-nav",

	render(){
		return this.view ??= div.c("page topic flex fill", () => {
			new Sidebar({
				header: () => this.app.brand("Michael", "/michael/"),
				pages: [...this.children.keys()].map(name => this.nav_for(name)),
			});

			this.$pages = div.c("pages", () => {
				div.c("default flow", () => { h1.c("page-title", this.title); this.content(); });
			});
		}).ac(this.classes);
	},

	content(){
		md("Two halves. The **framework** — Page, Pager, ColumnPager, Router — documented with live MVP examples. And the **styles** — elements, layout, components, sections — every essential, shown live.");
		p("Pick one from the sidebar, or a card below — it opens in a column to the right, and that page becomes the nav for its own children. Left-click navigates without a reload; right-click (or ctrl/⌘-click) opens it isolated in a new tab. Reloading any URL rebuilds the same columns.");
		this.previews();
		a("Edric").href("/edric/");
	}
});
