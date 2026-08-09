import { div, a, span, is } from "../../core/View/View.js";
import { component, css } from "../parts.js";

css(`@layer theme {
	.ui-crumbs a { text-decoration: none; }
	.ui-crumbs-sep { color: var(--subtle); }
}`);

/**
 * crumbs(["Framework", "/framework/"], …, "Here") — pairs are links, a bare
 * string is where you are.
 *
 * Nothing reads the current url: the links are real, so `Router.mark_links()`
 * paints `.in-path` on every ancestor of it and `.page-link` accents that.
 */
export const crumbs = component((...trail) => div.c("ui-crumbs flex wrap v-center h4 gap", () => {
	trail.forEach((item, i) => {
		if (i) span.c("ui-crumbs-sep", "/");
		is.arr(item) ? a.c("page-link", item[0]).href(item[1]) : span.c("ui-muted", item);
	});
}).style("--gap", "0.5em"));

export default crumbs;
