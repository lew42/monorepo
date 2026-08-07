import { Page, p, a } from "/app.js";
import { code } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Left",

	children: "deeper",

	content(){
		p("A column, inside a page that covers the window. I declare neither — `container()` walked up, found my parent's `$pages`, and that div happens to be a grid.");

		code(`
export default new Page({ meta: import.meta, title: "Left", children: "deeper" });`,
			"full/left/page.js — no layout in it anywhere");

		a.c("page-link", "deeper →").href("/full/left/deeper/");
	}
});
