import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "c",
	children: "d",

	content(){
		p("Segment 6.");
		a.c("page-link", "d →").href("/perf/walk/a/b/c/d/");
	},
});
