import { Page, p, a } from "/app.js";
import { source } from "../../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Right",

	content(){
		source(import.meta);

		p("The other one. Switching between us leaves the first column exactly where it was — only two class names moved, and nothing was rebuilt.").ac("note");

		a.c("page-link", "← Left").href("/start/cols/left/");
	}
});
