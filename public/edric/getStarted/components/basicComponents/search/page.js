import { Page, h2, demo } from "/app.js";
import { search_demo, search_clear_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Search bar",
	description: "`type=\"search\"` plus an icon, no dedicated component, four classes and an attribute.",

	content(){
		demo(search_demo, "A relative box, an absolute icon, `padding-left` to clear it, that's the whole layout.").ac("mb");

		h2("With a clear button").ac("mb");
		demo(search_clear_demo, "A second absolute icon on the other side, clicking it resets the input's own value and refocuses it.");
	}
});