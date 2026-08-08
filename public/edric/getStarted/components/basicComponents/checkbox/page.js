import { Page, h2, demo } from "/app.js";
import { checkbox_demo, checkbox_disabled_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Checkbox",
	description: "`accent-color` on `body` colours the tick, one declaration, every checkbox.",

	content(){
		demo(checkbox_demo, "`label` wrapping the control makes the whole row a click target, no `for`/`id` pair to keep in sync.").ac("mb");

		h2("Disabled").ac("mb");
		demo(checkbox_disabled_demo, "A real `disabled` attribute; the browser dims it and blocks focus, nothing framework.css has to say.");
	}
});