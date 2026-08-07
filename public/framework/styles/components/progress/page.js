import { Page, md, demo, div, progress } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Progress",
	description: "Native <progress> and <meter>, themed by accent-color for free.",
	icon: "donut_large",

	content(){

		demo(component, "Three gauges, zero CSS. `framework.css` sets `body { accent-color: var(--prim) }` once, and **`accent-color` is the browser's own theming API** for `progress`, `meter`, checkboxes and radios — the bar is in palette before this file says anything.");

		md("## The three states");

		md("| markup | shows |\n| --- | --- |\n| `progress().attr(\"value\", 70).attr(\"max\", 100)` | a determinate bar |\n| `progress()` — no `value` | indeterminate — the browser animates it |\n| `meter()` with `low` / `high` / `optimum` | a gauge that turns amber/red on its own |\n\nThe `meter` colours are the UA's judgement of *good vs bad*, not the theme's — which is right for a disk-space readout and the reason `meter` exists as a separate element.");

		demo(() => {
			div(progress().attr("max", "100").attr("value", "40").style({ width: "100%", accentColor: "var(--error)" }));
		}, "Retuning is the same token move as everywhere else: `accent-color` is inheritable and animatable, so one inline declaration recolours one bar — no vendor pseudo-elements (`::-webkit-progress-bar` and friends are the road this component deliberately does not take).");

		md("Next: [Menu](/framework/styles/components/menu/) — the second component to earn a stylesheet.");
	}
});
