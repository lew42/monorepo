import { Page, md, demo } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Dialog",
	description: "Native <dialog> — the browser is the component.",
	icon: "picture_in_picture",

	content(){

		demo(component, "Open it, press **Esc**, tab around it. The focus trap, the dismiss key and the dimmed backdrop are all `showModal()` — no JS beyond the two calls, and no stylesheet: the box is `pad` plus the surface tokens every card wears, with a `flex v` div inside.");

		md("## What the browser gives away");

		md("| behaviour | costs |\n| --- | --- |\n| modal focus trap | `showModal()` |\n| Esc closes | free |\n| backdrop dim | free (`::backdrop`) |\n| centred in the viewport | free (`margin: auto`) |\n| top layer — no `z-index` fight | free |\n\nA `div`-based modal re-implements every row of that table, usually wrong — focus management alone is a component's worth of code.");

		md("## Two things worth knowing");

		md("**The UA sets `color: CanvasText` on a dialog**, which blocks inheritance — a themed page shows a black-ink dialog in dark mode until the ink is restated. One declaration, from the token: `color: var(--ink)`.\n\n**Never put `.flex` on the dialog itself.** The UA hides a closed dialog with `dialog:not([open]) { display: none }`, and an author rule beats a UA rule at *any* layer — so a layout class on the element keeps the \"closed\" dialog on screen, invisibly eating clicks. The layout class goes on an inner div. Found by a click that timed out, not by an error: nothing throws.\n\n**`close(value)` carries the answer.** The button passes `\"delete\"`, and the caller reads `$dialog.el.returnValue` in a `close` listener — a form with `method=\"dialog\"` does the same without any JS.");

		md("The one look this file doesn't own is the backdrop: `::backdrop` is a pseudo-element, so an inline style can never reach it. The UA's dim is fine; a site that wants its own writes one rule in `@layer site`.");

		md("Next: [Progress](/framework/styles/components/progress/) — themed before any file says anything.");
	}
});
