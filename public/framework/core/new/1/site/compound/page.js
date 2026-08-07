import { Page, View, p } from "/app.js";
import { section } from "../ui.js";
import { this_file } from "./recipe.js";

/* css: .master-detail, .master-list, .master-empty, .full-body, .steps, .crumbs,
        .tabs-drill, .page-link.active
   Loaded here because every recipe below is reached by walking through me. */
View.stylesheet(import.meta, "compound.css");

export default new Page({
	meta: import.meta,
	title: "Compound",

	// ALL LAZY. Ten recipes, zero imports until you open one — watch the console.
	children: "tabs-in-a-column columns-in-full master-detail drilling-tabs two-bars steps crumbs three-layers tree-from-route overlay",

	content(){
		p("Two or more layers of navigation at once — a tab set inside a drill-down column, columns inside a page that covers the window, a list beside a detail. One layer is a primitive; the combinations are where a design either holds or doesn't.");

		section("The recipes");

		this.previews();

		p("The cards read as directory names because not one of the ten has been imported yet, and a title would cost the import. Open one and its card says its real title from then on. That is `previews()` being honest rather than eager.").ac("note");

		section("Every page prints its own file");

		this_file(import.meta);

		p("That box is `fetch(import.meta.url)` — the page showing itself, including the line that made the box. The code on screen is the code that ran, because there is no second copy of it anywhere. Every page under `/compound/` does this.").ac("note");
	}
});
