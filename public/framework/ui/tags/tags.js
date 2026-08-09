import { div, span, input } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* The bare field lives in `util` on purpose. The theme's rule is
 * `input:not([type="checkbox"], …)`, whose `:not()` gives it an attribute
 * selector's specificity — a class in `theme` would lose to it. A later layer
 * wins whatever the specificity, which is what an opt-out needs. */
css(`@layer util {
	.ui-tags-input { border: none; background: none; padding: 0; min-width: 7em; }
}
@layer theme {
	.ui-tag-x { cursor: pointer; }
}`);

/**
 * tags("core", "no-build", "esm") — chips in a field, with room to type.
 *
 * A read-only tag *list* wants no field and no opt-out: that is
 * `div.c("flex wrap gap", () => names.forEach(n => ui.badge(n)))`.
 */
export const tags = component((...names) => div.c("ui-tags ui-surface pad flex wrap v-center gap", () => {
	names.forEach(name => span.c("ui-tag ui-pill h4 flex v-center gap", () => {
		span(name);
		span.c("ui-tag-x ui-muted", "×");
	}).style("--gap", "0.4em"));

	input().ac("ui-tags-input flex-1").attr("placeholder", "add a tag…");
}).style("--gap", "0.4em"));

export default tags;
