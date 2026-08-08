import { Page, h2, demo } from "/app.js";
import { label_demo, label_required_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Label",
	description: "No rule of its own, an inline box; `flex v` is what stacks it over its control.",

	content(){
		demo(label_demo, "`label` has no rule in framework.css: it's an inline box by default, `flex v` is what stacks the text over the control.").ac("mb");

		h2("Required marker").ac("mb");
		demo(label_required_demo, "A second `span` for the asterisk, the same literal colour Error message and Field with Error both use.");
	}
});