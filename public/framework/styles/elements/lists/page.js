import { Page, md, demo, el, div, p, ul, ol, li } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Lists",
	description: "One declaration is the entire list stylesheet — and `dl` isn't in it.",
	icon: "format_list_bulleted",
	content(){

		demo(() => {
			ul(() => { li("unordered"); li("second"); li("third"); });
			ol(() => { li("ordered"); li("second"); li("third"); });
		}, "`ul, ol { padding-left: 1.2em }` is the **entire** list stylesheet. It replaces the browser's 40px indent, which is a fixed pixel value in an `em`-scaled document and so loses its proportion the moment the text resizes. Markers, marker spacing and `list-style` are all still the UA's.");

		md("## Nesting");

		demo(() => {
			ul(() => {
				li("one");
				li(() => {
					p("two, with children");
					ul(() => {
						li("nested");
						li(() => {
							p("deeper");
							ul(() => { li("deeper still"); });
						});
					});
				});
				li("three");
			});
		}, "The same `1.2em` at every level, so the indent stays proportional all the way down. The browser rotates the marker per level — disc, circle, square — and the framework doesn't touch it.");

		demo(() => {
			ol(() => { li("seven"); li("eight"); li("nine"); }).attr("start", "7");
			ol(() => { li("a"); li("b"); li("c"); }).attr("type", "a");
			ol(() => { li("third"); li("second"); li("first"); }).attr("reversed", "");
		}, "`start`, `type` and `reversed` are **attributes, not classes** — nothing in `framework.css` needs to know about them, and a class that duplicated one would be a second way to say the same thing. `li` takes `value` the same way.");

		md("## Loose lists");

		demo(() => {
			ul(() => {
				li(() => p("A list item whose content is a paragraph."));
				li(() => p("Markdown emits exactly this shape for a loose list."));
			});
		}, "`:where(.flow) :is(li, td, th) > p { margin-block: 0.35em }` in `framework.css` — a UA paragraph margin inside a list item is a gap nobody asked for. Two element selectors, so it clears the UA rule without disturbing the flow around it.");

		md("## The list the reset misses");

		demo(() => {
			el("dl", () => {
				el("dt", "dt");
				el("dd", "its definition");
				el("dt", "another");
				el("dd", "and its definition");
			});
		}, "A `dl` renders, and it still has **no factory** — `el(\"dl\", …)` builds it. It does now have a rule: writing this page is what found that `dd` kept the browser's `margin-left: 40px`, a fixed pixel indent in an `em`-scaled document, which is the exact bug `ul, ol { padding-left: 1.2em }` was written to fix. It's `dd { margin-left: 0; padding-left: 1.2em }` now, matching the other two. A definition list is still usually a two-column [table](/framework/styles/elements/table/) or a `.grid` wearing a list's clothes.");

		md("## Lists in a layout");

		demo(() => {
			div.c("flex gap", () => {
				ul(() => { li("one"); li("two"); });
				ul(() => { li("three"); li("four"); });
			});
		}, "`.flex > * { margin: 0 }` and `.grid > * { margin: 0 }` take the block margins away — a laid-out container owns its own spacing and `gap` does it. Note what *doesn't* go: the `1.2em` padding and the markers stay, because those are the list, not the spacing.");

		md("Next: [Code](/framework/styles/elements/code/) — `pre`, `code`, `kbd`, `samp`, and the two component tokens that retune the box.");
	}
});
