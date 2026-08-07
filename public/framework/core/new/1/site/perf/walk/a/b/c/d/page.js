import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "d",
	children: "e",

	content(){
		p("Segment 7. One more.");
		a.c("page-link", "e →").href("/perf/walk/a/b/c/d/e/");
	},
});
