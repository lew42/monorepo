import { Page, p, a, div } from "/app.js";
import { stamp } from "../../../../../probe.js";

export default new Page({
	meta: import.meta,
	title: "d",

	// two leaves, so there is something to move sideways BETWEEN at depth
	children: "e e2",

	content(){
		p("Level 6 of 8. Two siblings below me — the sideways hop at depth is measured from here.");
		stamp();
		div.c("row", () => {
			a.c("page-link", "e →").href("/deep/nesting/a/b/c/d/e/");
			a.c("page-link", "e2 →").href("/deep/nesting/a/b/c/d/e2/");
		});
	}
});
