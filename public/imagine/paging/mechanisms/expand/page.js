import { h2, md, details, summary, div, p } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row. Size: the default track. Own layout:
   prose, an accordion, then the stage. Regions: one. Preview: core's card.

   ⚠ THIS PAGE DOES NOT ROUTE, and says so in its first sentence. The owner's
     report: "clicking Launch changed the url to ./launch/, and expand does not …
     i don't think we have to route expandos." That is the decision, and the honest
     way to present it is to state it before the reader clicks, not to leave them
     checking the address bar to find out.                                        */

const QA = [
	["What is expand?", "The answer arrives UNDER the question, and the question is still on screen. No column opened, nothing else moved, and the address bar did not change."],
	["When is it the right answer?", "When the answer is short enough to read without losing your place — a definition, a count, a caption, a row of detail in a table."],
	["When is it the wrong one?", "When the thing you opened has children of its own, or is worth linking to. An expanded panel has no url, so there is nowhere to send somebody and nothing for the Back button to do."],
	["Why not just give it a url?", "Because then it would be `launch` with different paint. A thing that deserves an address deserves to be a column; a thing that does not should not pretend."],
];

export default new Paging({
	meta: import.meta,
	title: "Expand",
	description: "A click opens BELOW, in place — the item grows and the page you are on does not change.",
	icon: "expand_more",
	axes: "mech style",
	mode: { mech: "expand", style: "tint" },

	takeaway: "**Click any row on this page and it grows a panel underneath itself — and the url in your address bar does not change.** No column opens, nothing scrolls, and everything below the row you clicked simply slides down. `expand` is the one mechanism that is deliberately not a place: there is nothing here to link to, and that is the trade you are making.",

	children: [
		leaf("What it is", "A disclosure: the answer arrives under the question, and the question is still on screen."),
		leaf("When to reach for it", "An answer short enough to read without losing your place — a definition, a count, a caption."),
		leaf("When not to", "Anything with children of its own. A tree that expands in place has no url for where you are."),
	],

	content(){
		this.lede();

		h2("Try it — and watch the address bar");

		md("Open any of the four below. The bar at the top of your browser still says `/imagine/paging/mechanisms/expand/` and the Back button still goes to the page you arrived from, not to a closed row. This one is `ui/accordion` verbatim — `<details>` elements sharing a `name`, so opening one closes the last. **There is no JavaScript in it at all**; the browser does the disclosure.");

		div.c("surface flex v", () => QA.forEach(([question, answer]) =>
			details.c("ui-accordion-item pad", () => {
				summary(question);
				p.c("muted", answer);
			}).attr("name", "paging-expand-qa")));

		h2("The same thing, on this realm's stage");

		md("Below is the ordinary stage set to `expand`: click a row and a panel opens directly under it, marked and indented, with a link out to the column if you decide the thing deserved an address after all. Switch the **mechanism** chip to `launch` and the very same rows start changing the url — that one chip is the whole difference between a gesture and a place.");

		this.paging();
	},
});
