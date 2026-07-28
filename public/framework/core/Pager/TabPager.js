import { View, div, span } from "../View/View.js";
import { Pager } from "./Pager.js";

// css dependency, declared — TabPager.css adapts .page / .page-title, which Page
// emits and Page.css styles. See framework/styles/readme.md §8.
import "../Page/Page.class.js";

View.stylesheet(import.meta, "TabPager.css");

/**
 * TabPager — a tab bar over a Pager. The second structure, and the shortest
 * possible proof that `Pager` earns its keep: the panel IS a plain `Pager`, and
 * `select()` is just `panel.show(page)`.
 *
 *   new TabPager({ pages: [intro, install, api] });   // standalone, in-page
 *   new Page({ meta, title, children: [...], pager: TabPager });  // as a layout
 *
 * Unlike ColumnPager this is **in-page, not url-driven**: clicking a tab swaps
 * the panel and does not navigate. (Mounted as a topic's layout, it opens on
 * `leaf()` so a deep url still lands on the right tab.) For url-driven tabs,
 * render `leaf()` the way ColumnPager does and let the links stay links.
 */
export class TabPager extends Pager {

	render(){
		this.pages = this.pages ?? this.root?.children ?? [];
		this.tabs = [];

		div.c("tab-bar", () => {
			this.pages.forEach(page => {
				this.tabs.push(span.c("tab", page.title).click(() => this.select(page)));
			});
		});

		this.panel = new Pager().ac("tab-panel"); // the base class does the swapping

		const leaf = this.root && this.leaf();
		this.select(this.pages.includes(leaf) ? leaf : this.pages[0]);
	}

	select(page){
		if (!page) return this;

		const i = this.pages.indexOf(page);
		this.tabs.forEach((tab, n) => n === i ? tab.ac("active") : tab.rc("active"));
		this.panel.show(page);

		return this;
	}
}

export default TabPager;
