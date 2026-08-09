import { div, span, button } from "../../core/View/View.js";
import { component } from "../parts.js";

/**
 * pagination(["1", "2", "…", "12"], "2", pick) — real buttons, so the theme
 * already sizes them and `.prim` marks the current page. `"…"` is a gap.
 *
 * `pick` receives the label, or `"prev"` / `"next"`.
 */
export const pagination = component((pages, current, pick = () => {}) =>
	div.c("ui-pagination flex wrap v-center gap", () => {
		button("‹ Prev").click(() => pick("prev"));

		pages.forEach(label => label === "…"
			? span.c("ui-muted", label)
			: button.c(label === current && "prim", label).click(() => pick(label)));

		button("Next ›").click(() => pick("next"));
	}).style("--gap", "0.3em"));

export default pagination;
