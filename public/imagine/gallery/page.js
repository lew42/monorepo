import { Page, View, md } from "/app.js";

/* css: .gal-flat, .gal-borrowed */
View.stylesheet(import.meta, "gallery.css");

/**
 * The Gallery — browsable lists of everything the framework can be made of, built
 * entirely out of pages that live somewhere else.
 *
 * Every card below is a foreign `page.js`, imported by path and drawn with its own
 * `preview()`. Nothing here is a child of anything here. What that costs, and what it
 * cannot do, is answered page by page under Answers — and written up in
 * [core/Page/doc/previews.md](/framework/core/Page/doc/previews/).
 */
export default new Page({
	meta: import.meta,
	title: "Gallery",
	description: "Browsable lists of all the things — every card a page borrowed from somewhere else.",
	icon: "grid_view",

	initialize(){ this.columns(); },

	children: "lists answers cards",

	content(){
		md("Every card in here is a **foreign page** — imported by path, never adopted. Pick a row.");
		md("What that costs and what it cannot do: [core/Page/doc/previews](/framework/core/Page/doc/previews/).");
	},
});
