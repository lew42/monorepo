import { css } from "../parts.js";

/* Four tones is all the token set honestly has: there is one accent and no
 * `--ok` or `--warn`, so nothing here means *good* or *warning*. */
css(`@layer theme {
	.ui-badge.accent { background: var(--prim); color: var(--surface); }
	.ui-badge.dark { background: var(--ink); color: var(--surface); }
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
