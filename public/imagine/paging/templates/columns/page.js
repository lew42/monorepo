import { Template } from "../templates.js";
import { family } from "../families.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  the paging app's middle — one region that swaps, never a column of
                /imagine/'s row. (The old header here said "a column in /imagine/'s
                row"; that stopped being true in the 2026-09-05 rebuild, and the
                `width:` word that went with it did nothing at all.)
   2 SIZE       prose keeps the 40em measure; the stage claims `wide` and takes every
                leftover pixel of the middle.
   3 OWN LAYOUT lede, then the stage (chips, the example, the change caption), then
                three reference blocks — all of it `Template.content()`.
   4 REGIONS    one, core's. This page has no children.
   5 PREVIEW    core's default card, on the templates wall.

   Everything this page SAYS lives in `../families.js`, beside the code that draws
   its example — so the sentence and the picture cannot drift apart.               */

const it = family("columns");

export default new Template({
	meta: import.meta,
	title: "Columns",
	description: "Peers in a row you walk sideways.",
	icon: "view_column",

	// style repaints it, type re-sets it, layout can hand it the whole row.

	family: it,
	takeaway: it.what,

	/* ⚠ THE PREMISE MOVED, THE PAGE DID NOT. Everything below still describes what
	     core does today: a column is elastic, it takes a share of the row, and five
	     width words tune that share. What changed is what to REACH for — the owner,
	     2026-09-17: N even columns and fixed navigation are the direction, and
	     continuous Miller columns are not. So this page carries one line at the top
	     rather than a rewrite, and the line points at the study that measured the
	     alternative. `Paging.supersedes()`; `../../doc/decisions.md`. */
	superseded: "Every column on this page takes a SHARE of the row, so opening one moves the columns already open — measured at up to 242px. Even columns that keep their width are the direction now.",
});
