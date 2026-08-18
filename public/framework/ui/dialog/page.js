import { Page, md, demo, div, el, p, button, form, input } from "/app.js";

/* The template, verbatim — rendered on the stage AND printed as the source, so the
 * code on the page is the code that ran. The opener is part of it: the button is
 * what knows which dialog it opens. */
const confirm = () => div.c("flex v", () => {
	const $dialog = el.c("dialog", "ui-dialog surface pad", () => div.c("flex v gap", () => {
		p.c("h3", "Delete branch?");
		p("This cannot be undone. The branch and its four commits go away.");

		div.c("flex gap reverse", () => {
			button.c("prim", "Delete").click(() => $dialog.el.close("delete"));
			button("Cancel").click(() => $dialog.el.close());
		});
	}));

	button("Open the dialog").click(() => $dialog.el.showModal()).style("alignSelf", "flex-start");
});

// A closed dialog renders nothing, so anything that has to SHOW one — this page's
// card on the rail, and the variant below — draws what showModal() shows.
const opened = () => div.c("surface pad flex v gap", () => {
	p.c("h3", "Delete branch?");
	p("This cannot be undone.");
	div.c("flex gap reverse", () => { button.c("prim", "Delete"); button("Cancel"); });
});

/* The same modal with no listener in it at all: a form whose method is `dialog` closes
   the dialog on submit and sets `returnValue` from the button that submitted. */
const asking = () => div.c("flex v", () => {
	const $dialog = el.c("dialog", "ui-dialog surface pad", () => form(() => {
		div.c("flex v gap", () => {
			p.c("h3", "Rename branch");
			input().attr("name", "branch").attr("value", "michael/dev");

			div.c("flex gap reverse", () => {
				button.c("prim", "Rename").attr("value", "rename");
				button("Cancel").attr("value", "").attr("formnovalidate", "");
			});
		});
	}).attr("method", "dialog"));

	button("Open the form").click(() => $dialog.el.showModal()).style("alignSelf", "flex-start");
});

export default new Page({
	meta: import.meta,
	title: "Dialog",
	description: "Native <dialog> — the browser is the component, and the CSS is the trap.",
	icon: "picture_in_picture",

	children: [
		demo.page("form", asking, {
			note: "`<form method=\"dialog\">` — **no listener anywhere in this variant.** Submitting closes the dialog and sets `returnValue` to the submitter's `value`, so the caller reads one string in a `close` listener instead of wiring a handler per button. `formnovalidate` on Cancel is what lets it out past a required field." }),

		demo.page("open", opened, {
			note: "What `showModal()` shows, drawn inline so there is something to look at. The Delete button passes `\"delete\"` to `close()`, and the caller reads `$dialog.el.returnValue` in a `close` listener — a `<form method=\"dialog\">` does the same with no JS at all." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(confirm, steer).ac("bleed"),
			def: confirm,
			file: new URL("page.js", import.meta.url).pathname,
			note: "Open it, press Esc, tab around it. **There is no `ui.dialog()`** — it wrapped one `el.c(\"dialog\", …)` with no listener and nothing unique to mint, and the wrapper's own `.c()` form *re-armed the trap it existed to avoid*, because a class handed to it landed on the `<dialog>` itself. `el` has no `dialog` factory, which is the only reason it looks unusual.",
		});

		md("## What the browser gives away");

		md("| behaviour | costs |\n| --- | --- |\n| modal focus trap | `showModal()` |\n| Esc closes | free |\n| backdrop dim | free (`::backdrop`) |\n| centred in the viewport | free (`margin: auto`) |\n| top layer — no `z-index` fight | free |\n\nA `div`-based modal re-implements every row of that table, usually wrong. Focus management alone is a component's worth of code.");

		md("## Three traps, all of them silent");

		md("**The UA sets `color: CanvasText`**, which blocks inheritance — a themed page shows black ink in dark mode until the ink is restated. One declaration, from the token, in `dialog.js`.");

		md("**Never put a `display` class on the `<dialog>` itself.** The UA hides a closed one with `dialog:not([open]) { display: none }`, and an author rule beats a UA rule at *any* layer — so a layout class keeps the \"closed\" dialog on screen, invisibly eating clicks. Found by a click that timed out, not by an error. That is why `flex v gap` goes on an inner div above, and why you should not move it out.");

		md("**`margin: auto` is the UA's centring, and `.flex > * { margin: 0 }` erases it** the moment a dialog sits inside a flex column. So `.ui-dialog { margin: auto }` is declared a second time in `@layer util` — the one place in this library where a later layer is used to win an argument, and the argument is with a utility, not with the theme.");

		md("The one look this component doesn't own is the backdrop: `::backdrop` is a pseudo-element, so a site that wants its own dim writes one rule in `@layer site`.");

		md("Next: [Progress](/framework/ui/progress/) — where the browser wrote the element too.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", opened)); },
});
