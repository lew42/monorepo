import { Deck, region, statement, slices, arrows, neighbor } from "../deck.js";

/* Container: /imagine/'s column row, one `full` screen. Size: 1719 + 1719 at 3440,
   959 + 959 at 1920, two bands at 400. Own layout: two regions at weight 1.
   Regions: two peers plus the strip. Preview: the cut, toned by content kind. */

export default new Deck({
	meta: import.meta,
	title: "Half",
	description: "50 / 50 — the only cut that says the two things are equal.",
	icon: "vertical_split",
	group: "The slices",
	shapes: ["1:s 1:s"],
	ring: slices,
	...arrows,
	...neighbor("half"),

	content(){
		region(50, () => statement("50 / 50", "Peers",
			"A half is a claim about the content, not about the screen: it says neither of these leads. Two statements, a before and an after, a claim and its rebuttal."));

		region(50, () => statement(null, "Or nothing",
			"Put a caption in the other half and at 3440 it is 1719px of orphan. The cut cannot rescue a pair that was never a pair — every other slice in this lab exists because most content is not two equal things."));
	},
});
