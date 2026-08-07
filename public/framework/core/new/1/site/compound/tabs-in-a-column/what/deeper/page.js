import { Page, p, a } from "/app.js";
import { section } from "../../../../ui.js";
import { this_file } from "../../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Deeper",

	// The `col` class is inert data: styles.css puts it on the column, and this
	// page is the only place that decides how wide it wants to be.
	content(){
		p("Column 2. My parent `what` is an inline tab with no file of its own — the only page.js under it is this one, three directories down. Nothing on this page says `column`, `tab` or `deeper`; I was placed by `container()` walking past a parent that claimed nothing.");

		section("The file");

		this_file(import.meta);

		p("Look at the tab bar in column 1: `What you're looking at` is still selected. Two levels of selection on one screen, and the url `/compound/tabs-in-a-column/what/deeper/` is the whole of the state — reload and you get this exact picture back.").ac("note");

		a.c("page-link", "← back to column 1").href("/compound/tabs-in-a-column/what/");
	}
});
