import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Swap",
	description: "A click replaces what is in the box. The box keeps its exact place on screen.",
	icon: "swap_horiz",
	axes: "mech style",
	mode: { mech: "swap", style: "prim" },

	takeaway: "**Swap: a click replaces what is in the box, and the box keeps its exact place on screen.** Nothing opens beside it and nothing moves — only the contents change, and the row you picked stays marked so you always know which one you are looking at.",

	children: [
		leaf("Same box", "The stage above did not move a pixel — only what it holds changed."),
		leaf("Same width", "No column opened, so no neighbour was pushed and nothing scrolled."),
		leaf("One way back", "The back chip. A swap with no way back is a dead end wearing a link's clothes."),
	],

	content(){
		this.lede();

		md("**Swap changes the content, never the box.** Click a row and the panel above it becomes that row — same position, same width, same everything else on screen. It is the gesture a right-hand tree makes into a centre pane, and the one a settings list makes into its detail.");
		md("Measured: the stage's top-left is identical before and after the click (1280 and 3440, [the proof](/framework/ai/2026-09-04/paging-core/)).");

		this.paging();
	},
});
