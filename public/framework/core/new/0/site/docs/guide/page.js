import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Guide",

	content(){
		p("Column 2, the other one. Switching between Guide and Intro leaves column 1 exactly where it was — its view was never touched, only two class names moved.");

		section("Try it");

		p("Scroll this column, open Intro, come back. Your scroll position survived, because nothing was detached and nothing was rebuilt — `render()` holds `this.view` forever.");

		a.c("page-link", "Home").href("/");
		a.c("page-link", "Focus — full").href("/focus/");
	}
});
