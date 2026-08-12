import { css } from "../parts.js";

/* Two hairlines and an elevation. The shadow mixes the INK token rather than an
 * rgba literal, so it stays a percentage of whatever the theme calls contrast. */
css(`@layer theme {
	.ui-panel-head { border-bottom: 1px solid var(--line); }
	.ui-panel-foot { border-top: 1px solid var(--line); }
	.ui-panel.raised { box-shadow: 0 8px 30px color-mix(in srgb, var(--ink) 14%, transparent); }
}`);
