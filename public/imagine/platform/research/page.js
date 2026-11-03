import { Program } from "/framework/ext/Research/Program.js";

/* Container: a COLUMN under /imagine/platform/ in /imagine/'s columns host. Size: `fill`,
   the leftover — alone it fills the row, and yields to a real flex share with a 64em ceiling
   the moment a topic/verdict opens beside it (2026-09-05, Page.css). Seam draggable either
   way. Own layout: the program's, one call. Regions: one. Preview: the default card.

   Topics are NOT declared as `children` — each minion owns its dir and core probes the
   filesystem for an undeclared name, so a topic works the moment its verdict.md lands. No
   `route()` here, ever: it would shadow the minions' pages. */

export default new Program({
	meta: import.meta,
	title: "Research",
	description: "Nine platform questions, each dug to a verdict.",
	icon: "explore",

	width: "fill",   // back from `large` (2026-09-04) now that Page.css's `fill` yields to an open child — this front fills the row alone, and still leaves a topic/verdict beside it a real width (measured, doc/columns.md).

	question: "What should a topic-as-a-world platform be built on — and what is actually known versus hoped?",

	topics: "cloudflare data users payments realtime video ai community security",
});
