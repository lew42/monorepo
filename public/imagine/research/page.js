import { Program } from "/framework/ext/Research/Program.js";

/* Container: a COLUMN in /imagine/'s columns host — not a page grid, so no
   `wide` and no breakout; the column is the width. Size: `large`, 28–64em, and
   the owner can drag the seam. Own layout: the program's, one call. Regions:
   one — Program.content() draws the whole front. Preview: the default card.

   The topics are NOT declared as `children`. Four minions own those dirs and
   write their own `page.js` when they have something to show; core probes the
   filesystem for an undeclared name, so `stone/` starts working the moment one
   lands — whereas a DECLARED child with no page.js 404s. The cards link only
   to the topics that have answered (Program.has_page()).

   ⚠ Which also means: no `route()` here, ever. `route()` sees undeclared names
     first and would shadow the minions' pages the day they arrive. */

export default new Program({
	meta: import.meta,
	title: "Research",
	description: "Four topics in ancient technology, dug in parallel and streamed live — every claim carrying how sure anyone actually is.",
	icon: "explore",

	width: "large",

	question: "What do we actually know about ancient technology — and how sure is anyone?",

	topics: "stone depictions disclosure theories",
});
