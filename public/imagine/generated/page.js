import { Page, md } from "/app.js";

/* Page trees the generator wrote out — real modules, one directory per page.
 *
 * ⚠ The `children:` line below is REWRITTEN by the Export control on
 *   /framework/core/Page/generator/ (export.js). Add a tree by exporting it;
 *   remove one by deleting its directory and its name from that line.
 *
 * Size: `large` — a card wall, not prose, and the critique (2026-09-04) found
 * one card adrift in 2180px of dead paper at the old default track. `.ac("wide")`
 * on the wall is belt-and-suspenders (a `div` was already outside the measure
 * cap); the width word is what actually moves the numbers.
 * ⚠ NOT `fill` — measured (task ai/2026-09-04/realm-alternates): `fill`'s
 *   `flex: 1 1 100%` claims the row even against a column OPENED UNDER `seed-7`
 *   (a plain sibling in the same flattened row, since a nested `columns()` call
 *   is inert), squeezing it to its 288px floor and overflowing the row 11-16%
 *   — measured on /imagine/generated/seed-7/vtabs/prose/. `large` shares
 *   `flex-grow` evenly with its siblings instead of hogging the basis.
 */

export default new Page({
	meta: import.meta,
	title: "Generated",
	description: "Page trees exported from the generator — the same tree, as files you can edit.",
	icon: "output",
	index: true,
	width: "large",

	children: "seed-7",

	content(){
		md("Each card below is one **tree** — a set of pages someone rolled or typed in the [generator](/framework/core/Page/generator/), named, and exported. Exporting writes real files here: a directory, an ordinary `page.js` in it, nothing left generated. Only one has been exported so far, so there is only one card — export another from the generator and it queues up beside it. Open a card and it's a columns tree like any other; open its files and edit them like any other page. ([how this works](/imagine/generated/readme/))");
		this.previews().ac("wide");
	},
});
