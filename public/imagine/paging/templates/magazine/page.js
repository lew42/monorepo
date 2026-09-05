import { Template } from "../templates.js";
import { family } from "../families.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  a column in /imagine/'s row (a columns host): no page grid, prose in
                `.page-column-prose`, `bleed` the only edge word.
   2 SIZE       `large` — 28–64em, so the example grows with the row while the prose
                above it keeps its 40em measure. Press `full` on the layout chips and
                this page takes the whole row instead.
   3 OWN LAYOUT lede, then the stage (chips, the example, the change caption), then
                three reference blocks — all of it `Template.content()`.
   4 REGIONS    one, core's. This page has no children.
   5 PREVIEW    core's default card, on the templates wall.

   Everything this page SAYS lives in `../families.js`, beside the code that draws
   its example — so the sentence and the picture cannot drift apart.               */

const it = family("magazine");

export default new Template({
	meta: import.meta,
	title: "Magazine",
	description: "A cover, a contents, a reading column.",
	icon: "auto_stories",
	width: "large",

	// style repaints it, type re-sets it, layout can hand it the whole row.
	axes: "style type layout",

	family: it,
	takeaway: it.what,
});
