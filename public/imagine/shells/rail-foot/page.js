import { Shell } from "../Shell.js";
import { span } from "/app.js";

/* Container: the app region, full viewport. Size: a 13em rail beside the content,
   with the footer spanning UNDER both. Own layout: the one grid, `left` + `main`
   + `foot` — and `"foot foot foot"` is the whole answer to the question this page
   exists to ask. Regions: three. Preview: default card. */

export default new Shell({
	meta: import.meta,
	title: "Sidebar + footer",
	description: "The two of them together — and the footer has to span under the rail.",
	icon: "view_module",
	group: "Outer chrome",

	left(){ return this.rail("left"); },
	foot(){ return this.bar("foot", this.status); },

	status(){
		span.c("shell-end", "3 shells left to read  ·  Ready");
	},

	finding: "the footer must span the whole floor, under the rail. Stopped at the rail's inline edge it reads as part of the content instead of part of the app, and the rail loses its own bottom edge — one `\"foot foot foot\"` row is the difference.",
});
