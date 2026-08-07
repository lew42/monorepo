import { div, progress, meter } from "/app.js";

/* Native <progress> and <meter>, and no CSS at all: framework.css sets
 * `body { accent-color: var(--prim) }`, and accent-color is how a browser themes
 * both — the bar arrives in palette before this file says anything.
 *
 * `width: 100%` inline because the base's full-width rule names form FIELDS, and
 * a gauge is not one. */
const row = (label, $bar, value) => div.c("flex v", () => {
	div.c("flex split v-center", () => {
		div.c("h4", label);
		if (value) div.c("h4", value).style("color", "var(--subtle)");
	});
	$bar().style("width", "100%");
}).style("gap", "0.3em");

export default () => div.c("flex v gap", () => {
	row("Uploading", () => progress().attr("max", "100").attr("value", "70"), "70%");
	row("Working…", () => progress());   // no value = indeterminate
	row("Disk", () => meter().attr("min", "0").attr("max", "100")
		.attr("low", "60").attr("high", "85").attr("optimum", "10").attr("value", "91"), "91 GB");
});
