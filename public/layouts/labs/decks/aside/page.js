import { div } from "/app.js";
import { Deck, region, quiet, stage, notes, slices, arrows, neighbor } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: 2407 / 1031 at 3440,
   1343 / 575 at 1920, two bands at 400. Own layout: two regions, 70% and 30%.
   Regions: a stage and its aside, plus the strip. Preview: the cut. */

export default new Deck({
	meta: import.meta,
	title: "Aside",
	description: "70 / 30 — a stage and the aside that has to earn 1031px.",
	icon: "crop_16_9",
	group: "The slices",
	ring: slices,
	...arrows,
	...neighbor("aside"),

	content(){
		region(70, () => stage("A stage is the one kind with no natural width — it takes 2407px the same way it takes 400.",
			() => div.c("decks-bars", () => [62, 38, 84, 24, 70, 46, 92, 33].forEach(h =>
				div.c("decks-bar").style("height", h + "%")))));

		quiet(30, () => notes("Thirty percent of 3440 is 1031px", [
			"Which is the trap in this cut. A nav list here is a label with 880px of nothing before its chevron — `core/Page/doc/columns.md` measured that exact failure when a rail was widened to absorb a row.",
			"So the aside holds a kind that has something to say at 1031px: a caption stack, an agenda whose rows carry a second line, a set of numbers.",
			"A bare list belongs in a **fixed** track, which is what `small` is for — not in a share.",
		]));
	},
});
