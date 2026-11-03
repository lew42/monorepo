import { Deck, region, quiet, statement, notes, slices, arrows, neighbor } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: 2125 / 1313 at 3440,
   1185 / 733 at 1920, two bands at 400. Own layout: two regions, 61.8% and 38.2%.
   Regions: a lead and its support, plus the strip. Preview: the cut. */

export default new Deck({
	meta: import.meta,
	title: "Golden",
	description: "61.8 / 38.2 — a lead and its support, the workhorse cut.",
	icon: "view_column",
	group: "The slices",
	ring: slices,
	...arrows,
	...neighbor("golden"),

	content(){
		region(61.8, () => statement("61.8 / 38.2", "A lead",
			"The one ratio nobody has to argue about. The major share holds the thing you are saying; the minor share holds what it needs beside it and never competes for the eye."));

		quiet(38.2, () => notes("The minor share is not small", [
			"At 3440 it is **1313px** — wider than a whole 40em measure, and wider than most of this site's reading columns.",
			"So the support is a **capped block inside its region**, not a column of 1313px prose. The region decides the room; the text decides the measure.",
			"Give the minor share a nav list instead and you get the opposite problem — see **70 / 30**.",
		]));
	},
});
