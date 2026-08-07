import { Page, p, a, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "A page that claims a region",

	children: "inner",

	content(){
		p("I claim my subtree with `this.$pages`. My children mount into me rather than beside me — but only if this method has run, and `container()` has no way to ask whether it has.");

		a.c("page-link", "inner →").href("/deep/orphan/region/inner/");

		// the claim. It exists only after content() runs, i.e. after render().
		this.$pages = div.c("pages");
	}
});
