import { div } from "/app.js";
import { Deck, region, quiet, statement, list, wall, stack, slices } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: 633 / 1900 / 633 at 3440,
   335 / 1006 / 335 at 1920, three bands at 400. Own layout: three regions, 20 / 60 / 20.
   Regions: a rail, a poster, a wall. Preview: the cut. */

export default new Deck({
	meta: import.meta,
	title: "Poster",
	description: "20 / 60 / 20 — the best cut for a 3440: real rails, a real poster.",
	icon: "dashboard",
	group: "The slices",
	shapes: ["1:l 3:s 1:w"],
	ring: slices,

	content(){
		quiet(20, () => stack(() => {
			div.c("decks-eyebrow", "The slices");
			list(slices.map(item => ({ name: item.label, to: item.to, on: item.name === "poster" })));
		}));

		region(60, () => statement("20 / 60 / 20", "The poster",
			"Narrow the flanks and the middle becomes a wall you can put one sentence on. At 3440 this statement composes into 874px of block inside 1900px of region — placed, not stranded."));

		quiet(20, () => wall([
			{ k: "633px", name: "A flank", note: "At 3440. Wide enough for a list with second lines, or two card columns." },
			{ k: "335px", name: "At 1920", note: "A rail exactly. The same page, no breakpoint, no second file." },
			{ k: "band", name: "At 400", note: "Under 46em of screen the cut becomes three bands and the order is kept." },
		]));
	},
});
