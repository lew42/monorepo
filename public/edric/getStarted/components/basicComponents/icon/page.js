import { Page, h2, demo } from "/app.js";
import { icon_demo, icon_sizes_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Icon",
	description: "A ligature font: the name is the icon, and a typo renders as the typo.",

	content(){
		demo(icon_demo, "Material Icons is a ligature font, the name you type is the glyph the browser draws, so a typo shows the typo instead of a blank box.").ac("mb");

		h2("Sizes and colour").ac("mb");
		demo(icon_sizes_demo, "`font-size` scales the glyph; colour is just `color`, same as any text.");
	}
});