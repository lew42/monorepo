import { Page, div, p } from "/app.js";

/* Deliberately broken for the openrouter test library
 * (Servex/ext/openrouter/evals/library/broken-overflow/test.json): the status
 * line below is pinned to a fixed 900px width with an inline style, so at any
 * viewport narrower than that — 400px included — it runs off the right edge.
 * The one cause is that one `.style("width", "900px")` call; everything else
 * on the page is unrelated. Never fix this file directly: library.mjs copies
 * it into a fresh run dir per test run. */
export default new Page({
	meta: import.meta,
	title: "Status panel",
	description: "A one-line status panel — broken on purpose, for the model test library.",

	content(){
		p("Last check: all systems normal.");
		div("This status line is pinned to a fixed width wider than the page, so narrow screens see it run off the right edge instead of wrapping.")
			.style("width", "900px");
	}
});
