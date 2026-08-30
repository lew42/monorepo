import { Deck, arrows } from "../deck.js";
import { chapters } from "../slides.js";

const here = new URL(".", import.meta.url).pathname;
const deck = chapters(here);

/* SWAP — the same four slides, and the whole screen changes.

   Every slide is `full`, so opening one hides the one before it: /imagine/screens/
   found that word and this deck only puts it beside its alternative. What is left where
   the rail used to be is the STRIP — the same four labels, redrawn identically on every
   slide, which is the third answer the head-to-head produced (doc/decisions.md): it
   reads as persistent, and it costs a 3em band instead of 22% of the row.

   Container: /imagine/'s column row, one `full` screen per slide. Size: the whole row.
   Own layout: one region plus the strip. Regions: one. Preview: the cut, twice. */

export default new Deck({
	meta: import.meta,
	title: "Swap",
	description: "The whole screen swaps per click — the same four slides as Persistent.",
	icon: "swap_horiz",
	group: "Head to head",
	shapes: ["1:s", "1:w"],

	width: "full",
	index: true,

	...arrows,
	next: deck[1].to,

	// Never seen: the `default` slide covers it. The fallback if that stops being true.
	content(){ deck[0].build(); },

	children: deck.map((ch, i) => new Deck({
		name: ch.name,
		title: ch.title,
		width: "full",
		classes: i ? null : "default",
		ring: deck,
		...arrows,
		prev: ch.prev, next: ch.next,
		content: ch.build,
	})),
});
