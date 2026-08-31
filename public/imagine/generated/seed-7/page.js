import { Page } from "/app.js";

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
});
