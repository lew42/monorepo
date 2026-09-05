import { md } from "/app.js";
import { Paging, leaf, MECHANISMS } from "../paging.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a column in /imagine/'s row — the same row every page in this
                program lives in. There is no shell here and no fixed positioning.
   2 SIZE       the default track (16em floor, 40–46em cap) and, inside it, a 26em
                stage. The content is deliberately smaller than its room: that
                leftover IS the design, not dead space to be filled.
   3 OWN LAYOUT the column body becomes a flex column, its prose takes the leftover
                height, and the stage floats on auto margins — centre-centre in
                whatever height the viewport gives it, at 400 and at 3440 alike.
   4 REGIONS    one. The three items are children of this page, so each is a real
                url whichever mechanism opens it.
   5 PREVIEW    core's card.

   ⚠ `margin-block: auto`, never `justify-content: center`. This body is a scroller
     (`overflow-y: auto`), and a centred flex line whose content outgrows it clips
     its own TOP edge — the half you cannot scroll back to. Auto margins collapse
     to zero the moment there is no room to spare, which is the behaviour you want.

   THE OWNER'S IDEA, VERBATIM: "a small amount of content floats center center. a
   click launches to the right, or swaps it entirely, or even takes over the entire
   screen? we want these basic mechanisms on each page, so we can automatically
   experience the transition from one to another." The chip row above the stage is
   that "automatically": one click changes what the SAME three items do. */

export default new Paging({
	meta: import.meta,
	title: "Center",
	description: "A small amount of content, floating centre-centre — and three ways for a click to leave it.",
	icon: "vertical_align_center",
	axes: "mech style",
	mode: { layout: "center", content: "s", mech: "launch" },

	takeaway: "**A small amount of content, floating in the middle of the column — and three different ways for a click to leave it.** Press a chip and the SAME three items behave differently: that is what makes the four mechanisms comparable.",

	children: [
		leaf("Launch me right", "You arrived as a column beside the page you left. It is still there, still centred, still holding its own state.", { mode: { layout: "center", style: "card" } }),
		leaf("Swap me in place", "Nothing opened. The box you were looking at kept its exact position and changed what it held.", { mode: { layout: "center", style: "tint" } }),
		leaf("Take the screen", "Every ancestor collapsed into the crumb strip. Click a crumb and the row comes back untouched.", { mode: { layout: "center", style: "dark" } }),
	],

	content(){
		// ⚠ The page's OWN prose is short on purpose: this column is a demonstration
		//   of *a small amount of content*, and four paragraphs of explanation above
		//   the stage is the thing it is arguing against. The long note goes below.
		this.lede();

		this.paging();

		md("Change the mechanism and read the icons: " +
			["launch", "swap", "takeover"].map(word => "`" + word + "` " + MECHANISMS[word].does).join(" · ") + ".");

		md("Centring is not a shell. The whole of it is: the column body is a flex column, its prose takes the leftover height, and the stage floats on auto margins inside a 26em cap. Three declarations, no viewport unit, and it holds at every width because the height it centres in is the one the row already had.");
	},
});
