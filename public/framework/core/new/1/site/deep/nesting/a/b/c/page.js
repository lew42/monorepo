import { Page, p, a } from "/app.js";
import { stamp } from "../../../../probe.js";

export default new Page({
	meta: import.meta,
	title: "c",
	children: "d",

	content(){
		p("Level 5 of 8.");
		stamp();
		a.c("page-link", "d →").href("/deep/nesting/a/b/c/d/");
	}
});
