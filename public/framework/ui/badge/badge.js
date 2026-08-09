import { span } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* Four tones is all the token set honestly has: there is one accent and no
 * `--ok` or `--warn`, so nothing here means *good* or *warning*. */
css(`@layer theme {
	.ui-badge.accent { background: var(--prim); color: white; }
	.ui-badge.dark { background: var(--bg); color: white; }
	.ui-badge.outline { background: none; border: 1px solid var(--line); }
	.ui-badge.count { padding: 0.15em 0.5em; }

	.ui-badge.dot { display: inline-flex; align-items: center; gap: 0.4em; }
	.ui-badge.dot::before {
		content: "";
		width: 0.5em;
		height: 0.5em;
		border-radius: 999px;
		background: currentColor;
	}
}`);

/**
 * badge("default") — a pill at the small type level.
 *
 *     ui.badge.c("accent", "live")
 *     ui.badge.c("dot accent", "live")   // a leading status dot, no extra markup
 *
 * Variants: `accent` `dark` `outline` `count` `dot`.
 */
export const badge = component((...args) => span.c("ui-badge ui-pill h4", ...args));

export default badge;
