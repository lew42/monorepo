import { Page, p, a } from "/app.js";
import { this_file } from "../../../compound/recipe.js";

export default new Page({
	meta: import.meta,
	title: "Rate limits",

	content(){
		p("Derived correctly too. Two out of three, and the two that work are the multi-word ones — which is most segments, because most segments are phrases.");
		a.c("page-link", "← back to the table").href("/compose/labels/");
		this_file(import.meta);
	}
});
