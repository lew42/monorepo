import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened to the right of Mechanisms.
   Size: the default track (16em floor, 40–46em cap) — prose plus three rows.
   Own layout: prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Launch",
	description: "A click opens a new column to the RIGHT. The page you clicked from stays exactly where it was.",
	icon: "chevron_right",
	axes: "mech style",
	mode: { mech: "launch", style: "card" },

	takeaway: "**Launch: a click opens a new column to the RIGHT, and the page you clicked from stays exactly where it was.** Nothing closes and nothing moves — the row simply gets one column longer, and every page in it keeps its own state.",

	children: [
		leaf("Alpha", "A column of its own, beside the one that opened it. Nothing above it moved."),
		leaf("Beta", "The row scrolls if it has to; the crumb strip above never changes shape."),
		leaf("Gamma", "Three deep is the same gesture as one deep — that is what makes it a row."),
	],

	content(){
		this.lede();

		md("**Launch is a child column.** Core already has the word: a page under a columns host lays out as a full-height column to the right of its parent, and every ancestor stays open ([columns](/framework/core/Page/doc/columns/)).");
		md("Switch the **mechanism** chip and the same three rows behave differently — `takeover` gives the one you click the whole row, `expand` and `swap` never leave this box at all.");

		this.paging();
	},
});
