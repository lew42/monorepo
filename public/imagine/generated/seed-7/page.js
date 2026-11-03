import { Page, md } from "/app.js";

/* Exported from the page generator on 2026-08-31 — seed 7, model v3.
 *
 *   vtabs small
 *     wall
 *       prose
 *       list
 *         prose large
 *         prose
 *     prose
 *   list
 *     wall large
 *       prose
 *       prose
 *       tabs
 *         prose
 *         prose
 *
 * Ordinary pages from here down: one directory each, one `page.js` each, nothing
 * imported from the generator. Edit them like any other module.
 */

export default new Page({
	meta: import.meta,
	title: "Seed 7",
	description: "A generated page tree — 14 pages, exported from seed 7, model v3.",
	icon: "account_tree",

	// Core's opt-in: my whole subtree lays out as full-height columns.
	initialize(){ this.columns(); },

	children: "vtabs list",

	content(){
		md("A **seed** is one export from the [generator](/framework/core/Page/generator/) — a real tree of `page.js` files, not a finished app. The two links below, *Journal* and *Backlog*, are placeholder names the generator invented; they don't describe what's inside. *Journal* is really a vertical tab rail (`vtabs/`), *Backlog* a plain column list (`list/`) — open either to see the actual shape, then edit the files under it to make it yours.");
	},
});
