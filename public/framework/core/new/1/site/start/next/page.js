import { Page, p, a, div } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Where to go next",

	content(){
		source(import.meta);

		code(`
index.html          one document, served for every url
app.js              import App, export *, new App()
page.js             title + content()
children: "a b"     a name is a page
this.$pages = div.c("pages cols")     an arrangement`, "everything you have used");

		p("Five ideas. Everything below is built out of them — there is no second system.").ac("note");

		section("Next, in order");

		div.c("row", () => {
			a.c("page-link", "Primitives  →").href("/nav/");
			a.c("page-link", "Compound").href("/compound/");
		});

		p("`/nav/` takes each mechanism you just used and shows it alone: what `Router` does and does not upgrade, the three places a page can mount, tabs, full-screen, `route()`, and what a name costs. Then `/compound/` combines them.").ac("note");

		section("The one thing to remember");

		p("A page is a file plus one word in its parent. Everything else — the tree, the laziness, the arrangements — falls out of that.").ac("note");

		a.c("page-link", "← back to Start").href("/start/");
	}
});
