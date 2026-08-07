import { el, div, p, button } from "/app.js";
import { surface } from "../parts.js";

/* Native <dialog>. `showModal()` brings the focus trap, Esc-to-close and the
 * ::backdrop dim — the browser is the component, and this file only dresses it
 * in the same three surface tokens every card wears.
 *
 * `el("dialog", …)` because dialog has no named factory; `el` is the generic one.
 *
 * ⚠ No `.flex` on the dialog itself. The UA hides a closed dialog with
 * `dialog:not([open]) { display: none }`, and an author rule beats a UA rule at
 * ANY layer — so `.flex` kept the "closed" dialog on screen, sitting over the
 * open button and eating its clicks. The layout class lives on an inner div.
 *
 * The UA also sets `color: CanvasText`, which blocks inheritance — so the ink is
 * restated, from the token. */
export default () => div.c("flex v", () => {

	const $dialog = el.c("dialog", "pad", () => {
		div.c("flex v", () => {
			p.c("h3", "Delete branch?");
			p("This cannot be undone. The branch and its four commits go away.");

			div.c("flex gap reverse", () => {
				button.c("prim", "Delete").click(() => $dialog.el.close("delete"));
				button("Cancel").click(() => $dialog.el.close());
			});
		}).style("gap", "0.75em");
	// margin: auto is the UA's centring, and `.flex > * { margin: 0 }` in util
	// erased it — the wrapper is a flex column. Restated inline, which beats any layer.
	}).style({ ...surface, maxWidth: "24em", color: "var(--ink)", margin: "auto" });

	button("Open the dialog").click(() => $dialog.el.showModal())
		.style("align-self", "flex-start");
});
