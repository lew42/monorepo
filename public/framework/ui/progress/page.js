import { Page, md, demo, div, progress, meter } from "/app.js";

// Self-contained on purpose: the source block hands the reader this exact
// function, so its one helper lives inside it.
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

const elements = () => div.c("flex v gap", () => {
	progress().attr("max", "100").attr("value", "70").style("width", "100%");
	progress().style("width", "100%");
	meter().attr("min", "0").attr("max", "100")
		.attr("low", "60").attr("high", "85").attr("optimum", "10").attr("value", "91")
		.style("width", "100%");
});

const accent = () => progress().attr("max", "100").attr("value", "40")
	.style({ width: "100%", accentColor: "var(--error)" });

export default new Page({
	meta: import.meta,
	title: "Progress",
	description: "A template, not a function — the component is <progress>, and the browser wrote it.",
	icon: "donut_large",

	children: [
		demo.page("elements", elements, {
			note: "The three raw elements, no label rows: a determinate bar, an indeterminate one the browser animates, and a `meter` past its `high` — whose amber is the **UA's** judgement of good versus bad rather than the theme's, and the reason `meter` is a separate element." }),

		demo.page("accent", accent, {
			note: "`accent-color` is inheritable and animatable, so one declaration recolours one bar — or every bar in a section. The vendor pseudo-element route (`::-webkit-progress-bar` and friends) is deliberately not taken: it is per-engine, and it opts you out of the platform's own theming." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(bars, steer).ac("bleed"),
			def: bars,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.progress()`**, and there shouldn't be: the component is `<progress>`. Wrapping it would add a label row and take away three attributes. `progress` and `meter` are already View factories, so the markup is one call — and the label row is `flex split v-center`, which is the [toolbar](/framework/ui/toolbar/) row again.",
		});

		md("## Themed before any file says anything");

		md("`framework.css` sets `body { accent-color: var(--prim) }` once, and **`accent-color` is the browser's own theming API** for `progress`, `meter`, checkboxes and radios. The bars above arrive themed with zero CSS anywhere in this directory.");

		md("| markup | shows |\n| --- | --- |\n| `progress().attr(\"value\", 70).attr(\"max\", 100)` | a determinate bar |\n| `progress()` — no `value` | indeterminate; the browser animates it |\n| `meter()` with `low` / `high` / `optimum` | a gauge that turns amber or red on its own |");

		md("`width: 100%` is inline because the base theme's full-width rule names form *fields*, and a gauge is not one.");

		md("Next: [Menu](/framework/ui/menu/) — the second component to earn a selector.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", bars)); },
});
