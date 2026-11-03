import { css } from "../parts.js";

/* The one ui import of a ux: the menu panel IS a popover box, so it loads the popover stylesheet. */
import "/framework/ux/Popover/Popover.js";

/* Tooltip's line again: the panel is positioned against its summary (a
 * relationship) and appears on open (a state). Only the panel needs the CSS —
 * the trigger is `.btn`, whose `display: flex` also drops the UA marker. */
css(`@layer theme {
	.ui-menu { position: relative; }
	.ui-menu-trigger { gap: 0.15em; }
	.ui-menu > summary::-webkit-details-marker { display: none; }

	/* The box look is ux/Popover's (.ux-popover, .ux-popover-item); this only anchors it under the summary. */
	.ui-menu-list.ux-popover {
		position: absolute;
		top: calc(100% + 0.3em);
		left: 0;
		z-index: 10;
		min-width: max(100%, 10em);
	}
}`);
