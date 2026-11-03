import { Shell } from "../Shell.js";
import { span } from "/app.js";

/* Container: the app region, full viewport. Size: two auto rows framing one
   `minmax(0, 1fr)`. Own layout: the one grid, `head` + `main` + `foot`. Regions:
   three. Preview: default card. */

export default new Shell({
	meta: import.meta,
	title: "Header + footer",
	description: "Two bars framing the page — identity above, state below.",
	icon: "view_agenda",
	group: "Outer chrome",

	head(){ return this.bar("head"); },
	foot(){ return this.bar("foot", this.status); },

	status(){
		span.c("shell-end", "Saved 2 min ago  ·  v4.2  ·  Ready");
	},

	finding: "the cheapest full frame there is — two auto rows and the content keeps the whole width. The order is not swappable: identity and nav read at the top, state reads at the bottom, and reversing them makes both feel misplaced.",
});
