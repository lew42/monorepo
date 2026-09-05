import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, a nav grid of eight. Regions: one.
   Preview: core's card.

   ⚠ CONTENT IS NOT A SIZE. Until 2026-09-05 this axis was one canned sample drawn at
     five heights (`xs`–`xl`), which the owner read as a content switcher because
     that is exactly what it was. Every value below is a different KIND of content,
     and each one is drawn by a module this site already ships. */

export default block({
	meta: import.meta,
	title: "Content",
	icon: "article",
	description: "What is in the box.",

	axis: "content",

	lede_line: "Change the **content** dropdown on the page below — the box stays where it is and something else entirely appears in it.",

	config: { navigation: "none", content: "cards", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
});
