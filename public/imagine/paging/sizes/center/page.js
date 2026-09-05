import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: this page opens on the `center` layout
   word and the chips move it — `dress()` restamps the column class on its own box.
   Own layout: prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Center",
	description: "A narrow track, and the content floats centre-centre in whatever height there is.",
	icon: "vertical_align_center",
	axes: "content layout style",
	takeaway: "**Center is a narrow track, with the content floating in the middle of whatever height the screen gives it.** The leftover room is the design, not dead space to be filled.",

	mode: { layout: "center", content: "s" },

	children: [
		leaf("A child", "Every page picks its own room. A layout word is never inherited."),
		leaf("Another", "Two rows, so the list can be seen against the width."),
	],

	content(){
		this.lede();

		md("**Centre-centre, not centre-left.** The column body becomes a flex column, its prose takes the leftover height, and the stage floats on auto margins inside a 26em cap. `margin-block: auto`, never `justify-content: center` — a centred flex line clips its own top edge when it overflows, and this box is a scroller.");
		this.paging();
	},
});
