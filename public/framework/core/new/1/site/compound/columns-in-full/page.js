import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Columns in full",

	// Two answers to two different questions, on two different elements.
	classes: "full",                 // cover the window
	children: "left right",          // …and lazy, two levels deep

	content(){
		div.c("row", () => {
			a.c("page-link", "left").href(this.url + "left/");
			a.c("page-link", "left / deeper").href(this.url + "left/deeper/");
			a.c("page-link", "right").href(this.url + "right/");
			a.c("page-link", "← leave").href("/compound/");
		});

		// arrange my subtree as equal columns. `full` positions ME; `cols`
		// arranges my CHILDREN. One property could never have said both.
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {

				when("a task needs the whole window and still has structure inside it — a diff viewer, a query console, a settings screen with sections.");

				section("The file");

				this_file(import.meta);

				p("`.app` is untouched on every route here. `full` is `position: fixed; inset: 0` and nothing else — no chrome flag to set, keep in sync, and unset on the way out.").ac("note");

				cost("the sidebar is covered, not removed: still in the DOM, still tabbable, still read aloud. `inert` on the chrome is the fix and it belongs to the site.");
			});
		});
	}
});
