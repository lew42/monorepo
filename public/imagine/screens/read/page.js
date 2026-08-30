import { div, a, p } from "/app.js";
import { Screen, sheet } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* THE INVERSE. Document first, the title as a PEEK — a 2.8em strip at the screen's
   edge. Opening it does not take the screen: the cover arrives as a `small` 14em rail
   on the right and the document keeps everything else. Same two pages as the cover
   experiment, the roles swapped, and the only difference in the source is which one
   says `full` and which says `small`. */

export default new Screen({
	meta: import.meta,
	title: "Peek",
	description: "Document first; the title is a strip at the edge.",
	icon: "chrome_reader_mode",
	shapes: ["1", "1 0.35"],

	content(){
		sheet(null, () => {
			div.c("screens-eyebrow", "Reading");
			div.c("screens-prose flow", () => {
				p("A document that opens at full width has nowhere to put its title, so the title becomes a strip: the vertical band on the right edge is the cover, folded before you ever see it.");
				p("Click it and it unfolds to a 14em rail — the width word is small, so the document is not asked to give up a share for a heading. That is the honest inverse of the cover: whichever page leads keeps the room, and the other one is a rail. The cost is that a 14em rail cannot hold display type, and the cover experiment can.");
				p("The strip disappears once the cover is open, because a link to where you already are is not an affordance.");
			});
		});

		a.c("screens-peek", "Cover").href(here + "cover/");
	},

	children: [
		new Screen({
			title: "Cover",
			width: "small",

			content(){
				sheet(null, () => {
					div.c("screens-rule");
					div.c("screens-label", "Peek");
					div.c("screens-note", "The cover, unfolded. It never took the screen — which is why the title is a heading here and display type in the cover experiment.");
				});
			},
		}),
	],
});
