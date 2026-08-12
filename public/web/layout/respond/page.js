import { Page, demo, md, div, p, span } from "/app.js";

// One component, one class string, no width of its own and no query anywhere.
const release = title => div.c("pad surface flex v gap", () => {
	div.c("flex gap wrap", () => {
		div.c("basis pad wash h4", "cover").style({ "--basis": "8em", "--pad": "2.4em" });

		div.c("flex-1 flow", () => {
			p.c("h3", title);
			p("The thumb is `basis` — a fixed track. The body is `flex-1` — everything left. `wrap` is what lets the body drop under the thumb when there is nothing left to give it.");
		});
	});

	div.c("grid gap auto", () => [["512", "pages"], ["96", "plates"], ["1.4kg", "weight"]]
		.forEach(([value, label]) => div.c("pad wash flex v", () => {
			span.c("h4", value);
			span.c("muted", label);
		}).style("--pad", "0.6em")))
		.style({ "--column": "7em", "--gap": "0.5em" });
});

// The same component twice: once in a rail that is always narrow, once in
// whatever the stage has left. Nothing between them but the width.
const pair = () => div.c("flex gap wrap", () => {
	div.c("basis", () => release("In a 17em rail")).style("--basis", "17em");
	div.c("flex-1", () => release("In the rest of the box"));
});

export default new Page({
	meta: import.meta,
	group: "The page",
	icon: "aspect_ratio",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25 pad", pair)); },

	content(){
		demo.stage(pair).ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Two copies of one component, side by side, at two different widths — and one class string between them.** The left one is in a rail that is 17em forever; the right one gets whatever is left. **Drag the stage:** the right copy re-flows continuously, the stat strip loses a column, and at some point the whole row wraps and both copies become the narrow one.");

		md("There is no media query here, and there is none in the eight layouts in the reference either. A query reads the **window**; a component is never as wide as the window. The same string has to be right in a sidebar, in a preview card at `zoom-25`, and across a 3440px monitor — so the layout responds to the width of its *box*, and the break widths fall out of `--column` rather than being designed per screen.");

		md("⚠ The stage is a `div`, not a viewport. A `@media` query written inside an example reads the real browser window and will not move with the handle — which is exactly the property that makes this box a fair test.");

		md("Reference: [Layouts](/framework/styles/layouts/) — eight shapes, zero queries · [Flex](/framework/styles/layouts/flex/) — `basis`, `flex-1`, `wrap`.");
	},
});
