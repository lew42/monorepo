import { Page, md, demo, div, ul, li, p, span } from "/app.js";

/* The template, verbatim — rendered on the stage AND printed as the source, so the
   code on the page is the code that ran. `opt`, not `option`: `option` is a real
   tag factory exported by View. */
const opt = (say, why, chosen) => li.c("ui-decision-option").ac(chosen && "chosen").append(() => {
	if (chosen) span.c("ui-decision-mark", "chosen");
	div.c("ui-decision-say", say);
	p.c("ui-decision-why", why);
});

const decision = () => div.c("ui-decision", () => {
	div.c("ui-decision-ask", "Where should the layout browser live?");

	ul.c("ui-decision-options", () => {
		opt("/layouts/browse/", "Beside the encyclopedia it indexes — one realm, one url.", true);
		opt("/imagine/review/", "With the other review tools, away from the corpus.");
		opt("A tab on each layout", "No wall at all; you judge one layout at a time.");
	});

	p.c("ui-decision-because", "Because the reader who is already browsing layouts is the one who wants to judge them.");
});

export default new Page({
	meta: import.meta,
	title: "Decision",
	description: "The options as cards, the chosen one marked — a choice you can see.",
	icon: "alt_route",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(decision, steer).ac("bleed"),
			def: decision,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**A decision is a question, its alternatives, and the one that won.** Written as sentences it reads as a paragraph; written as boxes it reads as a *choice*, which is the thing a reader has to be able to see before they can agree or disagree with it. That is the owner's rule, 2026-09-17: *options and alternatives get a box each, their own background, so the set reads as a choice; siblings that are roughly equal get nothing.*",
		});

		md("## The chosen one is marked three ways");

		md("`--prim` is `#FF6157`, and that is **2.96:1 on white** — below the 3:1 a UI shape needs and well below the 4.5:1 text needs. So the accent never carries the message here. The winning card is marked by a **lighter ground** than its siblings (`--surface` at 17.4:1 against `--wash` at 15.4:1), a **2px accent outline**, and the **word `chosen`** in ordinary ink. Miss any one of the three and you can still tell which card won.");

		md("## The markup");

		md("```html\n<div class=\"ui-decision\">\n\t<div class=\"ui-decision-ask\">Where should the layout browser live?</div>\n\t<ul class=\"ui-decision-options\">\n\t\t<li class=\"ui-decision-option chosen\">\n\t\t\t<span class=\"ui-decision-mark\">chosen</span>\n\t\t\t<div class=\"ui-decision-say\">/layouts/browse/</div>\n\t\t\t<p class=\"ui-decision-why\">Beside the encyclopedia it indexes.</p>\n\t\t</li>\n\t\t<li class=\"ui-decision-option\">…</li>\n\t</ul>\n\t<p class=\"ui-decision-because\">Because …</p>\n</div>\n```");

		md("A real `<ul>` of `<li>`s, because it really is a list. The grid is `auto-fit, minmax(min(15em, 100%), 1fr)`: one column at 400, three across a task page at 1280, four at 1920. An option that was itself a choice nests — put another `ul.ui-decision-options` inside an `<li>` and its cards step to the `--tint` ground, so two levels never paint the same grey.");

		md("## Who uses it");

		md("The **Decisions tab** on every task page — [`ext/AITask`](/framework/ext/AITask/) — draws one of these per decision in a task's log, with Approve and Improve under it. The data is [`ext/JSONL`](/framework/ext/JSONL/)'s `decision` verb: the question, the options considered, the one chosen, the reason, and the skill rule that produced it. [The doc](/framework/ext/AITask/doc/decisions-tab/).");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", decision)); },
});
