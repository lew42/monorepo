import { Page, md, demo, div, p, span, code } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const tooltip = () => p(() => {
	span("Capturing is ");

	span.c("ui-tooltip", () => {
		span.c("ui-tooltip-word", "synchronous");
		span.c("ui-tooltip-bubble", "append_fn() restores the captor the instant your function returns.");
	}).attr("tabindex", "0");

	span(", so a factory call after an await lands somewhere else.");
});

const shown = () => p(() => span.c("ui-tooltip shown", () => {
	span.c("ui-tooltip-word", "held open");
	span.c("ui-tooltip-bubble", "In the reveal list with :hover and :focus-visible, so this is screenshot-testable.");
}));

export default new Page({
	meta: import.meta,
	title: "Tooltip",
	description: "Three spans and a stylesheet — the CSS is the whole component.",
	icon: "help_outline",

	content(){

		palette(
			["hover it, or tab to it", tooltip],
			["held open by `.shown`", shown],
		);

		md("## Copy it");

		copy(tooltip);

		md("**There is no `ui.tooltip()`** — it was two spans inside a span, and every interesting thing about a tooltip is in the stylesheet the markup can't reach. `tabindex=\"0\"` is what makes the keyboard path possible at all, and it is visible here rather than buried.");

		md("## Where the line actually is");

		md("Almost every component in this library gets by with utility classes and token values. This one cannot, and the reason is sharper than *layout vs look*:");

		md("| what it needs | why a class list can't |\n| --- | --- |\n| `position: absolute` on the bubble | it is a rule about a **relationship** — the bubble resolves against a positioned ancestor, and an inline style can only speak about the element it is on |\n| `:hover` / `:focus-visible` | a **state**. There is no inline syntax for one |");

		md("So the test is not *\"is this a look?\"* — it is *\"is this about one element, at one moment?\"* Everything on the far side of that needs a selector. **A selector, note — not a function.** [Menu](/framework/ui/menu/) is the other one that fails it, and it demoted for the same reason.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "tooltip.js"));

		md("Two details worth stealing. **`visibility` as well as `opacity`:** opacity alone leaves an invisible box on the hit-testing map, swallowing clicks aimed at the line above. And **the reveal is one selector list** — `:hover`, `:focus-visible` and `.shown` together — so the keyboard path can never drift from the pointer path.");

		md("The bubble is `var(--ink)` on `var(--surface)` ink, inverted. It said `color: white` over `var(--bg)` until the review: readable, but a **literal colour**, which is the one thing a component may not name — and in dark mode the bubble sat two shades off the page behind it.");

		md("⚠ The bubble is out of flow, so an ancestor with `overflow: hidden` **clips** it. `.demo` is one, which is why the examples on this page sit away from the box edge.");

		md("## And the free version");

		demo(() => {
			p(() => {
				span("Native, and it costs nothing: ");
				span("hover this").attr("title", "The UA tooltip. No CSS, no positioning, no clipping.")
					.style({ borderBottom: "1px dotted var(--subtle)", cursor: "help" });
				span(" — the `title` attribute.");
			});
		}, "`title` is a real tooltip with a real delay and no styling at all. If the design doesn't insist on the bubble, this is rung 1 of the [ladder](/framework/styles/) — **nothing** — and the whole stylesheet above goes away.");

		md("Next: [Avatar](/framework/ui/avatar/) — initials in a circle, sized by a token.");
	},

	// ⚠ Never `.shown` here: the bubble is out of flow and the thumb crops, so a
	// held-open one renders as a sliver. A card shows the tooltip at rest.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", tooltip)); },
});
