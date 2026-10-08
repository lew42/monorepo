import { Page, p } from "/app.js";

/* The parent of every overhead-ladder run (Servex/ext/openrouter/evals/library.mjs,
 * same mechanism as test-library/runs/page.js). A run folder here has no task.jsonl,
 * so AITask.route() never claims it — it falls through to Page.child()'s own
 * filesystem probe, which looks for `<this url><run-name>/page.js` and loads it
 * directly. This index page exists only so the "overhead-runs" segment resolves to
 * something instead of 404ing; it is never browsed directly. */
export default new Page({
	meta: import.meta,
	title: "Overhead runs",
	description: "One folder per run of the model-weights overhead ladder — never browsed directly.",
	content(){
		p("Each run of the overhead ladder (requirements.md, \"The framework-literacy ladder\") gets its own folder here.");
	}
});
