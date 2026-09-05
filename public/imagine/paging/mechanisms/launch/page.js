import { h2, md } from "/app.js";
import { Paging } from "../../paging.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide` —
   a box plus a column beside it needs the leftover. Own layout: a sentence, the
   live page, one short section. Regions: one. Preview: core's card.

   ⚠ THE REAL LAUNCH IS CORE'S COLUMNS, and it is demonstrated INSIDE the stage
     rather than by taking over the app around it. That is decision 5 of 2026-09-05:
     the realm runs on stable navigation, and the dynamic mechanisms are shown
     inside a frame that holds still. The real thing, at full size, is /imagine/
     itself — every realm on that page is a column of one row. */

export default new Paging({
	meta: import.meta,
	title: "Launch",
	description: "A click opens a new column to the right. The page you clicked from stays where it was.",
	icon: "chevron_right",

	content(){
		this.lede("Click a page name on the page below. A column opens to its right, and the line underneath says what that did to the box.");

		this.stage({ navigation: "columns", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" });

		h2("What it costs");

		md("The box beside the new column **shrank** — the line under the page says by how many pixels. That is the trade: a launch never replaces what you were reading, but it does move it. Reach for it when the child is a real place worth an address of its own, and for a rail or tabs when it is not.");

		md("At full size this is [core's columns](/framework/core/Page/doc/columns/), and the biggest one on this site is [/imagine/](/imagine/) — every realm there is a column of one row.");
	},
});
