import { Page, h2, demo } from "/app.js";
import { share_demo, share_icon_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Share Button",
	description: "`navigator.share` where it exists, the clipboard where it doesn't.",

	content(){
		demo(share_demo, "`navigator.share()` opens the OS share sheet where it exists; the clipboard is the fallback where it doesn't.").ac("mb");

		h2("Icon-only").ac("mb");
		demo(share_icon_demo, "Same handler, no label, `title` carries the accessible name instead.");
	}
});