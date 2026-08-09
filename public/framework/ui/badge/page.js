import { Page, md, demo, div, span, icon } from "/app.js";
import { palette } from "../parts.js";
import { badge } from "./badge.js";

export default new Page({
	meta: import.meta,
	title: "Badges",
	description: "One pill, five variant classes — and the tones the token set can't give you.",
	icon: "label",

	content(){

		palette(
			["default", () => badge("default")],
			["accent", () => badge.c("accent", "accent")],
			["dark", () => badge.c("dark", "dark")],
			["outline", () => badge.c("outline", "outline")],
			["dot", () => badge.c("dot accent", "live")],
			["count", () => badge.c("count accent", "7")],
		);

		md("## Calling it");

		demo(() => {
			div.c("flex wrap v-center gap", () => {
				badge("default");
				badge.c("accent", "shipped");
				badge.c("dot accent", "live");
			}).style("--gap", "0.4em");
		}, "`h4` is already a small, tracked, uppercase label, so a badge is that class plus `ui-pill` — `--wash`, a `999px` radius and `0.15em 0.7em` of padding. Every variant changes one property of it.");

		md("`.c(\"classes\", …)` is the same form every View factory has: `div.c()`, `span.c()`, `ui.badge.c()`. One mechanism, `component()` in `parts.js`, four lines.");

		md("## The dot is a pseudo-element, not markup");

		md("```css\n.ui-badge.dot::before {\n\tcontent: \"\";\n\twidth: 0.5em;\n\theight: 0.5em;\n\tborder-radius: 999px;\n\tbackground: currentColor;\n}\n```");

		md("`background: currentColor` is what makes it free: the dot is whatever colour the badge already is, so `accent`, `dark` and `outline` each tint it without a second rule. The old version was a nested `<span>` with four inline declarations, and the caller had to write it.");

		md("## Four tones, not six");

		md("The token set has **one accent**. `--prim --bg --wash --subtle --surface --line`, plus `--error`, which arrived to replace `#c00` in three stylesheets rather than for components. Nothing means *good* or *warning*. So a badge honestly offers neutral, accent, dark and outline, and one that wants green-for-passing would have to name a colour — the thing a component may not do.\n\nThat is a finding, not a workaround: **the status axis is a third done.** `--ok` and `--warn` beside `--error` would finish it for every badge, alert, meter and diff row after. On the [record](/framework/ui/).");

		md("## Composed, not configured");

		demo(() => {
			div.c("flex wrap v-center gap", () => {
				[["verified", "check"], ["draft", "edit"], ["archived", "inventory_2"]].forEach(([text, glyph]) =>
					badge.c("flex v-center gap", () => {
						icon(glyph).style("fontSize", "1em");
						span(text);
					}).style("--gap", "0.35em"));
			}).style("--gap", "0.4em");
		}, "An icon badge is the same call with utility classes added and a body function instead of a string. No `icon` option, no variants map — `.c()` plus arguments is the whole extension mechanism.");

		md("Next: [Alerts](/framework/ui/alert/) — the same idea at block scale.");
	},
});
