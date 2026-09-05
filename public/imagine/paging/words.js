/* ── THE FOUR MECHANISMS ───────────────────────────────────────────────────────
   What a click on a child can do. Two of the four are core's columns vocabulary
   said out loud — `launch` IS a child column, `takeover` IS `width: "full"`
   (core/Page/doc/columns.md) — and the other two never navigate at all: they happen
   inside the box you are already looking at, which is what makes them feel
   different.

   The realm's full vocabulary is `blocks.js`; this file is the one list that
   outlived the 2026-09-05 rebuild, because three pages in /imagine/codrops/ import
   it by name to say which gesture they rebuilt. It imports nothing.             */
export const MECHANISMS = {
	launch:   { icon: "chevron_right", does: "opens to the RIGHT as a new column; this page stays where it is" },
	expand:   { icon: "expand_more",   does: "opens BELOW, in place; the item grows and nothing else moves" },
	swap:     { icon: "swap_horiz",    does: "replaces what is in this box; the box does not move at all" },
	takeover: { icon: "open_in_full",  does: "fills the screen; every page behind it collapses to the crumb strip" },
};

export default MECHANISMS;
