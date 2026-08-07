import { Page, p, div } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Columns",

	// LAZY — child/page.js is not fetched until you click into it
	children: "child",

	content(){
		code(`
content(){
    this.$pages = div.c("pages cols", () => {
        div.c("col", () => { … my own content … });
    });
}`, "columns/page.js — the whole layout");

		// My region. Classing it "cols" is the entire arrangement — there is no
		// mode property and nothing resolves one. My own content goes in first,
		// so I am column 1 rather than a header above the columns.
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {
				p("**Column 1.** I made this region and put my own content in it, so I'm a column rather than a header above them. That's a choice this file makes, visibly.");

				section("What arranges this");

				code(`.cols { display: grid; grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr); }`);

				p("One utility class on a div. My descendants land here because `container()` walks up to the nearest ancestor with a `$pages` — they never mention columns, or me.").ac("note");

				this.previews();
			});
		});
	}
});
