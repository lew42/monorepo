import { Page, md, div, a, p } from "/app.js";
import Question from "./Question/Question.js";
import Decision from "./Decision/Decision.js";
import Quotation from "./Quotation/Quotation.js";
import { question, decision_fresh, quotation } from "./fixtures.js";

export default new Page({
	meta: import.meta,
	title: "Content",
	description: "The kinds of card a page is built from — ask a question, make a decision, quote a prompt.",
	icon: "dashboard_customize",

	children: "catalog Question Decision Quotation built/page.jsonl",

	content(){

		// SEAM: the census. `catalog/` is built by another team; this card is the only
		// thing this page says about it, so it can grow into a full wall without a rewrite.
		a.c("card").attr("href", "catalog/").append(() => {
			div.c("h4 muted", "Catalog");
			p("Every card kind on the site — see each one, where it is used, and which are duplicates.");
		});

		md("**A content module is one card that remembers something** — an answer, a choice, a quoted prompt. Each one reads and appends to a plain `.jsonl` log, and a page places it with one line. Try all three (they write to throwaway `demo.jsonl` files), or see a page [built only from lines](built/).");

		div.c("ux-content-wall bleed", () => {
			div.c("flex v gap", () => { md("### [Question](Question/)"); new Question(question()); });
			div.c("flex v gap", () => { md("### [Decision](Decision/)"); new Decision(decision_fresh()); });
			div.c("flex v gap", () => { md("### [Quotation](Quotation/)"); new Quotation(quotation()); });
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
