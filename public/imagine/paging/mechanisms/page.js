import { div, h2, span, a, icon, md } from "/app.js";
import { Paging } from "../paging.js";
import { DEFAULT } from "../blocks.js";
import { DEMOS } from "../demos.js";

/* Container: the app's middle. Size: prose at the measure, the wall and the stage
   on `wide`. Own layout: four miniatures you click in place, a sentence, one live
   page you can change. Regions: one. Preview: core's card, in the rail's Mechanisms
   section.

   ⚠ THE FOUR ARE THE FIRST THING ON THE PAGE, AND THEY ARE THE HUB'S OWN FOUR.
     Until 2026-09-17 this page opened on one article-shaped stage — the same first
     screen as five other pages in the realm — and the four mechanisms it is named
     after were four TEXT cards 1,000px down, while the four LIVE miniatures sat on
     the realm's front page, where a reader had not yet met the word. The hub is one
     screen now (the owner, 2026-09-17), so the miniatures moved to the page they are
     about. Each one is a small box you click right there, with nothing to navigate
     to and nothing to read first; `../demos.js` draws them and carries the reasons.

   ⚠ WHY MINIATURES AND NOT FOUR REAL STAGES. The real `launch` and the real
     `takeover` are core's columns — a child column, and `width: "full"` — which need
     the whole row to show. A 200px picture of the gesture, clickable, teaches the
     SHAPE; the link under each one goes to the real thing at full size.          */

export default new Paging({
	meta: import.meta,
	title: "Mechanisms",
	description: "The four things a click can do, against the same four children.",
	icon: "alt_route",

	index: true,
	depth: 1,

	children: "launch expand swap takeover",

	/* ⚠ ONE DROPDOWN, NOT SEVEN. A mechanism IS a value of the `navigation` word, so
	     that is the only control this page's bar carries; the other six words are
	     behind its `More` button, which says how many are in there. `toolbar.js`
	     `shows()`, and the owner's line on 2026-09-17: *"the number of controls in
	     the toolbar became way too many."* */
	bar_axes: ["navigation"],

	content(){
		div.c("paging-cards wide", () => DEMOS.forEach(demo => this.gesture(demo)));

		this.lede("**Four boxes, and every one of them works right here.** Click inside one and watch what moves — that is the whole difference between the four.");

		h2("Or change the word on a real page");

		md("One dropdown over the page below, holding all seven navigation words. Click the four page names, change the word, and click them again: same children, different answer.");

		this.stage({ ...DEFAULT, navigation: "tabs", content: "article", room: "wide", background: "tint" });

		md("**Two of the four change the url.** `launch` and `takeover` are core's own columns vocabulary — a child column, and `width: \"full\"` — so both are real navigation with a real address and a real Back button. `expand` and `swap` are states of the page you are already on. The long form: [the four mechanisms](/imagine/paging/doc/mechanisms/) · [columns](/framework/core/Page/doc/columns/).");
	},

	/* ONE GESTURE: the miniature does its thing right here, with nothing to read
	   first, and the link under it goes to the page that does it at full size.
	   ⚠ NOT `card()` — `card` is data core reads off a page (`Page.nav()` hands
	     `this.card` to `.ac()`), so a method by that name kills every preview on the
	     parent's wall. The realm has met this three times. */
	gesture(demo){
		return div.c("paging-card", () => {
			span.c("paging-card-head", () => {
				icon(demo.icon);
				span(demo.word);
			});

			demo.draw();

			span.c("paging-card-say", demo.takeaway);

			a.c("page-link", demo.says).href(demo.real);
		});
	},
});
