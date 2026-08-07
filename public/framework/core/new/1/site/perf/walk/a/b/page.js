import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "b",
	children: "c",

	content(){
		p("Segment 5. Five round trips deep. Nothing on this page is heavy; the only thing between you and it was latency, five times.");
		a.c("page-link", "c →").href("/perf/walk/a/b/c/");
	},
});
