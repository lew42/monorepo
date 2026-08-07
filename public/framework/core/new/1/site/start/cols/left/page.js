import { Page, p, a } from "/app.js";
import { source } from "../../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Left",

	content(){
		source(import.meta);

		p("A column, and this file does not say so. My parent made a grid; I mounted into the nearest one an ancestor had claimed.").ac("note");

		a.c("page-link", "Right  →").href("/start/cols/right/");
	}
});
