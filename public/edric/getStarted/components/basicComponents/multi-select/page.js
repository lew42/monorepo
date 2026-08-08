import { Page, h2, demo } from "/app.js";
import { multiselect_demo, multiselect_large_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Multi-select",
	description: "Native `<select multiple>`, the `size` attribute is what turns it into a list instead of a closed dropdown.",

	content(){
		demo(multiselect_demo, "`multiple` plus `size=\"3\"`: without `size` the browser still renders a closed dropdown that happens to allow more than one pick.").ac("mb");

		h2("More options, more rows").ac("mb");
		demo(multiselect_large_demo, "`size` is just a row count, it doesn't have to match the option count.");
	}
});