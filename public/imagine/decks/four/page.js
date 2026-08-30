import { Deck, col, region, quiet, statement, wall, notes, list, slices } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: four cells of 1583 x half
   the height at 3440, 838 at 1920, four bands at 400. Own layout: two `col`s of two
   regions. Regions: four, plus the strip. Preview: the 2x2. */

export default new Deck({
	meta: import.meta,
	title: "Four",
	description: "2 x 2 — four peers, and the one that has to be heavier.",
	icon: "grid_view",
	group: "The slices",
	shapes: ["q"],
	ring: slices,

	content(){
		col(50, () => {
			region(100, () => statement("2 × 2", "Four",
				"A quadrant says these are peers with no sequence. The eye still has to start somewhere, so exactly one cell carries the accent — and this is it."));

			quiet(100, () => notes("No order", [
				"Nothing about a 2 × 2 says which cell is second. Put four steps in one and the reader invents an order that was never yours.",
				"Four **claims**, four **numbers**, four **options** — those have no order to lose.",
			]));
		});

		col(50, () => {
			quiet(100, () => wall([
				{ k: "kind", name: "Wall", note: "Answers a wider cell with more columns. The best citizen of any share." },
				{ k: "kind", name: "Stage", note: "An aspect box. Never has a wrong width." },
				{ k: "kind", name: "Notes", note: "Caps at its own measure and centres. The region decides the room." },
				{ k: "kind", name: "List", note: "Does not scale. Wants a fixed track, never a share." },
			]));

			quiet(100, () => list(slices.map(item => ({
				name: item.label, to: item.to, on: item.name === "four",
			}))));
		});
	},
});
