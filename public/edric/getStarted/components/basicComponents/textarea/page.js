import { Page, h2, demo } from "/app.js";
import { textarea_demo, textarea_rows_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Textarea",
	description: "Resizes vertically only; `.auto` follows the text instead.",

	content(){
		demo(textarea_demo, "`textarea { resize: vertical }` in the reset; `.auto` in `@layer util` adds `field-sizing: content` so the box follows what you type.").ac("mb");

		h2("A fixed row count").ac("mb");
		demo(textarea_rows_demo, "`rows` is a real HTML attribute framework.css never touches, no class needed for a fixed height.");
	}
});