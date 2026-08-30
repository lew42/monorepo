import { Shell } from "../Shell.js";
import { div, span, md } from "/app.js";

/* Container: the app region, full viewport. Size: a header bar, a 13em rail, and
   a content area that ends in a status line of its OWN. Own layout: the one grid,
   a flex column inside `main`. Regions: three. Preview: default card.

   ⚠ The pane scrolls, the status line does not — that is the entire reason to put
     a bar inside an area rather than at the bottom of the app. */

export default new Shell({
	meta: import.meta,
	title: "Inner status bar",
	description: "A footer INSIDE the content area — and how it stays the content's, not the app's.",
	icon: "table_chart",
	group: "Inner chrome",

	head(){ return this.bar("head"); },
	left(){ return this.rail("left"); },

	main(){
		return div.c("shell-main shell-stage", () => {
			div.c("shell-pane", () => {
				div.c("shell-doc flow", () => {
					this.content();
					this.verdict();
				});

				div.c("shell-inner-bar", () => {
					span("128 rows");
					span("filtered by owner");
					span.c("shell-end", "updated 2 min ago");
				});
			});
		});
	},

	content(){
		md(`## What the pane is showing

The line at the bottom of this area belongs to the area. It counts what is in the pane, it says how the pane is filtered, and it does not move when the pane scrolls.

The app's own footer — [Sidebar + footer](/imagine/shells/rail-foot/) — spans the whole floor, under the rail. This one stops at the content's edges, which is exactly how you tell the two apart without reading either.

Three things keep it the content's: it shares the paper's surface, it is a hairline rather than a band, and it is one type step down from the chrome above it. Take any one of those away and it starts reading as a second app footer that happens to be indented.`);

		for (let i = 1; i <= 12; i++) md(`Row ${i} — something to scroll, so the status line can be seen staying put.`);
	},

	finding: "an inner status line reads as the content's while it stops at the content's edges, shares its surface, and stays a hairline. An app footer spans the floor under every rail; if the inner one starts doing that, there is no inner area left — only a second footer.",
});
