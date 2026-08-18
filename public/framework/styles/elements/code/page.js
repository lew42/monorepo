import { Page, md, demo, div, p, span, pre, code, kbd, samp } from "/app.js";
import { cssdoc } from "/framework/ext/CSSDoc/CSSDoc.js";

/* No stylesheet — see base/page.js. */

/* Each demo is a child page — a card in the rail, the visual table of contents.
   The fn is the whole render, so demo.source() prints exactly what ran. */

const basics = () => {
	p("Inline ", code("code"), " sits in a sentence.");
	pre("A block sits on its own.");
};

const nested = () => {
	pre(() => code("A code inside a pre."));
};

const overflow = () => {
	pre("const a_very_long_line = of_code_that_will_not_fit_inside_this_column_at_all(x, y, z);");
};

const tokens = () => {
	div.c("pad").style({ "--code-bg": "#0b3d2c", "--code-ink": "#b7f7d8" }).append(() => {
		p("Inline ", code("code"), " does not retune. The block below does.");
		pre(() => code("two values, not three selectors"));
	});
};

const codeClass = () => {
	p("A ", span.c("code", "span.code"), " borrows the mono face and nothing else.");
	p("A real ", code("code"), " element also brings the padding and the background.");
};

const kbdSamp = () => {
	p("Press ", kbd("Ctrl"), " + ", kbd("C"), " and the program prints ", samp("done"), ".");
	p("Beside a real ", code("code"), " element, for comparison.");
};

export default new Page({
	meta: import.meta,
	title: "Code",
	description: "A block and an inline are two boxes — and one padding was never going to fit both.",
	icon: "code",

	children: [
		demo.page("basics", basics, { note: "`pre` gets `padding: 0.75em 1em`; the inline gets a fraction of that, generated on [the intro](/framework/styles/elements/code/) rather than typed here. One shared padding was never going to fit a block and an inline, and it didn't: `md.css`, `demo.css` and `highlight.css` each independently overrode `pre` to something roomier — 0.75em, 0.9em, 0.75em. **Four files with an opinion about one box is a bug report about the box**, so the block got block padding here and the three copies are gone." }),

		demo.page("nested", nested, { note: "The block is already a padded box, so the inline resets inside it — and **the reset has to cover every declaration the inline look is made of.** It didn't: the hairline stayed, and read as a white rectangle on every dark `pre` until 2026-08-18. Which declarations the reset actually covers is generated on [the intro](/framework/styles/elements/code/); this note used to quote two of the three. This is the shape markdown emits for a fenced block, and the shape `code.fn()` builds, so it is by far the common case." }),

		demo.page("overflow", overflow, { note: "Scroll it sideways. `overflow-x: auto` has one side effect worth knowing: it gives a `<pre>` a min-content width of almost nothing, which is why `Page.css` has to hand `.pages > .default` an explicit `flex: 1 1 auto` — a page made mostly of code otherwise collapsed to a few hundred pixels." }),

		demo.page("tokens", tokens, { note: "`--code-bg` and `--code-ink` are the **block's** two knobs: a site or theme that wants dark code blocks sets two values instead of fighting three selectors, and they cascade, so setting them on any box retunes every block inside it.\n\n⚠ The inline chip deliberately does **not** read them — it is a `--wash`, the same tint a `th` takes, so it stays legible mid-sentence on a page whose blocks went dark. The demo above shows exactly that, and said the opposite in words until the generated table on [the intro](/framework/styles/elements/code/) was measured against it.\n\nThe token exists because the fight happened first. A bare `code { background }` in `/styles.css` lost the block case to `pre > code`, leaving `color: white` stranded on a light box. **The framework was missing a token — that's the fix, not a stronger selector downstream.** [`theme`](/framework/styles/layers/theme/) has the values `theme-lew42` sets; the full argument is §13 of the [styles record](/framework/styles/)." }),

		demo.page("class", codeClass, { note: "`.code` is in the font-family rule and in **neither** the padding nor the background rule — so it's the typeface alone. That's what makes it the sixth level of the type scale rather than a fake `<code>`: use it for a name or a value inside a heading, where a real box would be too much. The rules themselves are generated on [the intro](/framework/styles/elements/code/)." }),

		demo.page("kbd-samp", kbdSamp, { note: "**Both share the mono face now** — the two-word change this note used to ask for was made, and the note went on claiming the opposite. (That is the whole argument for generating the rules: see [the intro](/framework/styles/elements/code/).) They are still in neither the padding nor the background rule, so they carry the typeface and no box, and sit visibly differently from a `code` in the same sentence. On the design record as an open question, because \"looks like code\" and \"is code\" are not the same claim." }),
	],

	initialize(){ this.catalog(); },

	content(){

		// Read out of the live CSSOM. Nothing about `code` is quoted by hand here any
		// more: five of the quotes that used to be were wrong, one of them a shipped
		// bug and one a demo contradicting its own render. ext/CSSDoc/readme.md.
		cssdoc("code");

		md("That table is `code` alone. The block carries one rule of its own that no table here shows — it scrolls sideways instead of wrapping, because **wrapped code is wrong code, and a scrollbar is honest.**");

		md("## Highlighting is an ext");

		md("None of this knows about syntax colours. Importing [`ext/highlight`](/framework/ext/highlight/) enhances the `code` factory in place — `code.js()`, `code.fn()`, `code.lang()`, `code.file()` — and highlights every markdown fence on the site synchronously, so there's no flash of plain code. This site imports it once in `app.js`, which is why every block on this page is coloured.\n\nThe one you want is `code.fn(() => { … })`: a code example written as a **function** is live code your editor checks, and the page shows exactly what was checked. A string is dead text.");

		md("Next: [Table](/framework/styles/elements/table/) — four declarations, and the one thing nothing gives a table.");
	}
});
