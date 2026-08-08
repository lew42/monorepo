import { Page, h2, demo } from "/app.js";
import { password_demo, password_strength_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Password Input",
	description: "Same wrapper as Search bar, an icon that swaps its own type and glyph on click.",

	content(){
		demo(password_demo, "The same relative-box-plus-absolute-icon wrapper Search bar uses; clicking the icon swaps the input's own `type` and its own glyph.").ac("mb");

		h2("With a strength meter").ac("mb");
		demo(password_strength_demo, "Native `<meter>`, it keeps its own green/amber/red and ignores `accent-color` on purpose, a meter's colour means something. The value here is just character count; a real check would look at more.");
	}
});