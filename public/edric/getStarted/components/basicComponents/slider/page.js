import { Page, h2, demo } from "/app.js";
import { slider_demo, slider_stepped_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Slider",
	description: "Native `<input type=\"range\">`, themed by `accent-color` for free, same as a checkbox.",

	content(){
		demo(slider_demo, "`body { accent-color: var(--prim) }` colours the thumb, one declaration, every range input on the site.").ac("mb");

		h2("Stepped, and a range pair").ac("mb");
		demo(slider_stepped_demo, "`step` snaps to whole numbers; two inputs side by side is the closest thing to a dual-handle range without a stylesheet.");
	}
});