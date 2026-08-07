import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Centered",
	description: "A measure of prose, centred — the one rule utilities can't spell.",
	icon: "format_align_center",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`.layout-measure` is `max-width: 34em; margin-inline: auto`. Two declarations, and neither is available as a class: `max-width` alone leaves the column flush left, and `flex h-center` has nothing to centre until something has a width.");


		md("**This is the strongest case for a new utility on the page.** A measure is the most common layout on the web, `.page.paper` already hardcodes one (`max-width: 60em`), and every doc page here is one — three hardcodes, which is the bar a token or a class has to clear.");

		fit("An article · A sign-in card · A changelog · An error page · Almost every docs page ever written",
			"measured",
			"It IS the measure, so a measured page is redundant on purpose: the layout and the page agree, and `.layout-measure` is only needed when the *page* is wider than the reading.");

		md("Next: [Stack](/framework/styles/layouts/stack/) — the same measure, with rhythm inside it.");
	}
});
