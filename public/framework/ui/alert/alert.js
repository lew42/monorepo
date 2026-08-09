import { div, icon } from "../../core/View/View.js";
import { component, css } from "../parts.js";

css(`@layer theme {
	.ui-alert { border-left: 3px solid var(--line); }
	.ui-alert > .icon { color: var(--subtle); }

	.ui-alert.accent { border-left-color: var(--prim); }
	.ui-alert.accent > .icon { color: var(--prim); }

	.ui-alert.error { border-left-color: var(--error); }
	.ui-alert.error > .icon { color: var(--error); }
}`);

/**
 * alert("info", "Heads up", "Capturing is synchronous.") — the first argument is
 * a material icon name; everything after it is the body.
 *
 *     ui.alert.c("accent", "info", () => { div.c("h4", "Heads up"); p("…"); })
 *
 * Variants: `accent` `error`. Pass `null` for no icon.
 */
export const alert = component((glyph, ...args) => div.c("ui-alert ui-surface pad flex gap", () => {
	if (glyph) icon(glyph);
	div.c("ui-alert-body flex-1 flex v gap", args).style("--gap", "0.2em");
}));

export default alert;
