import { el, div } from "../../core/View/View.js";
import { component, css } from "../parts.js";

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

/**
 * dialog(…) — a native `<dialog>`, dressed in the same surface every card wears.
 * `showModal()` brings the focus trap, Esc-to-close, the `::backdrop` dim and the
 * top layer; this adds nothing to it.
 *
 *     const $confirm = ui.dialog(() => { p.c("h3", "Delete branch?"); … });
 *     button("Delete…").click(() => $confirm.el.showModal());
 *
 * ⚠ Never put a `display` class on the `<dialog>` itself. The UA hides a closed
 * one with `dialog:not([open]) { display: none }` and an author rule beats a UA
 * rule at any layer, so the "closed" dialog stays on screen eating clicks — which
 * is why the layout class is on an inner div.
 */
export const dialog = component((...args) =>
	el.c("dialog", "ui-dialog ui-surface pad", () => div.c("flex v gap", args)));

export default dialog;
