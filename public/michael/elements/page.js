import { Page2, p } from "/app.js";
import text from "./text/page.js";
import input from "./input/page.js";
import button from "./button/page.js";
import img from "./img/page.js";
import list from "./list/page.js";
import other from "./other/page.js";

export default new Page2({
	meta: import.meta,
	title: "Elements",
	description: "Raw HTML elements with only framework.css base styles.",
	children: [text, input, button, img, list, other],
	content(){
		p("The base layer — every element as it looks with just `framework.css` applied. Everything beyond this is opt-in. Pick one to open it on the right.");
		this.previews();
	}
});
