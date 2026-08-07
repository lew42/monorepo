import { Page, p } from "/app.js";
import { section } from "../../../ui.js";
import { this_file } from "../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Left",

	initialize(){
		this.add("readme", "Layer 3. I'm a tab inside a column inside a page that covers the window, and my whole definition is this sentence.");

		this.add("tests", {
			title: "Tests",
			content(){
				p("The full page is still fixed to the window. The column grid is still two equal tracks. The tab bar is still where it was. Three arrangements, no interaction between them.");
				p("`/compound/three-layers/left/tests/` — reload it. Same picture, four url segments, nothing remembered.").ac("note");
			}
		});

		this.add("history", "The third tab. Adding it was one `add()` and one word in `tabs()`.");
	},

	content(){
		p("Column 2, and a tab set of my own. I know nothing about being in a column and nothing about the full page above me — I claimed my tab children, and that is all.");

		this.$tabs = this.tabs("readme tests history");

		section("The file");

		this_file(import.meta);
	}
});
