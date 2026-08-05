import { Page, md, demo, div, p, a, span, form, label, input, textarea, select, option,
	button, fieldset, legend, meter, progress, toc } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Forms",
	description: "Controls, and the two `:not()` lists that deliberately disagree about what a button is.",
	content(){

		toc();

		demo(() => {
			form.c("flex v gap", () => {
				label.c("flex v", () => {
					div.c("h4", "Email");
					input().attr("type", "email").attr("placeholder", "you@example.com");
				});
				label.c("flex v", () => {
					div.c("h4", "Message");
					textarea.c("auto").attr("placeholder", "grows as you type");
				});
				div.c("flex gap", () => {
					button.c("prim", "Send");
					button("Cancel");
				});
			});
		}, "A real form, **no stylesheet**. `flex v gap` stacks it, `h4` labels the fields, `.prim` marks the primary action, `.auto` makes the textarea follow its content — four utility classes, and the base theme does the rest.");

		md("Everything below is how that works.");

		md("## The reset");

		md("`input, button, textarea, select { font: inherit }` is the one that matters most, and it's the least visible: form controls opt out of the document font **by default, in every browser**. `font` and not `font-family`, so size, weight and line-height come along too.\n\nThen `input:not([type=\"checkbox\"], [type=\"radio\"], [type=\"submit\"], [type=\"color\"], [type=\"button\"], [type=\"reset\"]), select, textarea { width: 100% }` — text-ish controls fill their container instead of defaulting to a mysterious 20-character `size`. The `:not()` list is every type where that would be absurd. Both are demoed against the browser default in [base](/framework/styles/base/).");

		md("## The types the lists name");

		demo(() => {
			div.c("flex gap wrap v-center", () => {
				label(input().attr("type", "checkbox"), " checkbox");
				label(input().attr("type", "radio").attr("name", "r"), " radio");
				label(input().attr("type", "radio").attr("name", "r"), " radio");
				input().attr("type", "color").attr("value", "#ff8f60");
				input().attr("type", "submit").attr("value", "submit");
				input().attr("type", "button").attr("value", "button");
				input().attr("type", "reset").attr("value", "reset");
			});
		}, "The six types held back from `width: 100%`. **And the two `:not()` lists deliberately differ:** the theme's is shorter — `input:not([type=checkbox], [type=radio], [type=color], [type=range])` — so `submit`, `button` and `reset` *do* take `padding: 0.25em 0.6em` and `border: 1px solid var(--subtle)`, while a checkbox, a radio, a colour swatch and a slider take neither. `range` is the newest entry, added because writing this page is what revealed that a slider was being drawn with a 1px text-field border. The comment beside the rule is the reason it's worth knowing: adding that border changes a submit input's height, background and hover state.");

		demo(() => {
			div.c("flex v gap", () => {
				input().attr("type", "range");
				input().attr("type", "file");
				input().attr("type", "date");
			});
		}, "Types **neither** list mentions, so they get the full text treatment: `width: 100%`, `padding: 0.25em 0.6em`, `border: 1px solid var(--subtle)`. On `range` that draws a box around a slider, which is almost certainly not intended — the lists were written from the types that were on screen at the time, and these three weren't. On the design record.");

		md("`body { accent-color: var(--prim) }` is what colours the checkbox tick, the radio dot and the range thumb — one declaration, every control, no per-control rule.");

		md("## select");

		demo(() => {
			select(() => { option("one"); option("two"); option("three"); });
		}, "`appearance: none` plus a data-URI triangle at `background-size: 0.5em` and `background-origin: content-box`, because the native control can't be styled consistently across platforms. It is the **one entry still on the eviction list**, and not for being opinionated: a theme that wants its own arrow has to know to re-set `appearance` *and* clear three `background-*` longhands to get out of it. `option` has no rule at all — it's a shadow-tree item, and styling it is a fight.");

		md("## textarea");

		demo(() => {
			textarea("A textarea grows taller, never wider than its column.");
			textarea.c("auto", "textarea.auto uses field-sizing: content — type into it.");
		}, "`textarea { max-width: 100%; resize: vertical }` in the reset, and `.auto` in `@layer util` adds `field-sizing: content` so the box follows the text. Drag the corner of each: only one axis moves.");

		md("## Buttons");

		demo(() => {
			div.c("flex gap wrap v-center", () => {
				button("button");
				button.c("prim", "button.prim");
				button.c("bg", "button.bg");
				a.c("btn prim", "a.btn.prim").href("/framework/styles/elements/forms/");
			});
		}, "`.btn, button { padding: 0.25em 1em; cursor: pointer }` — `.btn` gets everything `button` does, so a link can look like a button without being one. `.prim` paints `var(--prim)` and `.bg` paints `var(--bg)`, both with a hardcoded `color: white`: the one place the base theme names a colour instead of a token, and the reason `--bg` stays dark in both light and dark mode. A white label on a light `--bg` is the bug that pins it.");

		md("## fieldset and legend");

		demo(() => {
			form(() => {
				fieldset(() => {
					legend.c("h4", "Shipping");
					p("A fieldset groups related fields; the legend names the group.");
					input().attr("placeholder", "Address");
				});
			});
		}, "`form, fieldset, legend { border: none; margin: 0; padding: 0 }` — the UA's `groove` border and its odd asymmetric padding are a 1996 look you'd never choose. `fieldset > p:first-of-type { margin-top: 0 }` clears the leading gap that survived it. `legend` has no look of its own, so `h4` gives it one.");

		md("## label");

		demo(() => {
			div.c("flex v gap", () => {
				label(input().attr("type", "checkbox"), " a label wrapping its control");
				label.c("flex v", () => {
					span.c("h4", "a label as a column");
					input().attr("placeholder", "field");
				});
			});
		}, "`label` has **no rule** — it's an inline box, so text and control sit on one line, and `flex v` is what stacks them. Wrapping the control is worth doing for its own sake: it makes the whole label a click target with no `for`/`id` pair to keep in sync.");

		md("## meter and progress");

		demo(() => {
			div.c("flex v gap", () => {
				progress().attr("value", "0.6");
				meter().attr("value", "0.6");
			});
		}, "Neither is in `framework.css`. `progress` picks up `accent-color` for free; `meter` keeps its own green/amber/red and ignores it, because a meter's colour *means* something. Both are replaced elements with a fixed UA size and a shadow tree, so styling them is a per-browser fight — if a bar has to match the design, build it from a `div`.");

		md("Next: [Media](/framework/styles/elements/media/) — `img`, `video`, `figure`, `svg`, and the two replaced elements the reset misses.");
	}
});
