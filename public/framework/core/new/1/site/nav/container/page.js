import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "container()",

	content(){
		source(import.meta);

		p("Every arrangement in this section is the same question answered three ways: where does a page mount? `container()` asks it once, on the page itself, most specific claim first.");

		section("Three rungs, and the first one wins");

		p("1 — my parent put ME somewhere. One named child, in `regions`. This is what `tabs()` writes.").ac("note");
		p("2 — an ancestor claimed the whole subtree, by assigning `$pages`. The walk takes the nearest one.").ac("note");
		p("3 — nobody claimed anything, so the app's flat container. This is the default, and it is what makes replacement the default.").ac("note");

		section("The three rungs, on screen");

		div.c("row", () => {
			a.c("page-link", "3 · flat  — /nav/replace/").href("/nav/replace/");
			a.c("page-link", "2 · $pages  — /nav/cols/").href("/nav/cols/");
			a.c("page-link", "1 · regions  — /nav/tabs/").href("/nav/tabs/");
		});

		p("Nothing in those three pages' children mentions a layout. A child never asks where it is going; the ancestor that cares makes a container and the walk finds it.").ac("note");

		section("The honest cost");

		p("This is action at a distance, and it is the only place in `new/1` where a reader of the child's file cannot see what happens to it. A page writes `$pages` and other files' pages start mounting there. It is what makes columns, tabs and nesting expressible at all — and two levels of claim is the most it should ever grow.").ac("note");

		section("container(), in the real file");

		source("/framework/core/new/1/Page.class.js");

		section("Next");

		a.c("page-link", "cols  →").href("/nav/cols/");
	}
});
