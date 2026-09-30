import { Page, p, h3, h4, div, demo } from "/app.js";
import { BOXED_LEVELS } from "../depth.js";

// One function draws every level. Levels 1 through BOXED_LEVELS get the box
// (`.card`); anything deeper drops it and just gets a bigger, bolder heading
// standing in for the missing border — the owner's rule: "a big heading and
// the content underneath at the same indentation, no extra box." The level
// number is read here, in JS, not worked out from CSS — doc/system.md says
// why. `card/log/LogView.js` draws a Logger's nested groups to this exact
// same rule, from this same constant, so the two can't drift apart again.
function level(n, title, body, deeper){
	const boxed = n <= BOXED_LEVELS;
	const heading = boxed ? h4 : h3;

	div.c(`${boxed ? "card " : ""}card-level-${Math.min(n, 5)}`, () => {
		heading(title);
		p(body);
		if (deeper) deeper();
	});
}

export default new Page({
	meta: import.meta,
	title: "Nesting",
	description: "Levels 1, 2 and 3 are boxes. Level 4 and deeper drop the box and become a plain heading at the same indentation — padding runs out before a reader's patience does.",
	icon: "layers",

	content(){
		p("\"After the third level, you're kind of maxing out your padding space,\" the owner said — so this system stops adding boxes there. A section title doesn't need its own box either: \"a H2 section... uses a big heading and then the first paragraph underneath is at the same indentation level.\" Five levels below, and it still reads at 400px wide.");

		demo(() =>
			level(1, "Section", "Level 1 — boxed.", () =>
				level(2, "Subsection", "Level 2 — still boxed.", () =>
					level(3, "Detail", "Level 3 — the last box. One more level and padding runs out.", () =>
						level(4, "Deeper still", "Level 4 — no box. A bigger heading carries the hierarchy instead, at the SAME indentation as level 3's own content.", () =>
							level(5, "Deepest", "Level 5 — quieter again, and capped here: a real object graph would keep going, but a reader's eye would not.")
						)
					)
				)
			),
		"Five calls deep: three boxes, then two plain headings, never a fourth border.");
	},
});
