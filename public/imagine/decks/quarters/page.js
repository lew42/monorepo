import { Deck, region, statement, slices } from "../deck.js";

/* THE ONE UNDER TEST. Four equal vertical regions — 791px each at 3440, 419 at 1920.
   Built to be shot and judged, not to be kept: the question is whether four peers side
   by side is a slide or a row of columns wearing display type. */

export default new Deck({
	meta: import.meta,
	title: "Quarters",
	description: "25 x 4 — four equal columns. Under test.",
	icon: "view_week",
	group: "The slices",
	shapes: ["1:s 1:s 1:s 1:s"],
	ring: slices,

	content(){
		[["No build", "The source is what ships."],
		 ["No server", "Production is static files."],
		 ["No deps", "npx and nothing else."],
		 ["No config", "A page exists when its parent names it."]]
			.forEach(([title, note]) => region(25, () => statement(null, title, note)));
	},
});
