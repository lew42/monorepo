import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Right",

	content(){
		p("The other column. Switching between us leaves the full page — and its own content above — exactly where it was; only two class names moved.");

		a.c("page-link", "← left").href("/full/left/");
	}
});
