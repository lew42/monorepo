import { Page, h2, demo } from "/app.js";
import { button_demo, button_sizes_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Button",
	description: "`.btn, button` share padding and cursor, so a link can look like one without being one.",

	content(){
		demo(button_demo, "`button, .prim, .bg`: three looks, one utility class each, plus a link wearing `.btn` to match.").ac("mb");

		h2("Sizes and disabled").ac("mb");
		demo(button_sizes_demo, "`font-size` and `padding` scale together; `disabled` is a real attribute, not a class, the browser dims it for free.");
	}
});