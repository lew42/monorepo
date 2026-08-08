import { Page, h2, demo } from "/app.js";
import { field_error_demo, field_success_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Field with Error",
	description: "Form field's shape, Error message's literal colour: no error token to reach for instead.",

	content(){
		demo(field_error_demo, "No error token in framework.css yet, it only names colour once, on `.prim`/`.bg`, and neither is red. A literal colour where a token genuinely doesn't exist.").ac("mb");

		h2("Success state").ac("mb");
		demo(field_success_demo, "Same shape, `--prim` instead of a literal colour, because green isn't in the palette but \"attention\" already has a token.");
	}
});