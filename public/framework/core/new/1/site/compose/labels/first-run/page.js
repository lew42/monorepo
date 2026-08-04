import { Page, p, a } from "/app.js";
import { this_file } from "../../../compound/recipe.js";

export default new Page({
	meta: import.meta,
	title: "First run",

	content(){
		p("My title is `First run`. `titleize(\"first-run\")` derives exactly that, for free, without importing me — which you just did, so go back and look at the table.");
		a.c("page-link", "← back to the table").href("/compose/labels/");
		this_file(import.meta);
	}
});
