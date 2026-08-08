import { Page, h2, demo } from "/app.js";
import { copy_demo, copy_icon_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Copy Button",
	description: "`navigator.clipboard`, and the label swaps to confirm it worked.",

	content(){
		demo(copy_demo, "`navigator.clipboard.writeText()`, then the label swaps to confirm it worked and swaps back after a timeout.").ac("mb");

		h2("Icon-only").ac("mb");
		demo(copy_icon_demo, "Same handler, no label, `title` carries the accessible name instead.");
	}
});