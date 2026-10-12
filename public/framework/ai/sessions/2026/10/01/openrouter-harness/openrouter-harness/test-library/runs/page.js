import { Page, p } from "/app.js";

/* The parent of every test-library run (Servex/ext/openrouter/evals/library.mjs).
 * A run folder here has no task.jsonl, so `AITask.route()` (the task-dir
 * template every ancestor folder up to this one uses) never claims it — it
 * falls through to `Page.child()`'s own filesystem probe, which looks for
 * `<this url><run-name>/page.js` and loads it directly. That is the one
 * mechanism this whole library leans on: `library.mjs` copies a test's
 * `fixture/` into a fresh folder here, and the folder becomes a real,
 * browsable page the moment it has a `page.js` in it — no parent edit, no
 * `children:` list to keep in sync with runs that come and go by the
 * thousands. This index page itself is never linked to; it exists only so
 * the "runs" segment resolves to something instead of 404ing. */
export default new Page({
	meta: import.meta,
	title: "Test library runs",
	description: "One folder per run of the openrouter test library — never browsed directly.",
	content(){
		p("Each run of the test library (Servex/ext/openrouter/evals/library.mjs) gets its own folder here, copied from a test's fixture/. See the library's own doc for the list of tests.");
	}
});
