import { Page, p, a } from "/app.js";
import { section } from "../../../ui.js";
import { this_file } from "../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Right",

	content(){
		p("A column with no tabs, beside one with three. Nothing declares which kind of column it is — a page that never calls `tabs()` simply doesn't have a bar.");

		section("The file");

		this_file(import.meta);

		a.c("page-link", "← leave").href("/compound/");
	}
});
