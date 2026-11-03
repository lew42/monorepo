import { div } from "/app.js";
import { Deck, region, quiet, statement, list, notes, stack, slices, base, arrows, neighbor } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: 859 / 1718 / 859 at 3440,
   479 / 958 / 479 at 1920, three bands at 400. Own layout: three regions, 25 / 50 / 25.
   Regions: where you are, what you are saying, what is next. Preview: the cut. */

export default new Deck({
	meta: import.meta,
	title: "Triptych",
	description: "25 / 50 / 25 — the presenter's shape: place, statement, notes.",
	icon: "view_agenda",
	group: "The slices",
	shapes: ["1:l 2:s 1:n"],
	ring: slices,
	...arrows,
	...neighbor("triptych"),

	content(){
		quiet(25, () => stack(() => {
			div.c("decks-eyebrow", "Where you are");
			list(slices.map(item => ({
				name: item.label,
				note: item.name === "triptych" ? "this cut" : null,
				to: item.to,
				on: item.name === "triptych",
			})));
		}));

		region(50, () => statement("25 / 50 / 25", "Flanked",
			"The middle keeps the whole statement and the flanks hold everything that is not it. Two rails, one stage, and the eye never has to choose where to start."));

		quiet(25, () => notes("What the flanks cost", [
			"At 1920 a flank is **479px** — a real rail, and the list beside this text is at its natural width there.",
			"At 3440 it is **859px**, which is past what a row of labels can fill. The list caps itself at 26em and the leftover becomes a margin; that is the fix, not a wider row.",
			"Narrower flanks and a bigger middle is the next cut along — [20 / 60 / 20](" + base + "poster/).",
		]));
	},
});
