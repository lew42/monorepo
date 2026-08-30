import { div, md } from "/app.js";
import { Screen, area } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* A FULL MENU → QUADRANTS. Four areas, each a link, filling the screen. Opening one
   does not replace the menu: it takes 72% of the row and the menu keeps the rest — at
   which point the 2x2 has no room to be a 2x2 and becomes a single column of four.

   That reflow is asked of the SCREEN's own width, not the window's, so it happens when
   the menu runs out of room rather than at a breakpoint someone guessed: at 1920 the
   menu stacks the moment a quadrant opens, and at 3440 it stays a 2x2, because there
   it genuinely still fits.

   The quadrants are ordinary column pages, not screens — a head, an inset, a ×. It is
   worth seeing the two next to each other: a screen is a page that gave up its chrome,
   nothing more. */

export default new Screen({
	meta: import.meta,
	title: "Quad",
	description: "A 2x2 menu that stacks when a quadrant opens.",
	icon: "grid_view",
	classes: "screens-minor",
	shapes: ["q", "1 2.6"],

	content(){
		div.c("screens-quad", () => {
			area("Axis", "Row or height?", here + "axis/");
			area("Count", "How many at once?", here + "count/");
			area("Ratio", "Equal, or not?", here + "ratio/");
			area("Swap", "Join, or replace?", here + "swap/");
		});
	},

	children: [
		{
			title: "Axis", width: "fill", classes: "screens-column",
			content(){ md("**The row divides itself; the height does not.** A hop to the right is a column and costs nothing but a url. A hop downwards has no row to open into, so the screen redraws with one more band — see [Stack](/imagine/screens/stack/). Both are the same page tree; only one of them is free."); },
		},
		{
			title: "Count", width: "fill", classes: "screens-column",
			content(){ md("**Four is where it stops being useful.** At 1920 a quarter of the row is 480px, which is a rail with a headline in it. Past four the row scrolls instead of shrinking, and scrolling a row of screens is a different experience than dividing one — see [Divide](/imagine/screens/divide/)."); },
		},
		{
			title: "Ratio", width: "fill", classes: "screens-column",
			content(){ md("**A basis is a share.** Columns asking for 61.8% and 38.2% of a row are shrunk in proportion, so those two numbers are the golden section at every width — no grow weights, no media queries. [Uneven](/imagine/screens/uneven/) is three of them."); },
		},
		{
			title: "Swap", width: "fill", classes: "screens-column",
			content(){ md("**Two words, and that is the whole space.** A page saying `full` replaces the screen you were on; one saying `fill` joins it and everyone shares. A deck is the first; a split is the second; a cover is the first that changed its mind — [Title Slide](/imagine/screens/title/)."); },
		},
	],
});
