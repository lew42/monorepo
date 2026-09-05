import { div, h2, p, span, a, icon, md } from "/app.js";
import { Paging } from "../paging.js";
import { MECHANISMS } from "../words.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, a nav grid of four. Regions: one.
   Preview: core's card, in the rail's Mechanisms section.

   ONE PAGE, ONE SET OF CHILDREN, FOUR ANSWERS. Change the navigation dropdown on
   the page below and the same four rows behave four different ways — which is the
   whole idea, and it is one gesture rather than four pages of prose. */

const FOUR = [
	["swap", "Swap", "The box keeps its place and changes what it holds."],
	["launch", "Launch", "A new column opens to the right; the page you clicked from stays."],
	["expand", "Expand", "The row grows downward, in place. Nothing else moves."],
	["takeover", "Takeover", "One child fills the screen; everything behind it becomes the trail."],
];

export default new Paging({
	meta: import.meta,
	title: "Mechanisms",
	description: "The four things a click can do, against the same four children.",
	icon: "alt_route",

	index: true,
	depth: 1,

	children: "launch expand swap takeover",

	content(){
		p.c("paging-lede", "Click the four page names on the page below. Then change the **navigation** dropdown and click them again — same children, different answer.");

		this.stage({ navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" });

		h2("The four, each on its own page");

		div.c("paging-cards", () => FOUR.forEach(([name, title, says]) =>
			a.c("paging-card").href(this.url + name + "/").append(() => {
				span.c("paging-card-head", () => { icon(MECHANISMS[name].icon); span(title); });
				span.c("paging-card-say", says);
			})));

		md("**Two of the four change the url.** `launch` and `takeover` are core's own columns vocabulary — a child column, and `width: \"full\"` — so both are real navigation with a real address and a real Back button. `expand` and `swap` are states of the page you are already on. The long form: [the four mechanisms](/imagine/paging/doc/mechanisms/) · [columns](/framework/core/Page/doc/columns/).");
	},
});
