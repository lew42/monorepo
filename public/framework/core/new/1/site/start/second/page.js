import { Page, p, a } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "A second page",

	content(){
		source(import.meta);

		p("One file. I am `site/start/second/page.js`, and `/start/second/` is my url — derived from where the file sits, by `meta: import.meta`. No route table, no config, no build step.").ac("note");

		section("…and one word");

		source("/start/page.js");

		p("There it is, in my parent: `second`, in the `children` string. That is the whole registration. A page is a file plus one word — two edits, not one.").ac("note");

		section("Why a word at all");

		// The real Map, read at render. Three states, one lookup each.
		code(["files", "second", "ghost"].map(name => {
			const child = this.parent.children.get(name);
			return `children.get("${name}")`.padEnd(26) + (
				child === undefined ? "undefined   never declared  ->  404"
				: child === null    ? "null        declared, not imported yet"
				: "Page        declared, and here");
		}).join("\n"), "my parent's children Map, right now");

		p("The word is what lets a name be a page before the page exists. `null` means \"declared, go get it\" — that is laziness, and it is why only names you wrote ever reach the network.").ac("note");

		section("A file with no url");

		source("/start/second/ghost/page.js");

		p("That file is real — you are looking at its bytes, fetched a moment ago. But nothing declares it, so `/start/second/ghost/` is a 404. The filesystem is not the router; the declaration is.").ac("note");

		a.c("page-link", "A link  →").href("/start/links/");
	}
});
