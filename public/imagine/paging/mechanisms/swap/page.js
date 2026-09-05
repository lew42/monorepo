import { h2, md } from "/app.js";
import { Paging, leaf } from "../../paging.js";
import { PagingSwapper } from "./swap.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row. No page grid down here — content sits
                in `.page-column-prose`, so `wide` is meaningless and only `bleed`
                reaches the edge (core/Page/doc/columns.md).
   2 SIZE       the default track: a 16em floor, a 40–46em cap. 535px at 1280,
                ~700 at 1920 and 3440. A stage plus three labels; prose either side.
   3 OWN LAYOUT prose, then the swap stage (a picker and one rectangle), then the
                answer to the owner's question, then the generic stage so the same
                gesture can be compared with the other three mechanisms.
   4 REGIONS    one — core's.
   5 PREVIEW    core's default card.

   ⚠ THE STAGE IS THE POINT OF THIS PAGE. Everything here happens inside a
     rectangle that was already on screen and drawn with an edge before you touched
     it. `paging.css` gives `.paging-swapper-stage` a FIXED height for exactly that
     reason — the caption measures the rectangle before and after every click and
     says whether it moved, and a box that could resize would make that a claim
     rather than a measurement.                                                   */

export default new Paging({
	meta: import.meta,
	title: "Swap",
	description: "A click replaces what is in the box. The box keeps its exact place on screen.",
	icon: "swap_horiz",
	axes: "mech style",
	mode: { mech: "swap", style: "prim" },

	takeaway: "**Nothing on this page navigates: every click changes what is inside one rectangle, and the url in your address bar never changes.** Pick a panel and watch the white box — it does not move, does not resize, and does not scroll the page. That is `swap`, and the caption under the box measures it for you each time.",

	children: [
		leaf("Same box", "The stage above did not move a pixel — only what it holds changed."),
		leaf("Same width", "No column opened, so no neighbour was pushed and nothing scrolled."),
		leaf("One way back", "The back chip. A swap with no way back is a dead end wearing a link's clothes."),
	],

	content(){
		this.lede();

		h2("Four ways to swap, on one stage");

		md("The white rectangle below is the **stage**. Choose one of the three panel names and its content changes; choose one of the four **swap visuals** and the same change is drawn a different way. The stage itself is the constant — same place, same size, every time.");

		new PagingSwapper();

		h2("So is swap just tabs?");

		/* THE OWNER'S QUESTION, ANSWERED IN TWO SENTENCES. It is the reason this
		   page was rebuilt, so it gets a heading of its own rather than a line in a
		   paragraph somebody has to find. */
		md("**Tabs are one swap visual, not the mechanism.** The mechanism is *the stage stays, the content changes* — and the four chips above are four ways to draw it: a tab strip joined to its panel, a card sliding in over the one leaving, a cross-fade in place, and a card that turns over.");

		md("Which one to reach for is a question about how much of a jump the reader has to absorb. **Tabs** and **cross-fade** move nothing at all, so they are the quiet ones; **card-in** shows a direction, which is worth its 220ms when the panels are a sequence; **flip** says *this is the other side of the same thing*, and says it loudly enough that it is wrong for anything you switch often.");

		h2("The same rows, under any mechanism");

		md("Below is this realm's ordinary stage, set to `swap`. Click a row and the box above it becomes that row — the box keeps its place, and the row you picked stays marked so you always know what you are looking at. Then switch the **mechanism** chip: the very same three rows will `launch` a column, `expand` a panel underneath themselves, or hand one child the whole row. Only two of those four change the url.");

		this.paging();

		md("Measured: the stage's top-left is identical before and after the click, at 1280 and 3440 ([the proof](/framework/ai/2026-09-04/paging-core/)); the four visuals above were measured the same way ([2026-09-05](/framework/ai/2026-09-05/paging-mechanisms-v2/)).");
	},
});
