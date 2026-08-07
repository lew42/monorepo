import { Page, p, a } from "/app.js";
import { measured, module_waterfall } from "/perf/ui.js";
import { section } from "/ui.js";

/* The bottom of the ladder, and the only page in it that measures anything.
 * Reload THIS url with an empty cache and the table below is the walk: eight
 * page modules, each one starting after the one before it finished.
 */
export default new Page({
	meta: import.meta,
	title: "e",

	content(){
		p("Segment 8 — the bottom. Reload this url, rather than clicking to it, and the table below is the cold walk that produced this page, read out of the browser's own resource timing.");

		section("The walk that got you here");

		measured(module_waterfall, "resource timing — every page.js this document fetched");

		p("`waited` is the gap between one module finishing and the next one starting. On a cold reload every row after the first waits, because `load_segments()` cannot ask for segment n+1 until segment n's module has run and declared it. Arrive here by *clicking* instead and the table is short — the modules are already in the registry.").ac("note");

		a.c("page-link", "← the investigation").href("/perf/walk/");
	},
});
