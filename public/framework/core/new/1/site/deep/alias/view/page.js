import { Page, p, a } from "/app.js";

/* My directory is called `view`, which used to blank my parent on a cold load
 * and not on a click. Kept as the regression: `Page` now declares `view` as a
 * class field, so `alias()`'s `in` guard sees it and skips me. See /deep/alias/
 * for the names that are still unguarded. */
export default new Page({
	meta: import.meta,
	title: "A directory called view",

	content(){
		p("Reload this url. It renders either way now — `Page` declares `view` at the top of the class, which is what makes `alias()`'s guard true. Before that fix, arriving here by reload produced a `Page Load Error` and arriving by click did not.");
		a.c("page-link", "← back to the explanation").href("/deep/alias/");
	}
});
