import { Page, md, demo, code, h2, div, p, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page flow",
	description: "Vertical rhythm: who owns the space between two blocks.",
	icon: "format_line_spacing",

	content(){

		toc();

		md("**Spacing belongs to the container, not to the things in it.** A `.page` is a *flow*, and a flow gives its children the gaps. Write a component with no margins at all and it will sit correctly on any page that holds it.");

		code.css(`:where(.flow, .page, blockquote) { --flow: 2em; }
:where(.flow, .page, blockquote) > * + * {
    margin-block-start: var(--flow);
}`);

		md("That is the whole system — **one token**. Two more rules tune it (the small headings take `--flow × 1.5`, and so does the gap under a page title), and every selector is wrapped in `:where()`, so it has **specificity zero** and any component that genuinely needs its own spacing wins by being an ordinary class.");

		md("Anything else becomes a flow by **emitting the class**: `md()` renders multi-block markdown as `div.md.flow`, and `demo()`'s render box is `.demo-render.flow` — their own files say so, which is what lets the selector above stop naming classes it doesn't own.");

		h2("Why `em`, and why it doesn't compound");

		md("`--flow` is **registered** (`@property`, top of `Page.css`) as a length that inherits. A registered length computes against the element it is *declared* on — the flow container — and inherits as an absolute value. Two consequences, and they are the design:\n\n- **An area that changes its font-size retunes its own rhythm.** A `0.8em` aside gets gaps that are 80% of the page's, with nothing declared.\n- **A heading cannot compound.** The margin lands on the heading, but the length was fixed at the container — so an `h2` at 2.25em gets the same 32px gap as the paragraph beside it. The unregistered version of this token measured **72px** above every `h2` (2em resolved against the heading's own 36px), which is the bug that made the first em conversion look impossible.");

		demo(() => {
			div.c("flow", () => {
				p("An ordinary block at the page's size.");
				p("Another — this gap is `--flow`.");
			});
			div.c("flow", () => {
				p("The same flow at `font-size: 0.8em` —");
				p("— and its rhythm tightened with it. Nothing was declared.");
			}).style("font-size", "0.8em");
		}, "Two identical flows; the second sets only `font-size`. The gap scales because `--flow` is em *of the container* — that is the one thing the old rem tokens could not do.");

		h2("Retuning");

		md("`--rhythm` is the knob: a bare em value, unregistered, so it inherits as a token and re-resolves inside every flow it reaches.");

		code.css(`.app { --rhythm: 1.6em; }       /* a denser site, one declaration */`);

		md("Never retune by writing a margin — a margin on a component is `(0,1,0)` against the flow's `(0,0,0)`, so **the component always wins**, silently, and only on pages that happen to hold one. `demo.css` had `margin: 1.75em 0` and gave every demo box a rhythm nothing else on the site had; it was deleted rather than matched.");

		h2("Authoring a component");

		md("Three rules, and the first one is most of it.");

		md("**1. A component has no outer margin.** If it needs air around it, the flow it sits in provides that — and if it is dropped into a `flex gap` row instead, the row does. A component that brings its own margin has decided something about a page it has never seen.");

		md("**2. A component that arranges its own children owns their spacing.** The moment you write `display: flex` or `display: grid`, use `gap`. The flow rules only reach *direct children of a flow*, so a grid inside a page is on its own — and `.flex > *` and `.grid > *` in the utility layer zero the inherited margins for exactly this reason.");

		code.js(`div.c("flex v gap", () => { … })     // gap, not margins`);

		md("**3. `--flow` is page rhythm, not component rhythm.** Inside a box, use `gap` (which reads `--gap`); between boxes, let the page decide. Page rhythm inside a card once put an eyebrow 32px from its own title — that is why the two tokens are two tokens.");

		h2("First and last child");

		md("A flow's first child never takes a top margin and its last never takes a bottom one — `:first-child { margin-top: 0 }` and its twin live in the **utility layer**, globally, so a box's outer gap collapses into its own padding with nothing declared per component.");

		md("Next: [Fit](/framework/styles/layouts/fit/) — what the page *around* this rhythm can be.");
	}
});
