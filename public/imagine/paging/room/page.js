import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide` — so
   the `wide` value has room to actually be wide (2830px at 3440). Own layout: a
   sentence, one live page, a nav grid of four. Regions: one. Preview: core's card.

   Four width words, and they are core's own column words in plain English. `full`
   really does take the screen; the way back is at its top-left. */

export default block({
	meta: import.meta,
	title: "Room",
	icon: "width_wide",
	description: "How much of the screen the box gets.",

	axis: "room",

	lede_line: "Click a **room** chip, then read the line under the box: it says how many pixels the box just grew or shrank by.",

	config: { navigation: "none", content: "cards", room: "reading", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
});
