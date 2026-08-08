import { Page, h2, demo } from "/app.js";
import { rating_demo, rating_readonly_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Rating",
	description: "Five icons and one closure over which is \"on\", the same swap Sort controls makes on its arrow.",

	content(){
		demo(rating_demo, "Five icons, one closure over which is \"on\": clicking a star sets the value and repaints every star's glyph.").ac("mb");

		h2("Read-only").ac("mb");
		demo(rating_readonly_demo, "The same five icons, no click handler: a display-only rating is just the interactive one with the state fixed.");
	}
});