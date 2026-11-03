import { Page, div, p } from "/app.js";

/* Deliberately fouled for the openrouter ui-fouls vision rung
 * (Servex/ext/openrouter/evals/ui-fouls/foul-padding/test.json): the ONE planted
 * foul is the amber notice box below, whose text has zero padding — it touches
 * the box's own border on every side. Nothing else on the page is a foul.
 * Never fix this file directly: ui-fouls.mjs screenshots it as-is. */
export default new Page({
	meta: import.meta,
	title: "Notice",
	description: "A one-line notice box — deliberately fouled for the vision test rung.",

	content(){
		p("Account settings");
		div("Your subscription renews in 3 days. Update your payment method to avoid interruption.")
			.style("background", "#fff3cd")
			.style("border", "2px solid #e0a800")
			.style("padding", "0")
			.style("margin", "16px 0")
			.style("font-size", "15px");
	}
});
