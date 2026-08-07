import { View, div, span, code } from "/app.js";

/* The one stylesheet in this section, loaded by the module that emits the classes
 * it styles. A hover state and an out-of-flow bubble cannot be written inline —
 * see readme.md §4. */
View.stylesheet(import.meta, "tooltip.css");

const tip = (text, bubble) => span.c("tooltip", () => {
	span(text).style({ borderBottom: "1px dotted var(--subtle)", cursor: "help" });
	span.c("tooltip-bubble", bubble);
}).attr("tabindex", "0");

export default () => div.c("flex v gap", () => {
	div(() => {
		span("Capturing is ");
		tip("synchronous", "append_fn() restores the captor the instant your function returns.");
		span(", so a factory call after an ");
		code("await");
		span(" lands somewhere else.");
	});

	div(() => {
		span("It answers to the keyboard too — ");
		tip("tab to this one", "Revealed by :focus-visible as well as :hover. One selector list, both ways in.");
		span(".");
	});

	div(() => {
		span("And held open by a class, so a screenshot can see it: ");
		tip("shown", "Held open by .shown.").ac("shown");
	});
});
