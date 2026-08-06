import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import viewport from "../viewport.js";

export default new Page({
	meta: import.meta,
	title: "Centered",
	description: "A measure of prose, centred — the one rule utilities can't spell.",
	route(name){ return name === "viewport" && viewport(this, layout); },

	content(){
		demo(layout, "`.layout-measure` is `max-width: 34em; margin-inline: auto`. Two declarations, and neither is available as a class: `max-width` alone leaves the column flush left, and `flex h-center` has nothing to centre until something has a width.");

		viewport.link(this);

		md("**This is the strongest case for a new utility on the page.** A measure is the most common layout on the web, `.page.paper` already hardcodes one (`max-width: 60em`), and every doc page here is one — three hardcodes, which is the bar a token or a class has to clear.");

		md("Next: [Stack](/framework/styles/layouts/stack/) — the same measure, with rhythm inside it.");
	}
});
