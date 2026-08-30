import { div } from "/app.js";
import { Deck, region, list, stack, arrows, notes } from "../deck.js";
import { chapters } from "../slides.js";

const here = new URL(".", import.meta.url).pathname;
const deck = chapters(here);

/* PERSISTENT NAVIGATION — and the finding is that it needs no mechanism.

   The rail is the PARENT COLUMN and the slides are its children, so the row already
   does the whole job: one child is active at a time, opening another replaces it, and
   the parent stays because it is the ancestor. "The navigation stays and a different
   region switches" is two shares in a stylesheet and nothing else (decks.css).

   ⚠ The rail cannot mark its own active row by hand. It is rendered once and NOT
     rebuilt when a child changes, so a hand-set flag would be stale one click later.
     `mark_links()` marks the ANCHORS on every navigation instead — `.in-path` /
     `[aria-current]` — which is what the rail's active rule keys on.

   Container: /imagine/'s column row. Size: a fixed 16em — 288 at 3440, 256 at 1920,
   one full band at 400. Own layout: one region holding a head and a list. Regions: one
   (the child stage is a column, not a region of mine). Preview: the cut, twice. */

export default new Deck({
	meta: import.meta,
	title: "Persistent",
	description: "A rail that stays while the stage switches — the same four slides as Swap.",
	icon: "menu_open",
	group: "Head to head",
	shapes: ["1:l 5:s", "1:l 5:w"],

	width: "full",
	classes: "decks-rail",
	index: true,

	// Arriving here shows slide one (it is `default`), so the host's own → steps to two.
	...arrows,
	next: deck[1].to,

	content(){
		region(100, () => stack(() => {
			div.c("decks-eyebrow", "Persistent");

			list(deck.map(ch => ({ name: ch.label, note: ch.blurb, to: ch.to })));

			notes(null, [
				"The rail stays. Click a row and only the column beside it is replaced — same urls, same Back, no re-render here.",
			]);
		}));
	},

	// ⚠ `name` explicitly, never left to `Page.slug(title)` — the urls are built above
	//   from the same list, and a retitled slide must not silently move.
	children: deck.map((ch, i) => new Deck({
		name: ch.name,
		title: ch.title,
		width: "fill",
		classes: i ? null : "default",
		...arrows,
		prev: ch.prev, next: ch.next,
		content: ch.build,
	})),
});
