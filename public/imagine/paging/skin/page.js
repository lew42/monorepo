import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, a nav grid of five. Regions: one.
   Preview: core's card.

   ⚠ TWO COLOURS, NOT ONE. The owner's report: "card gives the content a bg, whereas
     the other colors change the whole column. i think we want the ability to switch
     either one to any color." So the hover toolbar has two rows of the same five
     swatches — the top row paints the content box, the bottom row paints the page
     behind it — and this page's nav grid is that one list of five. */

export default block({
	meta: import.meta,
	title: "Skin",
	icon: "palette",
	description: "The colours and the type size.",

	axis: "surface",

	lede_line: "Hover the page below: the toolbar has **two rows of colour**. The top row paints the box, the bottom row paints the page behind it, and they are independent.",

	config: { navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "prim", type: "regular" },
});
