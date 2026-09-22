import { Shell } from "../Shell.js";
import { span } from "/app.js";

/* Container: the app region, full viewport. Size: everything, then one auto row.
   Own layout: the one grid, `main` + `foot`. Regions: two. Preview: default card. */

export default new Shell({
	meta: import.meta,
	title: "Footer bar",
	description: "No rail at all — the nav is a bar pinned to the floor of the app.",
	icon: "view_stream",
	group: "Outer chrome",

	foot(){ return this.bar("foot", this.links_and_status); },

	links_and_status(){
		this.nav_links();
		span.c("shell-end", "Ready");
	},

	finding: "a pinned footer is the strongest place for state that must never scroll away and the weakest place for navigation you need first — it is the last thing read on a wide screen and the first thing a phone keyboard covers. State, not nav.",
});
