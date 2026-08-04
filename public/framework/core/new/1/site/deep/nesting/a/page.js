import { Page, p, a } from "/app.js";
import { stamp } from "../../probe.js";

export default new Page({
	meta: import.meta,
	title: "a",
	children: "b",

	content(){
		p("Level 3 of 8. One lazy child, no layout, no `$pages` — I claim nothing, so my descendants fall through to `app.$pages` and replace me.");
		stamp();
		a.c("page-link", "b →").href("/deep/nesting/a/b/");
	}
});
