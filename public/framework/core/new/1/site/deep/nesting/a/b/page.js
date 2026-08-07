import { Page, p, a } from "/app.js";
import { stamp } from "../../../probe.js";

export default new Page({
	meta: import.meta,
	title: "b",
	children: "c",

	content(){
		p("Level 4 of 8.");
		stamp();
		a.c("page-link", "c →").href("/deep/nesting/a/b/c/");
	}
});
