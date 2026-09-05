import { Page, View, md } from "/app.js";

/* css: .gal-flat, .gal-borrowed */
View.stylesheet(import.meta, "gallery.css");

/* Container: a plain column of /imagine/'s row — the hub already calls columns(), so a
   second call here was inert (doc/columns.md, "shallowest ancestor" rule; it even names
   this page as the example) and is removed rather than kept as a call that does
   nothing. Size: `large` (64em), NOT `full` — `full` was tried and reverted for this
   exact realm on 2026-08-29 (doc/decisions.md) because it collapses every ancestor
   column, including /imagine/'s own hub rail, for as long as you stay anywhere inside
   Gallery; `large` fits all three cards in one row without paying that price. Own
   layout: `index: true` + previews() turns the three one-line children into a card
   wall instead of a plain list (paging/critique's "gallery" row: 31% of 3440 used).
   Regions: none. Preview: the default card. */

/**
 * The Gallery — three ways to browse things the framework can be made of, all built
 * out of *foreign pages*: real `page.js` files that live somewhere else in the
 * framework, imported here by path and drawn with their own preview, never moved or
 * copied. Pick a card below.
 *
 * What that borrowing costs, and what it cannot do, is answered page by page under
 * Answers — and written up in [core/Page/doc/previews.md](/framework/core/Page/doc/previews/).
 */
export default new Page({
	meta: import.meta,
	title: "Gallery",
	description: "Browsable lists of all the things — every card a page borrowed from somewhere else.",
	icon: "grid_view",
	width: "large",
	index: true,

	children: "lists answers cards",

	content(){
		md("**Three ways to browse the framework's building blocks, layouts and demos** — none of it lives here. Each section below imports real pages from elsewhere by path (a *foreign page*) and shows them as cards, without moving them. Pick one.");
		md("What that borrowing costs and what it cannot do: [core/Page/doc/previews](/framework/core/Page/doc/previews/).");
		this.previews().style("--column", "18em");
	},
});
