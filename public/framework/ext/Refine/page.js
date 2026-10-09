import { Page, p, a, md, h2 } from "/app.js";
import refine from "./Refine.js";
import RefineDemo from "./RefineDemo.js";

/* ⚠ NOT `navigation: "tabs"`. Tried first (review/report.md, 2026-10-04 finding 1
 * wanted "try" reachable as a real tab) — but `ext/tabs`'s `tabs()` has no "my own
 * content()" entry, only `this.children`, so with one child ("try") it auto-fills
 * the WHOLE page with Try-it's content and the ladder below never renders at all
 * (confirmed live: public/framework/ai/2026-10-04/clean-test-page/task.jsonl). Doc
 * pages dodge this by making their own content an explicit "overview" child
 * (`ext/Doc`'s `overview_section()`) — real surgery, not a few lines on a
 * hand-written Page. A plain, visible link to Try it is the honest small fix:
 * still a real page at its own url ("try" is still a declared child), just not
 * drawn as a framework tab strip. */
export default new Page({
	meta: import.meta,
	title: "Refine",
	description: "One dictation, shown as a ladder: raw → clean → structured → brief, with a coverage table proving nothing was lost.",
	icon: "fact_check",
	children: "try",

	content(){
		// The demo comes first (the owner, 2026-10-08): speak one prompt, see it refined. The saved
		// ladder below is the older, longer view of the same pipeline on a finished dictation.
		p("Speak or type **one prompt** and press Refine: you get what was said, the cleaned numbered sentences, and the refined cards. A yellow ⚑ marks a sentence that may be unclear. Click a card's `S#` to jump to its source sentence. The class behind it is [Prompt](/framework/ext/Refine/md/doc/prompt/).");
		new RefineDemo();

		h2("A saved run — the same pipeline on a long dictation");
		p("`Server/refine.mjs` turns a long, rambling dictation into a numbered brief a mastermind can act on — and keeps every step, so you can always ask \"wait, what did I actually say?\" Click an ask below, or a bullet in Structured, and its source sentences light up in Clean and Raw.");

		p(() => a("Try it — run this same clean-up step against any model →").href(new URL("try/", import.meta.url).pathname));

		// Run C (the harness dictation) is the longest of the four and the only
		// one with a dropped sentence AND a thin citation both present, so the
		// FIRST screen anyone lands on already shows what "dropped" looks like —
		// runs/sample has zero, and a first screen with nothing dropped reads as
		// "this never happens".
		const DEFAULT_RUN = "/framework/ai/2026-09-29/prompt-refine/runs/c/";
		refine(import.meta, { run: new URLSearchParams(location.search).get("run") || DEFAULT_RUN }).ac("wide");

		md(`This page shows a real \`Server/refine.mjs\` run — run C, the harness and research dictation — on one of the owner's own 09-29 dictations. \`?run=\` picks any other run directory — the task's card on the AI 2 dashboard has a picker for sample / a / b / c. There's also a small hand-built [fixture](?run=${new URL("fixture/", import.meta.url).pathname}) this view was first built against, in the exact file shape \`refine.mjs\` writes.`);
	},
});
