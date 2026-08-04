import { Page, p, a } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "A child page",

	children: "deep",

	content(){
		source(import.meta);

		p("A directory inside a directory. `site/start/tree/deep/page.js` is `/start/tree/deep/` — the folders you make are the url you get.").ac("note");

		section("A url is the walk");

		// this page's real ancestry, read at render
		code(this.chain().map((page, i) => "  ".repeat(i) + (page.name ?? "/") + "   " + page.url).join("\n"),
			"this.chain() — how the Router got here");

		p("One segment, one `child()` call, one page. The Router walks it left to right, importing anything it has not seen — so a url is not looked up in a table, it is followed.").ac("note");

		section("Mine");

		this.previews();

		a.c("page-link", "Lazy  →").href("/start/lazy/");
	}
});
