import { Page, p } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "opt-in",
	children: "deep",

	// the same one line as my parent — that's the ceremony being measured
	classes: "columns",

	content(){
		p("Column 2. I carry the class too, so I split as well — my child gets a column of its own instead of replacing me.");

		code(`
classes: "columns",`, "…repeated in THIS file as well");

		this.previews();

		p("Widths compound — each column splits what's left of its parent, so the third is narrower than the second. A real column layout flattens the chain instead of nesting `.pages` inside `.pages`.").ac("note");
	}
});
