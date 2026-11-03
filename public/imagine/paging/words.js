/* ── THE FOUR MECHANISMS ───────────────────────────────────────────────────────
   What a click on a child can do. Two of the four are core's columns vocabulary
   said out loud — `launch` IS a child column, `takeover` IS `width: "full"`
   (core/Page/doc/columns.md) — and the other two never navigate at all: they happen
   inside the box you are already looking at, which is what makes them feel
   different.

   ⚠ THIS IS NOT THE NAVIGATION VOCABULARY. That is `blocks.js` `NAVIGATION`, and it
     is the only one. These four are the older names for what a click DOES, kept
     alive for one reason: three pages in /imagine/codrops/ import `MECHANISMS` from
     this realm by name to say which gesture they rebuilt, and moving it would break
     another realm silently. Nothing in this realm writes these words into a file any
     more — Make wrote `mech` into every `page.json` until 2026-09-05. It imports
     nothing.                                                                     */
export const MECHANISMS = {
	launch:   { icon: "chevron_right", does: "opens to the RIGHT as a new column; this page stays where it is" },
	expand:   { icon: "expand_more",   does: "opens BELOW, in place; the item grows and nothing else moves" },
	swap:     { icon: "swap_horiz",    does: "replaces what is in this box; the box does not move at all" },
	takeover: { icon: "open_in_full",  does: "fills the screen; every page behind it collapses to the crumb strip" },
};

export default MECHANISMS;
