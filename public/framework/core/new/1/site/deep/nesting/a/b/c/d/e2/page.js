import { Page, p, a, div } from "/app.js";
import { stamp, probe } from "../../../../../../probe.js";

export default new Page({
	meta: import.meta,
	title: "e2",

	content(){
		p("`e`'s sibling. Getting here from `e` is the sideways hop: seven of the eight pages in the chain are shared, and `Router.activate()` claims it never touches them.");
		stamp();

		probe("did the shared ancestors get rebuilt", (log) => {
			log("every .stamp currently in the DOM, oldest build first:");
			[...document.querySelectorAll(".stamp")]
				.forEach(el => log("  ", el.closest(".page").className.match(/page-\w+/)?.[0] ?? "page", "·", el.textContent));

			log("");
			log("An ancestor whose stamp predates this page's own was NOT rebuilt.");
		});

		div.c("row", () => {
			a.c("page-link", "back to e").href("/deep/nesting/a/b/c/d/e/");
			a.c("page-link", "← the write-up").href("/deep/nesting/");
		});
	}
});
