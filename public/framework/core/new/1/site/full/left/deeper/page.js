import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Deeper",

	content(){
		p("Third column, two levels below the only file that mentions a layout. The walk finds the same `$pages` for me as for my parent, so we're siblings in one grid rather than boxes inside boxes — which is what keeps the widths equal.");

		a.c("page-link", "← left").href("/full/left/");
	}
});
