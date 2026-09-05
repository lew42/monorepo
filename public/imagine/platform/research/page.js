import { Program } from "/framework/ext/Research/Program.js";

/* Container: a COLUMN under /imagine/platform/ in /imagine/'s columns host. Size: `large`,
   28–64em, seam draggable. Own layout: the program's, one call. Regions: one. Preview: the
   default card.

   Topics are NOT declared as `children` — each minion owns its dir and core probes the
   filesystem for an undeclared name, so a topic works the moment its verdict.md lands. No
   `route()` here, ever: it would shadow the minions' pages. */

export default new Program({
	meta: import.meta,
	title: "Research",
	description: "Nine platform questions, each dug to a verdict.",
	icon: "explore",

	width: "large",   // not `fill`: fill claims the leftover from a column opened UNDER it too — a verdict beside it sat at its 288px floor (2026-09-04). Until fill can yield to an open child, large.

	question: "What should a topic-as-a-world platform be built on — and what is actually known versus hoped?",

	topics: "cloudflare data users payments realtime video ai community security",
});
