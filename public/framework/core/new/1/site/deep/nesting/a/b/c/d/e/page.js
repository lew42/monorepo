import { Page, p, a, div } from "/app.js";
import { stamp, probe } from "../../../../../../probe.js";

export default new Page({
	meta: import.meta,
	title: "e",

	content(){
		p("Level 8 of 8, and the deepest url in the site: `/deep/nesting/a/b/c/d/e/`.");
		stamp();

		probe("what did getting here cost", (log) => {
			const chain = app.router.active.chain();
			const modules = performance.getEntriesByType("resource").filter(e => e.name.endsWith("page.js"));

			log("chain          ", chain.map(page => page.name ?? "root").join(" › "));
			log("chain length   ", chain.length);
			log("page.js fetched", modules.length, "since this document loaded");
			modules.forEach(entry => log("  ", new URL(entry.name).pathname));
		});

		div.c("row", () => {
			a.c("page-link", "sideways → e2").href("/deep/nesting/a/b/c/d/e2/");
			a.c("page-link", "← the write-up").href("/deep/nesting/");
		});
	}
});
