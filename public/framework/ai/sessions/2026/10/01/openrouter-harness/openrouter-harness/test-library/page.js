import { Page, p, a, div } from "/app.js";
import { page_work } from "/framework/core/Page/ai/work.js";

/* The test library: five small tasks, each with a known good outcome, run on
 * both Claude and OpenRouter models to find which model is good enough —
 * and cheapest — for each kind of work. The tests themselves live in
 * /framework/ai/tests/<slug>/ (one page per test: page.jsonl, prompt.md,
 * fixture/); `library.mjs` runs them and appends one `run` line per run to
 * that test's page.jsonl.
 *
 * THIS FILE, NOT AN AITask: every run under runs/<name>/ needs its own real
 * url a spawned model can navigate to and "study" or "fix" (a broken page,
 * a quick fix, a new page) — so this page is a plain hand-written Page, with
 * no custom `route()`. That means `runs/` and anything under it resolve the
 * ordinary way every undeclared name on this site does: Page.child()'s own
 * filesystem probe, which dynamically imports `<url><name>/page.js` the
 * moment that file exists on disk. `library.mjs` copies a test's fixture/
 * into a fresh folder there, and the folder is a real page the instant it
 * has a page.js — nothing here has to be told a run happened. */
export default new Page({
	meta: import.meta,
	title: "Test library work",
	description: "How the test library was built: its brief, its runs, and this task's log.",
	icon: "science",

	content(){
		p("The tests themselves live at ", a("/framework/ai/tests/").href("/framework/ai/tests/"), ": ",
			...["h1-page", "fix-label", "broken-import", "broken-overflow", "plan-views"].flatMap((t, i, all) =>
				[a(t).href("/framework/ai/tests/" + t + "/"), i < all.length - 1 ? ", " : "."]));
		p("Each run below copies a test's fixture into runs/, so the model works on a real page.");
		div.c("card pad", $box => page_work($box, { match: ["openrouter", "test library", "library.mjs"], page: this }));
	},
});
