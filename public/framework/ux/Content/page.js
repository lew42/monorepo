import { Page, md, div, a, p } from "/app.js";
import Question from "./Question/Question.js";
import Decision from "./Decision/Decision.js";
import Quotation from "./Quotation/Quotation.js";
import Disclosure from "./Disclosure/Disclosure.js";
import { question, decision_fresh, quotation, disclosure } from "./fixtures.js";

export default new Page({
	meta: import.meta,
	title: "Content",
	description: "The kinds of card a page is built from — ask a question, make a decision, quote a prompt.",
	icon: "dashboard_customize",

	children: "catalog plan Question Decision Quotation Disclosure Concepts structure Spend built/page.jsonl",

	content(){

		// SEAM: the census. `catalog/` is built by another team; this card is the only
		// thing this page says about it, so it can grow into a full wall without a rewrite.
		a.c("card").attr("href", "/framework/ux/Content/catalog/").append(() => {
			div.c("h4 muted", "Catalog");
			p("Every card kind on the site — see each one, where it is used, and which are duplicates.");
		});
		a.c("card").attr("href", "/framework/ux/Content/plan/").append(() => { div.c("h4 muted", "Plan"); p("How the 75 kinds shrink to 36: which merge into which, one spacing table, the order."); });

		md("**A content module is one card that remembers something** — an answer, a choice, a quoted prompt. Each one reads and appends to a plain `.jsonl` log, and a page places it with one line. Try all three (they write to throwaway `demo.jsonl` files), or see a page [built only from lines](/framework/ux/Content/built/).");

		div.c("ux-content-wall wide", () => {
			div.c("flex v gap", () => { md("### [Question](/framework/ux/Content/Question/)"); new Question(question()); });
			div.c("flex v gap", () => { md("### [Decision](/framework/ux/Content/Decision/)"); new Decision(decision_fresh()); });
			div.c("flex v gap", () => { md("### [Quotation](/framework/ux/Content/Quotation/)"); new Quotation(quotation()); });
		});

		md("**[Disclosure](/framework/ux/Content/Disclosure/)**: a title that opens into a section. Three stacking styles to pick from.");
		div.c("ux-content-wall wide", () => {
			for (const [s, line] of [["faq", "Separate rounded cards with a gap."], ["flush", "Zero gap: one rounded box, dividers between."], ["lines", "No boxes: just a rule under each row."]])
				div.c("flex v gap", () => { md(`**${s}**: ${line}`); new Disclosure(disclosure(s)); });
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
