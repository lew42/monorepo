import { Page, h2, demo } from "/app.js";
import { radio_demo, radio_vertical_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Radio button",
	description: "Same reset as a checkbox, grouped by a shared `name`.",

	content(){
		demo(radio_demo, "A shared `name` attribute is the whole grouping mechanism, no wrapper element required.").ac("mb");

		h2("Vertical layout").ac("mb");
		demo(radio_vertical_demo, "`flex v` instead of `flex wrap`, same three inputs, same shared `name`.");
	}
});