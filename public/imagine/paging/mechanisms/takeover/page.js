import { md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row — but `width: "full"`, so arriving here
   IS the takeover: Page.css hides every column left of this one and the rail, the
   hub and Mechanisms all collapse into the crumb strip above. Size: the whole row
   (1051 / 3166px at 1280 / 3440). Own layout: prose then the stage. Regions: one.
   Preview: core's card.

   ⚠ Nothing is unmounted and no url changes shape. Click a crumb and the row is
     back exactly as it was — which is what makes `full` a WORD and not a mode. */

export default new Paging({
	meta: import.meta,
	title: "Takeover",
	description: "A click fills the whole screen; every ancestor collapses into the crumb strip above.",
	icon: "open_in_full",
	width: "full",
	axes: "mech style",
	mode: { mech: "takeover", style: "dark" },

	takeaway: "**Takeover: a click fills the whole screen, and every page behind it collapses into the crumb strip above.** Nothing was closed — click a crumb and the row comes straight back, exactly as you left it.",

	children: [
		leaf("The crumb strip is the way back", "It is derived from the page's own chain, so it cannot be wrong or stale."),
		leaf("Nothing was closed", "Every ancestor column is still in the DOM with its state; only its layout is gone."),
		leaf("It is one word", "`width: \"full\"`. There is no takeover mode, no shell and no fixed positioning anywhere."),
	],

	content(){
		this.lede();

		md("**You just took over the row.** The rail, the Paging hub and Mechanisms are all still open — look at the strip along the top. `full` is a 100% basis with a 100% floor, and one `:has()` rule in `Page.css` stands the ancestors down while it is the deepest thing open.");
		md("Switch the **mechanism** chip to `launch` and the three rows below open beside this one instead: same children, same urls, a different word deciding the track. That is the whole mechanism — [columns](/framework/core/Page/doc/columns/).");

		this.paging();
	},
});
