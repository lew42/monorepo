import { css } from "../parts.js";

/* Two silent traps. The UA sets `color: CanvasText`, which blocks the theme's ink
 * — hence the restatement. And `margin: auto` IS the UA's centring, which
 * `.flex > * { margin: 0 }` erases the moment a dialog sits in a flex column, so
 * it is declared again from a later layer. */
css(`@layer theme {
	.ui-dialog { max-width: 24em; color: var(--ink); }
}
@layer util {
	.ui-dialog { margin: auto; }
}`);
