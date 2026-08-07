import { Page, p, a } from "/app.js";
import { section } from "../../../../ui.js";
import { this_file } from "../../../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Deeper",

	content(){
		p("Column 3. `Left` is my parent and it claimed no region, so `container()` walked straight past it to the full page's `$pages` — which is why I am a sibling track rather than a box inside Left.");

		section("The file");

		this_file(import.meta);

		p("Three depths, one grid. Measured: cold-loading this url costs exactly five module imports — the root, `/compound/`, `columns-in-full`, `left` and me — its own chain and nothing else. No other recipe is touched.").ac("note");

		a.c("page-link", "← leave").href("/compound/");
	}
});
