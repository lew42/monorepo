import { Page, md, demo, div, p, a, span, form, label, input, textarea, select, option,
	button, fieldset, legend, meter, progress } from "/app.js";
import { css } from "/framework/ui/parts.js";

/* The one stylesheet-ish thing here is LOCAL: a candidate slider skin, kept on
   this page until a winner graduates. The site default lives in the lew42 theme. */
css(`@layer site {
	.range-soft::-webkit-slider-runnable-track { height: 0.6em; background: var(--wash); border: 1px solid var(--line); border-radius: 999px; }
	.range-soft::-webkit-slider-thumb { width: 1.2em; height: 1.2em; margin-top: -0.35em; background: var(--prim); border: 2px solid var(--surface); border-radius: 50%; box-shadow: none; }
	.range-soft::-moz-range-track { height: 0.6em; background: var(--wash); border: 1px solid var(--line); border-radius: 999px; }
	.range-soft::-moz-range-thumb { width: 1.2em; height: 1.2em; background: var(--prim); border: 2px solid var(--surface); border-radius: 50%; box-shadow: none; }
}`);

/* Each demo is a child page — a card in the rail, the visual table of contents.
   The fn is the whole render, so demo.source() prints exactly what ran. */

const hero = () => {
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
};

const types = () => {
	div.c("flex gap wrap v-center", () => {
		label(input().attr("type", "checkbox"), " checkbox");
		label(input().attr("type", "radio").attr("name", "r"), " radio");
		label(input().attr("type", "radio").attr("name", "r"), " radio");
		input().attr("type", "color").attr("value", "#ff8f60");
		input().attr("type", "submit").attr("value", "submit");
		input().attr("type", "button").attr("value", "button");
		input().attr("type", "reset").attr("value", "reset");
	});
};

const ranges = () => {
	div.c("flex v gap", () => {
		label.c("flex v", () => {
			span.c("h4", "the theme's — surface thumb on a hairline");
			input().attr("type", "range");
		});
		label.c("flex v", () => {
			span.c("h4", "range-soft — a candidate");
			input.c("range-soft").attr("type", "range");
		});
	});
};

const unlisted = () => {
	div.c("flex v gap", () => {
		input().attr("type", "file");
		input().attr("type", "date");
	});
};

const selects = () => {
	select(() => { option("one"); option("two"); option("three"); });
};

const textareas = () => {
	div.c("flex v gap", () => {
		textarea("A textarea grows taller, never wider than its column.");
		textarea.c("auto", "textarea.auto uses field-sizing: content — type into it.");
	});
};

const buttons = () => {
	div.c("flex gap wrap v-center", () => {
		button("button");
		button.c("prim", "button.prim");
		button.c("bg", "button.bg");
		a.c("btn prim", "a.btn.prim").href("/framework/styles/elements/forms/");
	});
};

const fieldsets = () => {
	form(() => {
		fieldset(() => {
			legend.c("h4", "Shipping");
			p("A fieldset groups related fields; the legend names the group.");
			input().attr("placeholder", "Address");
		});
	});
};

const labels = () => {
	div.c("flex v gap", () => {
		label(input().attr("type", "checkbox"), " a label wrapping its control");
		label.c("flex v", () => {
			span.c("h4", "a label as a column");
			input().attr("placeholder", "field");
		});
	});
};

const meters = () => {
	div.c("flex v gap", () => {
		progress().attr("value", "0.6");
		meter().attr("value", "0.6");
	});
};

export default new Page({
	meta: import.meta,
	title: "Forms",
	description: "Controls, and the two `:not()` lists that deliberately disagree about what a button is.",
	icon: "check_box",

	children: [
		demo.page("form", hero, { icon: "list_alt",
			note: "A real form, **no stylesheet**. `flex v gap` stacks it, `h4` labels the fields, `.prim` marks the primary action, `.auto` makes the textarea follow its content — four utility classes, and the base theme does the rest." }),

		demo.page("types", types, { icon: "check_box",
			note: "The six types held back from `width: 100%`. **And the two `:not()` lists deliberately differ:** the theme's is shorter — so `submit`, `button` and `reset` *do* take `padding: 0.25em 0.6em` and `border: 1px solid var(--subtle)`, while a checkbox, a radio, a colour swatch and a slider take neither. The comment beside the rule is the reason it's worth knowing: adding that border changes a submit input's height, background and hover state." }),

		demo.page("range", ranges, { icon: "tune",
			note: "**Native `input[type=range]`, restyled — never hand-rolled.** Kits split here: Radix and MUI build sliders from divs and pointer math, buying multi-thumb and tooltips at the price of re-implemented keyboard and ARIA; Bootstrap and Shoelace restyle the native control and get all of that free. Same reasoning as [Dialog](/framework/ui/dialog/). `appearance: none` forfeits the UA's parts, so **both** vendor pseudo sets restate every one — and the two cannot share a selector, because a browser drops the whole rule on the pseudo it doesn't know. The default skin is the [lew42 theme's](/framework/styles/layers/theme/lew42/); `.range-soft` is a candidate local to this page — pick one. The hand-roll threshold, when it comes: a second thumb, or a filled lower track (which needs JS writing a `--value` token)." }),

		demo.page("unlisted", unlisted, { icon: "event",
			note: "Types in **neither** `:not()` list, so they get the full text treatment: `width: 100%`, padding, a 1px border. `range` was this demo's third member until the border it drew around a slider got it added to the theme's list; these two await the same judgement. On the design record." }),

		demo.page("select", selects, { icon: "expand_more",
			note: "`appearance: none` plus a data-URI triangle at `background-size: 0.5em` and `background-origin: content-box`, because the native control can't be styled consistently across platforms. It is the **one entry still on the eviction list**: a theme that wants its own arrow has to know to re-set `appearance` *and* clear three `background-*` longhands. `option` has no rule at all — it's a shadow-tree item, and styling it is a fight." }),

		demo.page("textarea", textareas, { icon: "notes",
			note: "`textarea { max-width: 100%; resize: vertical }` in the reset, and `.auto` in `@layer util` adds `field-sizing: content` so the box follows the text. Drag the corner of each: only one axis moves." }),

		demo.page("buttons", buttons, { icon: "smart_button",
			note: "`.btn, button { padding: 0.25em 1em; cursor: pointer }` — `.btn` gets everything `button` does, so a link can look like a button without being one. `.prim` paints `var(--prim)` and `.bg` paints `var(--bg)`, both with a hardcoded `color: white`: the one place the base theme names a colour instead of a token, and the reason `--bg` stays dark in both modes." }),

		demo.page("fieldset", fieldsets, { icon: "fence",
			note: "`form, fieldset, legend { border: none; margin: 0; padding: 0 }` — the UA's `groove` border and its odd asymmetric padding are a 1996 look you'd never choose. `fieldset > p:first-of-type { margin-top: 0 }` clears the leading gap that survived it. `legend` has no look of its own, so `h4` gives it one." }),

		demo.page("label", labels, { icon: "label",
			note: "`label` has **no rule** — it's an inline box, so text and control sit on one line, and `flex v` is what stacks them. Wrapping the control is worth doing for its own sake: it makes the whole label a click target with no `for`/`id` pair to keep in sync." }),

		demo.page("meter", meters, { icon: "speed",
			note: "Neither is in `framework.css`. `progress` picks up `accent-color` for free; `meter` keeps its own green/amber/red and ignores it, because a meter's colour *means* something. Both are replaced elements with a fixed UA size and a shadow tree — if a bar has to match the design, build it from a `div`." }),
	],

	// The rail is the ten demos above, and this page's own prose is its first card.
	initialize(){ this.catalog(); },

	content(){

		md("Every control is a **page of its own**: the rail is the table of contents, each card the demo itself, live. The source rides open beside every one.");

		md("## The reset");

		md("`input, button, textarea, select { font: inherit }` is the one that matters most, and it's the least visible: form controls opt out of the document font **by default, in every browser**. `font` and not `font-family`, so size, weight and line-height come along too.\n\nThen `input:not([type=\"checkbox\"], [type=\"radio\"], [type=\"submit\"], [type=\"color\"], [type=\"button\"], [type=\"reset\"]), select, textarea { width: 100% }` — text-ish controls fill their container instead of defaulting to a mysterious 20-character `size`. The `:not()` list is every type where that would be absurd. Both are demoed against the browser default in [base](/framework/styles/layers/base/).");

		md("`body { accent-color: var(--prim) }` is what colours the checkbox tick, the radio dot and a native range thumb — one declaration, every control, no per-control rule.");

		md("Next: [Media](/framework/styles/elements/media/) — `img`, `video`, `figure`, `svg`, and the two replaced elements the reset misses.");
	}
});
