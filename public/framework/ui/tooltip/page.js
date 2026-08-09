import { Page, md, demo, div, p, span, code } from "/app.js";
import { palette } from "../parts.js";
import { tooltip } from "./tooltip.js";

const TIP = "append_fn() restores the captor the instant your function returns.";

export default new Page({
	meta: import.meta,
	title: "Tooltip",
	description: "The component that genuinely needs a selector, and exactly why.",
	icon: "help_outline",

	content(){

		palette(
			["hover it", () => p(() => {
				span("Capturing is ");
				tooltip("synchronous", TIP);
				span(".");
			})],
			["tab to it", () => p(() => {
				span("Also ");
				tooltip("keyboard", "Revealed by :focus-visible as well as :hover — one selector list.");
				span(".");
			})],
			["held open by .shown", () => p(() => tooltip("shown", "Held open by .shown.").ac("shown"))],
		);

		md("## Calling it");

		demo(() => {
			p(() => {
				span("Capturing is ");
				tooltip("synchronous", "append_fn() restores the captor when your function returns.");
				span(", so a factory call after an await lands somewhere else.");
			});
		}, "A word and a bubble. The span carries `tabindex=\"0\"`, which is what makes the keyboard path possible at all.");

		md("## Where the line actually is");

		md("Almost every component in this library got here with utility classes and token values. This one cannot, and the reason is sharper than *layout vs look*:");

		md("| what it needs | why a class list can't |\n| --- | --- |\n| `position: absolute` on the bubble | it is a rule about a **relationship** — the bubble resolves against a positioned ancestor, and an inline style can only speak about the element it is on |\n| `:hover` / `:focus-visible` | a **state**. There is no inline syntax for one |");

		md("So the test is not *\"is this a look?\"* — it is *\"is this about one element, at one moment?\"* Everything on the far side of that needs a selector. [Menu](/framework/ui/menu/) is the only other component that fails it.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "tooltip.js"));

		md("Two details worth stealing. **`visibility` as well as `opacity`:** opacity alone leaves an invisible box on the hit-testing map, swallowing clicks aimed at the line above. And **the reveal is one selector list** — `:hover`, `:focus-visible` and `.shown` together — so the keyboard path can never drift from the pointer path, and `.shown` makes the component screenshot-testable.");

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
});
