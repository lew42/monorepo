import { Page, md, code, h2, div } from "/app.js";
import sample from "../sample.js";

export default new Page({
	meta: import.meta,
	title: "Dashboard",
	description: "No measure, cards that claim their own share of the grid.",
	icon: "dashboard",

	// `page.ac(...)` with utility classes is possible because the arrangement
	// contract lives in @layer util and out-ranks them — see core/Page/Page.css.
	classes: "dash",

	content(){
		code.js(`classes: "dash"   // --measure: none, --page-pad: 2em`);

		md("An index, a gallery, a wall of anything. **No measure**, because nothing here is prose — the reading-column argument does not apply to a grid of cards, and holding one to 60em just wastes the screen.");

		h2("The wall");

		sample.wall();

		md("`grid gap auto` — `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`. The count is the browser's decision, at every width, and no media query was written.");

		h2("Cards that want more");

		sample.dashboard();

		md("`.wide`, `.tall` and `.big` are spans, not sizes. At one column they clamp themselves and every card is ordinary again — which is the whole reason to ask for a *share* of the grid rather than a width.");

		md("← [Page layouts](/framework/core/Page/layouts/)");
	}
});
