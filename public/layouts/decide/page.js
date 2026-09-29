import { Page, div, md, h3, p, ul, li, span } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { QUESTIONS } from "./questions.js";

/* ── /layouts/decide/ — how to choose a layout ─────────────────────────────────
   LAYOUT. Container: a top-level child of /layouts/, the ordinary page grid (not a
   columns host). Size: the five questions are a wall of cards, so they claim `wide`
   (one per row at 400, five across at 3440); the sentences stay in `main`. Own layout:
   `grid auto` at --column 17rem. Regions: the question wall, then the demos as
   previews. Preview on the parent: the default card.

   WHAT THIS PAGE IS FOR. The owner (2026-09-28, 11:15 PM): "we need to develop the
   process of choosing which layout to use." Five questions, asked in order, each with
   its usual answers. The demos under it show the column principles the fourth
   question leans on. Words: ai/2026-09-28/organization/owner-words.md. */
export default new Page({
	meta: import.meta,
	title: "Choosing a layout",
	icon: "rule",
	description: "Five questions, in order, that pick a layout.",
	index: true,

	children: "equal short centred amount servex",

	content(){
		md("**Answer these five questions in order, and the layout usually picks itself.** Each one is a judgement, not a rule: the answers under it are the usual ones, and a page can have a reason to pick something else.");

		div.c("grid auto gap wide", () => QUESTIONS.forEach((q, i) => {
			div.c("card flex v gap-50", () => {
				h3(() => { icon(q.icon); span(` ${i + 1}. ${q.ask}`); });
				p(q.why);
				ul(() => q.answers.forEach(x => li(x)));
				div.c("muted", () => md(q.example));
			});
		})).style("--column", "17rem");

		md("**The demos.** The fourth question is where most pages go wrong, so it has four live demos: three columns that match, the same with one short column, the fix, and a little content against a lot. The last card is the five questions asked of a real page, one at a time.");
		this.previews().style("--column", "18rem");
	},
});
