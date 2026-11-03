import { Page, md } from "/app.js";
import { NestingStudy } from "./nesting.js";

/**
 * Nesting is padding (2026-09-18). The owner's own words: "once you put something in a
 * card it has to be double padded to have a background color different from the card
 * color — padding on the outer container, padding on the card, and an inner card is
 * three levels of padding from the edge of the viewport." This page shows that, rather
 * than saying it: one dataset, four shapes, live numbers read off the real render.
 *
 * Layout (the five questions). Container: a page under `/framework/styles/system/studies/spacing/`, same
 * as its siblings `ceilings` and `audit` — a plain page grid, not a columns host. Size:
 * `full`, matching every sibling in this realm. Own layout: the two computed sentences
 * sit in the page's own reading column; the four-variant wall claims `wide` (every pixel
 * the page's middle has, minus its own two gutters) so it can go side by side at 1280 —
 * `nesting.css`'s own breakpoint stacks it to one column under 900px, so it reads as four
 * rows at 400. Regions: three — the sentences, the wall, and the decisions record one
 * click down. Preview: core's default card.
 */
export default new Page({
	meta: import.meta,
	title: "Nesting",
	description: "The same three-level content, drawn four ways — cards in cards in cards, two levels, a flat list, and a tree — with live readouts of how much room is left for the words.",
	icon: "layers",
	width: "full",

	content(){
		const study = new NestingStudy();

		study.takeaway_box();

		const $wall = study.wall().ac("wide");

		md("**The content is real, not invented for this page:** one module of this framework, `ux/Tree`, its own one-line blurb, and the first sentence of three of its own demo notes — a topic, three items, and each item's one-line detail, the same three levels in all four boxes below.");

		study.guidance_box();

		md.details(import.meta, "decisions.md", "The record — what was measured, and the alternative (one shared ground, hairlines) when it wins");

		// Nothing can be read until the browser has laid the wall out.
		study.watch($wall);
	},
});
