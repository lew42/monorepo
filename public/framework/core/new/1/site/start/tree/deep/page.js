import { Page, p, a } from "/app.js";
import { source } from "../../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	content(){
		source(import.meta);

		p("Three segments down, and this file says nothing about depth, layout or its parent. It declares a title and some content; everything about where it sits comes from where it lives.").ac("note");

		a.c("page-link", "← A child page").href("/start/tree/");
	}
});
