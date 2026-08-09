import { details, summary, div, a, span, icon, is } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* Tooltip's line again: the panel is positioned against its summary (a
 * relationship) and appears on open (a state). Only the panel needs the CSS —
 * the trigger is `.btn`, whose `display: flex` also drops the UA marker. */
css(`@layer theme {
	.ui-menu { position: relative; }
	.ui-menu-trigger { gap: 0.15em; }
	.ui-menu > summary::-webkit-details-marker { display: none; }

	.ui-menu-list {
		position: absolute;
		top: calc(100% + 0.3em);
		left: 0;
		z-index: 10;
		min-width: max(100%, 10em);
		padding: 0.3em;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--ink) 14%, transparent);
	}

	.ui-menu-item {
		padding: 0.4em 0.6em;
		border-radius: var(--radius);
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
	}
	.ui-menu-item:hover { background: var(--wash); color: var(--prim); }
}`);

/**
 * menu("Actions", "Rename", ["Delete", "/delete/"], …) — a `<details>` dropdown.
 * A bare string is an item with no url; a pair carries one.
 *
 * Open/closed is the element's own `open` attribute, so there is no state here —
 * the one listener closes the panel after a pick. No light dismiss: the native
 * upgrade for that is the Popover API.
 */
export const menu = component((label, ...items) => details.c("ui-menu", $menu => {
	summary.c("ui-menu-trigger btn flex v-center", () => {
		span(label);
		icon("arrow_drop_down");
	});

	div.c("ui-menu-list flex v", () => items.forEach(item => {
		const [text, url] = is.arr(item) ? item : [item, "#"];
		a.c("ui-menu-item", text).href(url).click(() => $menu.el.removeAttribute("open"));
	}));
}));

export default menu;
