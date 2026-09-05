import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose then the stage. Regions: one. Preview: core's card. */

export default new Paging({
	meta: import.meta,
	title: "Expand",
	description: "A click opens BELOW, in place — the item grows and the page you are on does not change.",
	icon: "expand_more",
	axes: "mech style",
	mode: { mech: "expand", style: "tint" },

	takeaway: "**Expand: a click opens a panel BELOW the row you clicked, in place.** No column opens and no url changes — the row grows and everything under it slides down.",

	children: [
		leaf("What it is", "A disclosure: the answer arrives under the question, and the question is still on screen."),
		leaf("When to reach for it", "An answer short enough to read without losing your place — a definition, a count, a caption."),
		leaf("When not to", "Anything with children of its own. A tree that expands in place has no url for where you are."),
	],

	content(){
		this.lede();

		md("**Expand never navigates.** There is no new column and no new url — the row you clicked grows a panel underneath itself and everything below it slides down. That is the whole difference from `launch`, and it is why the icon points *down*.");
		md("The trade is the url: an expanded panel is not a place you can link to or come back to. Every panel here offers the column as a way out.");

		this.paging();
	},
});
