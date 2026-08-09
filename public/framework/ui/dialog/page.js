import { Page, md, demo, div, p, button } from "/app.js";
import { palette } from "../parts.js";
import { dialog } from "./dialog.js";

// The opener and the dialog are built together: the button is what knows which
// dialog it opens, so the pair is the smallest honest example.
const confirmation = () => div.c("flex v", () => {
	const $dialog = dialog(() => {
		p.c("h3", "Delete branch?");
		p("This cannot be undone. The branch and its four commits go away.");

		div.c("flex gap reverse", () => {
			button.c("prim", "Delete").click(() => $dialog.el.close("delete"));
			button("Cancel").click(() => $dialog.el.close());
		});
	});

	button("Open the dialog").click(() => $dialog.el.showModal()).style("alignSelf", "flex-start");
});

export default new Page({
	meta: import.meta,
	title: "Dialog",
	description: "Native <dialog> — the browser is the component.",
	icon: "picture_in_picture",

	content(){

		palette(
			["ui.dialog(…) + an opener", confirmation],
			["what it looks like open", () => div.c("ui-surface pad flex v gap", () => {
				p.c("h3", "Delete branch?");
				p("This cannot be undone.");
				div.c("flex gap reverse", () => { button.c("prim", "Delete"); button("Cancel"); });
			})],
		);

		md("Open it, press **Esc**, tab around it.");

		md("## Calling it");

		demo(confirmation, "`ui.dialog()` returns the view, so the caller keeps it and calls `showModal()` on `.el`. The focus trap, the dismiss key and the dimmed backdrop arrive with that one call — there is no JS here beyond it.");

		md("## What the browser gives away");

		md("| behaviour | costs |\n| --- | --- |\n| modal focus trap | `showModal()` |\n| Esc closes | free |\n| backdrop dim | free (`::backdrop`) |\n| centred in the viewport | free (`margin: auto`) |\n| top layer — no `z-index` fight | free |\n\nA `div`-based modal re-implements every row of that table, usually wrong. Focus management alone is a component's worth of code.");

		md("## Three traps, all of them silent");

		md("**The UA sets `color: CanvasText`**, which blocks inheritance — a themed page shows black ink in dark mode until the ink is restated. One declaration, from the token.");

		md("**Never put a `display` class on the `<dialog>` itself.** The UA hides a closed one with `dialog:not([open]) { display: none }`, and an author rule beats a UA rule at *any* layer — so a layout class keeps the \"closed\" dialog on screen, invisibly eating clicks. Found by a click that timed out, not by an error. That is why `ui.dialog()` puts `flex v gap` on an inner div, and why you should not add one.");

		md("**`margin: auto` is the UA's centring, and `.flex > * { margin: 0 }` erases it** the moment a dialog sits inside a flex column. So `.ui-dialog { margin: auto }` is declared a second time in `@layer util` — the one place in this library where a later layer is used to win an argument, and the argument is with a utility, not with the theme.");

		md("## `close(value)` carries the answer");

		md("The Delete button passes `\"delete\"`, and the caller reads `$dialog.el.returnValue` in a `close` listener. A `<form method=\"dialog\">` does the same with no JS at all. The one look this component doesn't own is the backdrop: `::backdrop` is a pseudo-element, so a site that wants its own dim writes one rule in `@layer site`.");

		md("Next: [Progress](/framework/ui/progress/) — the last of the three templates, and the shortest.");
	},
});
