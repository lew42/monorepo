import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Three files",

	content(){
		section("1 — the document");

		source("/index.html");

		p("The real one, serving the page you are reading. It loads exactly one script and never changes again: every url in the site is served this same file.").ac("note");

		section("2 — the app");

		source("/start/floor.app.js");

		p("Three lines. `export *` is what lets every page say `import { Page, p } from \"/app.js\"` — one module instance, shared by the whole site.").ac("note");

		section("3 — a page");

		source(import.meta);

		p("A title and a `content()`. `content()` runs with this page's element as the captor, so `p(\"…\")` lands inside it — you never touch the DOM.").ac("note");

		section("That is the floor");

		p("Put those three at the root of a directory, serve it with anything that falls back to `index.html`, and you have a working site at `/`.").ac("note");

		a.c("page-link", "A second page  →").href("/start/second/");
	}
});
