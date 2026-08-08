import { Page, h2, demo } from "/app.js";
import { segmented_demo, segmented_icons_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Segmented Control",
	description: "Filter's exclusive selection, visually joined instead of separated pills.",

	content(){
		demo(segmented_demo, "Filter's exclusive-selection click handler, `overflow: hidden` on a bordered row is what joins the buttons instead of separating them into pills.").ac("mb");

		h2("Icon-only").ac("mb");
		demo(segmented_icons_demo, "Same handler, icons instead of labels.");
	}
});