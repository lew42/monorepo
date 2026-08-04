import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "An arrangement",

	children: "left right",

	content(){
		// One line. My children mount here instead of replacing me, and the
		// class does the rest.
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {
				source(import.meta);

				p("`this.$pages = div.c(\"pages cols\")`. That is the whole layout — a div, a class, and my own content placed inside it so I am the first column rather than a header above them.").ac("note");

				section("Open one");

				this.previews();

				p("Until now every child replaced its parent, because a page with no container mounts in the app's flat one and CSS hides everything that is not the leaf. Making a `$pages` claims my whole subtree: children land in my grid instead.").ac("note");

				p("Nothing in `left/page.js` or `right/page.js` mentions columns, or me. That is the payoff — an arrangement is one line in one file, and no page below it has to know.").ac("note");

				section("Last step");

				a.c("page-link", "Where to go next  →").href("/start/next/");
			});
		});
	}
});
