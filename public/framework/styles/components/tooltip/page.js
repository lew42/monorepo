import { Page, md, demo, code, div, span, toc } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Tooltip",
	description: "The one component that needs a stylesheet, and exactly why.",
	icon: "help_outline",

	content(){

		toc();

		demo(component, "Hover or tab to a dotted word. The third example is held open with `.shown` so it is visible in a screenshot — the bubble is `position: absolute`, so an ancestor with `overflow: hidden` clips it, and `.demo` is one.");

		md("## Where the line actually is");

		md("Eleven components got here with utility classes and token-valued inline styles. This one cannot, and the reason is sharper than *layout vs look*:\n\n| what it needs | why inline can't |\n| --- | --- |\n| `position: absolute` on the bubble | it is a rule about a **relationship** — the bubble positions against an ancestor, and an inline style can only speak about one element |\n| `:hover` / `:focus-visible` | a **state**. There is no inline syntax for one |\n\nSo the test is not *\"is this a look?\"* — it is *\"is this about one element, at one moment?\"* Everything on the far side of that needs a selector. That is the whole of what `tooltip.css` contains.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "tooltip.css"));

		md("Two details worth stealing. **`visibility` as well as `opacity`:** opacity alone leaves an invisible box on the hit-testing map, swallowing clicks through the line above. And **the reveal is one selector list** — `:hover`, `:focus-visible` and `.shown` together — so the keyboard path can never drift from the pointer path.");

		md("## And the free version");

		demo(() => {
			div(() => {
				span("Native, and it costs nothing: ");
				span("hover this").attr("title", "The UA tooltip. No CSS, no positioning, no clipping.")
					.style({ borderBottom: "1px dotted var(--subtle)", cursor: "help" });
				span(" — the `title` attribute.");
			});
		}, "`title` is a real tooltip with a real delay, real keyboard behaviour on some platforms, and zero styling. If the design doesn't insist on the bubble, this is rung 1 of the ladder — **nothing** — and the whole stylesheet above goes away.");

		md("Next: [Avatar](/framework/styles/components/avatar/) — initials in a circle, sized by a token.");
	}
});
