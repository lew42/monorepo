import { Page, h2, demo } from "/app.js";
import { input_demo, input_icon_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Input / Text field",
	description: "Text-ish controls fill their container by default, no width rule to write.",

	content(){
		demo(input_demo, "`h4` labels the field; `type=\"email\"` is the whole validation hint the browser needs.").ac("mb");

		h2("With an icon, and disabled").ac("mb");
		demo(input_icon_demo, "Same wrapper Search bar uses: a relative box, an absolute icon, and `padding-left` to clear it.");
	}
});