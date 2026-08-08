import { Page, h2, demo } from "/app.js";
import { language_demo, language_menu_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Language Selector",
	description: "A `<select>` of names, nothing framework-specific about it.",

	content(){
		demo(language_demo, "Plain native `<select>`, four `<option>`s, the browser handles the rest.").ac("mb");

		h2("As a menu instead").ac("mb");
		demo(language_menu_demo, "Menu's own `.menu-list`/`.menu-item` classes and `<details>`, when a plain select's built-in look isn't enough.");
	}
});