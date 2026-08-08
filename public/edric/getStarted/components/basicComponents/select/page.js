import { Page, h2, demo } from "/app.js";
import { select_demo, select_grouped_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Select / Dropdown",
	description: "The one native control still worth a rule: `appearance: none` plus a hand-drawn arrow.",

	content(){
		demo(select_demo, "`appearance: none` plus a data-URI triangle, because the native arrow can't be styled consistently across platforms.").ac("mb");

		h2("Grouped options").ac("mb");
		demo(select_grouped_demo, "Native `<optgroup>`, `label` is a real attribute; framework.css has no rule for it, and needs none.");
	}
});