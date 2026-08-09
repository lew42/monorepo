import { div } from "../../core/View/View.js";
import { component } from "../parts.js";

/**
 * card(…) — a padded surface holding whatever you give it.
 *
 *     ui.card(() => { h3("View"); p("A DOM element with a chainable API."); });
 *
 * No stylesheet: the look is `ui-surface`, the box is `pad flex v gap`. The
 * `.ui-card` class is a hook for the page that wants to retune one.
 */
export const card = component((...args) => div.c("ui-card ui-surface pad flex v gap", ...args)
	.style("--gap", "0.5em"));

export default card;
