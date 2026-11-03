import { Page, p } from "/app.js";

/* The parent of every ui-fouls screenshot fixture (Servex/ext/openrouter/evals/
 * ui-fouls.mjs). Same reason as runs/page.js one level up: this folder has no
 * task.jsonl, so AITask.route() never claims it, and it falls through to
 * Page.child()'s filesystem probe — but that probe only resolves ONE path
 * segment at a time, so the "ui-fouls" segment needs its OWN page.js here, or
 * `runs/ui-fouls/<fixture-id>/` 404s before the probe ever reaches the
 * fixture's own page.js. (Found the hard way: the first ui-fouls screenshots
 * all captured the site's 404 page instead of the fixture.) Never linked to
 * directly; exists only so this segment resolves instead of 404ing. */
export default new Page({
	meta: import.meta,
	title: "UI fouls fixtures",
	description: "Screenshot fixtures for the ui-fouls vision rung — never browsed directly.",
	content(){
		p("Each fixture here is a tiny page with exactly one planted design foul, shot headless by Servex/ext/openrouter/evals/ui-fouls.mjs and shown to a model to see if it spots the foul.");
	}
});
