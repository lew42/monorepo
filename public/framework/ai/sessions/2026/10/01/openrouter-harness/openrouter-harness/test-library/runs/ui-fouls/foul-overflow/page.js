import { Page, div, p } from "/app.js";

/* Deliberately fouled for the openrouter ui-fouls vision rung
 * (Servex/ext/openrouter/evals/ui-fouls/foul-overflow/test.json): the ONE
 * planted foul is the status line below, pinned to a fixed 900px width with an
 * inline style, so at the 400px screenshot viewport it runs off the right
 * edge. Nothing else on the page is a foul.
 * Never fix this file directly: ui-fouls.mjs screenshots it as-is. */
export default new Page({
	meta: import.meta,
	title: "Status panel",
	description: "A one-line status panel — deliberately fouled for the vision test rung.",

	content(){
		p("Last check: all systems normal.");
		div("This status line is pinned to a fixed width wider than the screen, so it runs off the right edge instead of wrapping.")
			.style("width", "900px");
	}
});
