import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "b",

	content(){
		p("Column 2, the other one. Clicking between `a` and `b` swaps this track and leaves column 1 exactly where it was — `router.activate()` shares the leading pages, so nothing above me was touched.");

		p("Two columns now instead of three, because the chain is one shorter. Track count follows the url, with no `grid-template-columns` anywhere — `grid-auto-flow: column` grows a track per item.").ac("note");

		a.c("page-link", "a › Deep →").href("/modes/flat/a/deep/");
	}
});
