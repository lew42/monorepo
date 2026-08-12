import { Page, md, demo, div, progress, meter } from "/app.js";
import { palette, copy } from "../parts.js";

// Self-contained on purpose: copy() hands the reader this exact function, so its
// one helper lives inside it.
const bars = () => {
	const row = (label, bar, value) => div.c("flex v gap", () => {
		div.c("flex split v-center", () => {
			div.c("h4", label);
			if (value) div.c("h4 muted", value);
		});
		bar().style("width", "100%");
	}).style("--gap", "0.3em");

	return div.c("flex v gap", () => {
		row("Uploading", () => progress().attr("max", "100").attr("value", "70"), "70%");
		row("Working…", () => progress());
		row("Disk", () => meter().attr("min", "0").attr("max", "100")
			.attr("low", "60").attr("high", "85").attr("optimum", "10").attr("value", "91"), "91 GB");
	});
};

export default new Page({
	meta: import.meta,
	title: "Progress",
	description: "A template, not a function — the component is <progress>, and the browser wrote it.",
	icon: "donut_large",

	content(){

		palette(
			["determinate", () => progress().attr("max", "100").attr("value", "70").style("width", "100%")],
			["indeterminate", () => progress().style("width", "100%")],
			["meter, past `high`", () => meter().attr("min", "0").attr("max", "100")
				.attr("low", "60").attr("high", "85").attr("optimum", "10").attr("value", "91")
				.style("width", "100%")],
			["with a label row", bars],
		);

		md("## Copy it");

		copy(bars);

		md("**There is no `ui.progress()`**, and there shouldn't be: the component is `<progress>`. Wrapping it would add a label row and take away three attributes. `progress` and `meter` are already View factories, so the markup is one call — and the label row above is `flex split v-center`, which is the [toolbar](/framework/ui/toolbar/) row again.");

		md("## Themed before any file says anything");

		md("`framework.css` sets `body { accent-color: var(--prim) }` once, and **`accent-color` is the browser's own theming API** for `progress`, `meter`, checkboxes and radios. The bar arrives in palette with zero CSS anywhere in this directory.");

		md("| markup | shows |\n| --- | --- |\n| `progress().attr(\"value\", 70).attr(\"max\", 100)` | a determinate bar |\n| `progress()` — no `value` | indeterminate; the browser animates it |\n| `meter()` with `low` / `high` / `optimum` | a gauge that turns amber or red on its own |\n\nThe `meter` colours are the **UA's** judgement of good versus bad, not the theme's — which is right for a disk readout, and the reason `meter` exists as a separate element from `progress`.");

		md("`width: 100%` is inline because the base theme's full-width rule names form *fields*, and a gauge is not one.");

		md("## Retuning is one inheritable property");

		demo(() => {
			div(progress().attr("max", "100").attr("value", "40")
				.style({ width: "100%", accentColor: "var(--error)" }));
		}, "`accent-color` is inheritable and animatable, so one declaration recolours one bar — or every bar in a section. The vendor pseudo-element route (`::-webkit-progress-bar` and friends) is deliberately not taken: it is per-engine, and it opts you out of the platform's own theming.");

		md("Next: [Menu](/framework/ui/menu/) — the second component to earn a selector.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", bars)); },
});
