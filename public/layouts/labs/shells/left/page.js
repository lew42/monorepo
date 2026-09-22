import { Shell } from "../Shell.js";

/* Container: the app region, full viewport — a shell hides the site's own strip
   and brings its own. Size: a 13em rail plus everything left over. Own layout:
   Shell.css's one grid, `left` + `main`. Regions: two. Preview: default card. */

export default new Shell({
	meta: import.meta,
	title: "Left rail",
	description: "The default app shape — nav on the reading edge, content beside it.",
	icon: "view_quilt",
	group: "Outer chrome",

	left(){ return this.rail("left"); },

	finding: "the rail lands where the eye already starts a line, and it shares the content's left edge — which is why every app you know does this and why the other five have to earn their place.",
});
