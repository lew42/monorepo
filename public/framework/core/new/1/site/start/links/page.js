import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "A link",

	content(){
		source(import.meta);

		p("An `<a href>`. That is the whole API. `Router` listens on `document`, sees a same-origin link, and swaps the page instead of reloading — watch the network panel as you click.").ac("note");

		section("Two ways to write one");

		a.c("page-link", "hand-written  →  /start/tree/").href("/start/tree/");

		p("`a.c(\"page-link\", \"…\").href(\"/start/tree/\")` — an anchor, styled by the site.").ac("note");

		this.link("page.link()  —  a link to me");

		p("`page.link()` uses the page's own title and url, so a rename cannot leave a stale link behind. It works before the page has ever rendered.").ac("note");

		section("What it does not touch");

		p("External links, `target`, `download`, a `#hash` on this page, anything with a file extension, and any click with ctrl/cmd/shift held — all handed straight to the browser. `/nav/links/` measures each rule live.").ac("note");

		a.c("page-link", "A child page  →").href("/start/tree/");
	}
});
