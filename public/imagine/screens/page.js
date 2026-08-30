import { Page, md } from "/app.js";

/* Container: /imagine/'s column row, one `large` column. Size: 28–64em. Own layout:
   a line of prose and core's previews wall. Regions: one, core's. Preview: the default
   card on the rail.

   This index is an ordinary column ON PURPOSE — it is the last thing you see before a
   screen takes over, so it keeps its head, its × and its nav rows. Everything it links
   to has none of them. */

export default new Page({
	meta: import.meta,
	title: "Screens",
	description: "Full-screen experiences — how navigation transforms a whole screen.",
	icon: "fullscreen",
	width: "large",
	index: true,

	children: "divide stack title read deck uneven quad mix",

	content(){
		md("**Eight screens, one row.** `/imagine/` is a columns host, so a screen here is not a shell — it is the width word [`full`](/framework/core/Page/doc/columns/), which folds the rail and this index into the crumb strip above and leaves you the viewport. What each experiment varies is what the NEXT hop does with it.");

		md("Two words cover the whole space: **`full` replaces** the screen you were on, **`fill` joins** it and the screens left divide the row evenly. The cards below are the shapes each experiment draws, hop by hop.");

		this.previews();

		md("Every verdict in one table, and what the space taught: [readme](/imagine/screens/readme/).");
	},
});
