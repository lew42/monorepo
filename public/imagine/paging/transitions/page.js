import { md } from "/app.js";
import { Paging, STYLES, MECHANISMS } from "../paging.js";

/* Container: a column in /imagine/'s row. Size: `large`. Own layout: prose then
   the stage — two chip rows and five destinations. Regions: one. Preview: core's
   card.

   THE MATRIX, WITHOUT THE MATRIX. From any style to any style by any mechanism is
   5 × 5 × 4 = 100 transitions. A hundred cells is a wall nobody clicks; three
   choices and one row is the same space with the reader's finger already on it:
   pick the surface you are leaving (FROM), pick how you leave (BY), click where
   you are going (TO). The page you are reading IS the from — that is what makes it
   a transition rather than a picture of one. */

const TO = STYLES.map(word => new Paging({
	title: word[0].toUpperCase() + word.slice(1),
	description: "You arrived on the " + word + " surface. What it looked like getting here was the mechanism; what it looks like now is the style.",
	axes: "style mech",
	mode: { style: word },
	takeaway: "**You arrived on the " + word + " surface.** What it looked like getting here was the mechanism; what it looks like now is the style. Change the chips and go again — every page here is both a destination and a departure.",
	content(){ this.lede(); this.paging(); },
}));

export default new Paging({
	meta: import.meta,
	title: "Transitions",
	description: "From any style to any style, by any mechanism — pick from, pick by, click to.",
	icon: "compare_arrows",
	width: "large",
	axes: "style mech",
	children: TO,

	takeaway: "**Pick the surface you are leaving, pick how you leave it, then click where you are going.** The page you are reading is always the one you are leaving, so this is a transition you make rather than a picture of one.",

	content(){
		this.lede();

		md("**Three picks and a click.** `FROM` repaints this page, so you are always standing on the surface you are leaving. `BY` decides what the click does — " +
			Object.entries(MECHANISMS).map(([word, m]) => "`" + word + "` " + m.does).join(" · ") + ". `TO` is the row you click.");

		md("A hundred combinations, one screen. The one worth trying first: **dark → plain by takeover**, then the crumb strip back — the surface change and the layout change arrive together, and it is the clearest demonstration on the site that they are two independent words.");

		this.paging();
	},

	// The same three axes, named for what they are doing here.
	axis_word(axis){ return axis === "style" ? "from" : axis === "mech" ? "by" : axis; },
});
