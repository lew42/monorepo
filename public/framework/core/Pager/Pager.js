import { View } from "../View/View.js";

View.stylesheet(import.meta, "Pager.css");

/**
 * Pager — a `div.pager` that shows one page and can swap it.
 *
 * Deliberately dumb: no history, no URLs, no activation. Two ways to use it:
 *
 *   MANUAL — you drive it:
 *     const pager = new Pager();
 *     pager.show(pageA);   // renders pageA into the container
 *     pager.show(pageB);   // swaps to pageB
 *
 *   MOUNTED — a topic declares one as its layout, and the App mounts it:
 *     new Page({ meta, title, children: [...], Pager: ColumnPager });
 *
 * `Pager` is inert data on the Page — a class, hence capitalized. The *App*
 * instantiates it (`new host.Pager({ root: host, app: this })`), never the Page,
 * so `root` is the topic and `leaf()` is the page actually being viewed. (`app`
 * is injected; nothing here reads the `window.app` global — see "OOP
 * conventions" in CLAUDE.md.) A subclass's `render()` lays those two out however
 * it likes — see ColumnPager (drill-down columns) and TabPager (tab bar +
 * panel). That's the whole extension point.
 *
 * Everything navigational stays outside: links are plain `<a href>`, the Router
 * intercepts them globally, and the App owns activation (title/meta/theme).
 */
export class Pager extends View {

	// ── manual use ──
	// swap the container's contents to `page` (a Page, or any view/renderable)
	show(page){
		this.empty();
		this.append(page); // Page → render(); View → appended directly
		this.active = page;
		return this;
	}

	// ── mounted use ──
	// The page being viewed. The App already resolved it (`app.page`) before
	// rendering us, so we don't re-derive it from the URL. Falls back to the
	// topic itself (the topic's own url, or a Pager used outside an App).
	//
	// `this.app` is injected by App.load_page when it mounts us — never
	// `window.app`. It's absent for a standalone `new Pager()` (the TabPager
	// panel, a demo), which is exactly why it's optional-chained.
	leaf(){
		const page = this.app?.page;
		return page?.chain?.includes(this.root) ? page : this.root;
	}
}

export default Pager;
