import { Page, p, a } from "/app.js";
import { section } from "../../../ui.js";
import { this_file } from "../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Left",

	children: "deeper",     // lazy again — one more level, one more column

	content(){
		p("Column 2, inside a page that covers the window. I declare nothing about columns and nothing about being full — I am a page with one lazy child.");

		section("The file");

		this_file(import.meta);

		a.c("page-link", "deeper →").href(this.url + "deeper/");
	}
});
