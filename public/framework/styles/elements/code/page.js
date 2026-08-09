import { Page, md, demo, div, p, span, pre, code, kbd, samp, toc } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Code",
	description: "A block and an inline are two boxes — and one padding was never going to fit both.",
	icon: "code",
	content(){

		toc();

		demo(() => {
			p("Inline ", code("code"), " sits in a sentence.");
			pre("A block sits on its own.");
		}, "`pre` gets `padding: 0.75em 1em`; `code` gets `0.15em 0.4em`. One shared padding was never going to fit a block and an inline, and it didn't: `md.css`, `demo.css` and `highlight.css` each independently overrode `pre` to something roomier — 0.75em, 0.9em, 0.75em. **Four files with an opinion about one box is a bug report about the box**, so the block got block padding here and the three copies are gone.");

		demo(() => {
			pre(() => code("A code inside a pre."));
		}, "`pre > code { padding: 0; background: none }` — the block is already a padded box, so the inline resets inside it. This is the shape markdown emits for a fenced block, and the shape `code.fn()` builds, so it is by far the common case.");

		md("Both boxes share `pre, code { background: var(--code-bg, var(--wash)); color: var(--code-ink, inherit) }` and `pre, code, .code { font-family: var(--mono) }`, where `--mono` is `Consolas, 'Courier New', Monaco, monospace`. The reset adds `pre { overflow-x: auto }`: **wrapped code is wrong code, and a scrollbar is honest.**");

		demo(() => {
			pre("const a_very_long_line = of_code_that_will_not_fit_inside_this_column_at_all(x, y, z);");
		}, "Scroll it sideways. `overflow-x: auto` has one side effect worth knowing: it gives a `<pre>` a min-content width of almost nothing, which is why `Page.css` has to hand `.pages > .default` an explicit `flex: 1 1 auto` — a page made mostly of code otherwise collapsed to a few hundred pixels.");

		md("## The two component tokens");

		demo(() => {
			div.c("pad").style({ "--code-bg": "#0b3d2c", "--code-ink": "#b7f7d8" }).append(() => {
				p("Inline ", code("code"), " and the block below both retune.");
				pre(() => code("two values, not three selectors"));
			});
		}, "`--code-bg` and `--code-ink` fall back to `var(--wash)` and `inherit`, so nobody has to set them — and a site or theme that wants dark code blocks sets **two values** instead of fighting three selectors. They cascade, so setting them on any box retunes everything inside it.");

		md("The token exists because the fight happened first. A bare `code { background }` in `/styles.css` lost the block case to `pre > code`, leaving `color: white` stranded on a light box. **The framework was missing a token — that's the fix, not a stronger selector downstream.** [`theme`](/framework/styles/layers/theme/) has the values `theme-lew42` sets; the full argument is §13 of the [styles record](/framework/styles/).");

		md("## The .code class — the sixth level");

		demo(() => {
			p("A ", span.c("code", "span.code"), " borrows the mono face and nothing else.");
			p("A real ", code("code"), " element also brings the padding and the background.");
		}, "`.code` is in `pre, code, .code { font-family: var(--mono) }` and in **neither** of the padding or background rules — so it's the typeface alone. That's what makes it the sixth level of the type scale rather than a fake `<code>`: use it for a name or a value inside a heading, where a real box would be too much.");

		md("## kbd and samp");

		demo(() => {
			p("Press ", kbd("Ctrl"), " + ", kbd("C"), " and the program prints ", samp("done"), ".");
			p("Beside a real ", code("code"), " element, for comparison.");
		}, "**Neither is in `framework.css`.** They get the browser's generic `monospace` and no padding and no background, so they sit visibly differently from a `code` in the same sentence — a different typeface at a different apparent size. The rule they're missing from is `pre, code, .code { font-family: var(--mono) }`, and adding them is a two-word change. On the design record as an open question, because \"looks like code\" and \"is code\" are not the same claim.");

		md("## Highlighting is an ext");

		md("Nothing above knows about syntax colours. Importing [`ext/highlight`](/framework/ext/highlight/) enhances the `code` factory in place — `code.js()`, `code.fn()`, `code.lang()`, `code.file()` — and highlights every markdown fence on the site synchronously, so there's no flash of plain code. This site imports it once in `app.js`, which is why every block on this page is coloured.\n\nThe one you want is `code.fn(() => { … })`: a code example written as a **function** is live code your editor checks, and the page shows exactly what was checked. A string is dead text.");

		md("Next: [Table](/framework/styles/elements/table/) — four declarations, and the one thing nothing gives a table.");
	}
});
