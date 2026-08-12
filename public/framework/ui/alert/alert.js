import "../../core/View/View.js";
import { css } from "../parts.js";

/* `> .icon` names a class this file does not emit — `icon()` from View.js does,
 * which is what the import above is: the loading edge, not an annotation. */
css(`@layer theme {
	.ui-alert { border-left: 3px solid var(--line); }
	.ui-alert > .icon { color: var(--subtle); }

	.ui-alert.accent { border-left-color: var(--prim); }
	.ui-alert.accent > .icon { color: var(--prim); }

	.ui-alert.error { border-left-color: var(--error); }
	.ui-alert.error > .icon { color: var(--error); }
}`);
