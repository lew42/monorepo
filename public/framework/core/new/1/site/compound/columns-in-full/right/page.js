import { Page, p, a } from "/app.js";
import { section } from "../../../ui.js";
import { this_file } from "../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Right",

	content(){
		p("The other column 2. Opening me while `left / deeper` was showing drops both of them — they are not in my chain — and the grid goes back to two tracks. Nothing had to remove them; they simply stopped being `.active-page` or `.active-ancestor`.");

		section("The file");

		this_file(import.meta);

		a.c("page-link", "← leave").href("/compound/");
	}
});
