import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Three layers",

	classes: "full",            // layer 1 — cover the window
	children: "left right",     // lazy

	content(){
		div.c("row", () => {
			a.c("page-link", "left").href(this.url + "left/");
			a.c("page-link", "left / tests").href(this.url + "left/tests/");
			a.c("page-link", "right").href(this.url + "right/");
			a.c("page-link", "← leave").href("/compound/");
		});

		// layer 2 — arrange my children as equal columns
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {

				when("you are building an application shell rather than a document — a full-window workspace, a pane per concern, and alternate views inside a pane.");

				section("The three");

				p("`classes: \"full\"` positions this page. `div.c(\"pages cols\")` arranges its children. `left` calls `tabs()` and arranges its own. Three elements, three answers, and none of them knows about the other two.");

				section("The file");

				this_file(import.meta);

				cost("nothing structural — the layers compose because they live on different elements. What it does cost is reading: three files decide this screen, and only the middle one is on it. `container()` is the reason, and it is the one thing here you cannot see from the child's file.");
			});
		});
	}
});
