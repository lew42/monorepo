import { Page, div, p } from "/app.js";

/* Deliberately fouled for the openrouter ui-fouls vision rung
 * (Servex/ext/openrouter/evals/ui-fouls/foul-contrast/test.json): the ONE
 * planted foul is the "Save changes" button, whose light-gray text on a
 * near-white background fails WCAG contrast badly (about 1.6:1). Nothing
 * else on the page is a foul.
 * Never fix this file directly: ui-fouls.mjs screenshots it as-is. */
export default new Page({
	meta: import.meta,
	title: "Profile",
	description: "A one-button form — deliberately fouled for the vision test rung.",

	content(){
		p("Display name");
		div("Alex Rivera").style("padding", "6px 10px").style("border", "1px solid #ccc");
		div("Save changes")
			.style("display", "inline-block")
			.style("margin-top", "14px")
			.style("padding", "8px 16px")
			.style("background", "#f5f5f5")
			.style("color", "#d8d8d8")
			.style("border-radius", "4px");
	}
});
