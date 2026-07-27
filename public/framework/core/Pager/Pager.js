import { View } from "../View/View.js";

View.stylesheet(import.meta, "Pager.css");

/**
 * Pager — a `div.pager` container that shows one page at a time and swaps it.
 *
 * This is deliberately dumb: no history, no URLs, no activation. It just holds a
 * `.active` page and swaps its DOM on command. That makes it useful on its own
 * (tabs, wizards, in-app view switching) and a clean base for richer layouts
 * (see ColumnPager).
 *
 * Lifecycle (activate/deactivate, title/meta) is the Router/App's job — the
 * thing that knows the URL. The Pager only owns the DOM swap.
 *
 *   const pager = new Pager();
 *   pager.show(pageA);   // renders pageA into the container
 *   pager.show(pageB);   // swaps to pageB
 */
export class Pager extends View {

	// swap the container's contents to `page` (a Page, or any view/renderable)
	show(page){
		this.empty();
		this.append(page); // Page → render(); View → appended directly
		this.active = page;
		return this;
	}
}

export default Pager;
