import { div, p } from "/app.js";
import { Screen, sheet } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* TITLE SLIDE → DOCUMENT. The title is the whole screen; entering opens the document
   in a column to its right and the title steps back to the MINOR share of the golden
   section and stays there as the cover. It is the same page throughout — no second
   render, no state — because a column's width is a CSS question and screens.css asks it
   with one `:has()`.

   The share, not a rail: 38.2% is still 733px at 1920, which is enough to hold the
   title at display size. A 14em rail was the first try and it made the title a heading
   (27px) beside 1696px of document — see doc/decisions.md. */

export default new Screen({
	meta: import.meta,
	title: "Title Slide",
	description: "Enter, and the title steps back to the minor share.",
	icon: "auto_stories",
	classes: "screens-cover",
	shapes: ["1", "0.618 1"],

	content(){
		sheet(here + "document/", () => {
			div.c("screens-rule");
			div.c("screens-label", "Title");
			div.c("screens-note", "A title, one accent, nothing else. Enter, and the document takes the major share and this keeps the minor one.");
		});
	},

	children: [
		new Screen({
			title: "Document",
			width: "fill",

			// The major share of the pair. `screens-major` is Uneven's own word, reused
			// exactly — shares compose, so the cover's 38.2% and this 61.8% ARE the
			// golden section, at every width.
			classes: "screens-major",

			content(){
				sheet(null, () => {
					div.c("screens-eyebrow", "The document");
					div.c("screens-prose flow", () => {
						p("The cover did not go away and it did not redraw. It is the same column it always was, one CSS rule narrower — screens.css asks whether this page has an open child, and hands the cover the minor share when it does.");
						p("That is the difference between a cover and a title screen. A title screen is a hop you leave behind; a cover is a page that stays and gives up the room. Both are one word in a page.js.");
						p("Under 32em of row the arrangement pages one column at a time, so on a phone the cover IS a screen again — and you swipe back to it.");
					});
				});
			},
		}),
	],
});
