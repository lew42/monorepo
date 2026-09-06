import { Page, View, md, div, p, span, button, a, input, select, option, textarea, details, summary } from "/app.js";

View.stylesheet(import.meta, "controls.css");

/* One row holding one of every control the grammar covers. It is a function so the
   page can render it four times — plain, and inside each of the three size words —
   and so the row you read about is literally the row you are looking at. */
const row = () => div.c("ui-controls-row", () => {
	button("Button");
	button.c("prim", "Prim");
	button.c("bg", "Bg");
	a.c("btn", "Link").href("#");
	input().attr("value", "Text field").attr("size", "12");
	select(() => { option("Select"); option("Another"); }).ac("auto");
	textarea("Textarea").attr("rows", "1").attr("cols", "12");
	details(() => summary("Summary"));
	// A tab is quiet by construction — a label with a mark under it, no box — so it
	// only reads as a control inside its own strip. Two of them, because ext/tabs
	// hides a bar holding one ("a rail of one is not a rail").
	div.c("tabs underline", () => div.c("tab-bar", () => {
		a.c("tab active", "Tab").href("#");
		a.c("tab", "Tab").href("#");
	}));
	button("Disabled").attr("disabled", "");
});

// The same row, with the site skin's button voice cleared — see controls.css.
const base_row = () => div.c("ui-controls-base", row);

const sizes = () => div.c("ui-controls-sizes", () => {
	[["size-small", "size-small — 0.75"], ["", "default — 1"], ["size-large", "size-large — 1.25"]]
		.forEach(([word, label]) => div.c("ui-controls-panel ui-controls-base " + word, () => {
			div.c("ui-controls-label", label);
			row();
		}));
});

export default new Page({
	meta: import.meta,
	title: "Controls",
	description: "One box for every control — one height, one padding, one hairline, one corner.",
	icon: "tune",

	content(){

		p("A button, a link that acts like one, a select, a text field, a textarea, a disclosure summary and a tab are all the same rectangle. Same height, same padding, same hairline, same corner, same fill, same hover. Only what they do is different.");

		base_row();

		md("Every one of those is **36.1px tall** at a 1280px screen and **43.2px** at 3440. Before this they were four different boxes written in the same file, plus a fifth in `ext/tabs`, and the same row stood 40.5, 36.6, 34.6 and 43.7px tall.");

		md("## One knob: `--size`");

		p("Put one word on a panel — a toolbar, a rail, a dense list — and every control inside it changes size together. Nothing else on the page moves: the label above each row is the same size in all three.");

		sizes().ac("bleed");

		md("`--size` is a plain number, not a length, and it is never a function of the window width. A control's font-size is `calc(1em * var(--size, 1))`; its height, padding and corner are `em` of *that*, so one declaration carries the knob and everything else follows. The default is 1, and a default control is exactly the base font size — nothing about the default size changed.");

		md("## The site's own button is still different");

		p("The row above clears one thing to show you the base theme. This is the same row as this site actually paints it:");

		row();

		md("The site's skin (`styles/layers/theme/lew42/lew42.css`) gives every `button` and `.btn` a voice of its own — `font-size: 0.8em`, bold, uppercase, `padding: 0.7em 1.4em` — at a specificity the base theme cannot reach. That is a skin's job and it is allowed. But it is also why a button on this site does not match the field beside it, and why it does not match the base font size. **Deleting those five declarations is the whole fix**, and it belongs to whoever owns the skin.");

		md.details(import.meta, "doc/grammar.md", "The whole grammar, and every before/after number");

		md("Also: [the base theme's own rules, line by line](/framework/styles/layers/theme/) · [the 2026-09-01 survey that counted the families](/imagine/design/controls/) · [where `--size` came from](/imagine/design/size/) · back to [UI](/framework/ui/).");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad ui-controls-base", row)); },
});
