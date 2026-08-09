import { div } from "../../core/View/View.js";
import { component, css } from "../parts.js";

css(`@layer theme {
	.ui-panel-head { border-bottom: 1px solid var(--line); }
	.ui-panel-foot { border-top: 1px solid var(--line); }
	.ui-panel.raised { box-shadow: 0 8px 30px color-mix(in srgb, var(--ink) 14%, transparent); }
}`);

/**
 * panel(head, body, foot) — three padded rows on one surface, held apart by two
 * hairlines. Any of the three may be a string or a function; omit head or foot
 * and its row and its rule go away.
 *
 * The footer is `flex gap reverse`, which right-aligns the action row — and
 * reverses the DOM order with it, so the primary action comes first in source
 * and in the tab order. Variant: `raised`.
 */
export const panel = component((head, body, foot) => div.c("ui-panel ui-surface", () => {
	if (head) div.c("ui-panel-head pad flex v-center split gap", head);
	div.c("ui-panel-body pad", body);
	if (foot) div.c("ui-panel-foot pad flex gap reverse", foot);
}));

export default panel;
