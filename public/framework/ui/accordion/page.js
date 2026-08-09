import { Page, md, demo, div, details, summary, span, p, code } from "/app.js";
import { palette } from "../parts.js";
import { accordion } from "./accordion.js";

const QA = [
	["Is there a build step?", "No. Everything under public/ is served as-is and runs as a native ES module."],
	["How big is it?", "About 25 KB gzipped — comments included, because the readable source is the product."],
	["Can I bring my own CSS?", "Four layers decide who wins, so yours can be one declaration or a whole theme."],
];

export default new Page({
	meta: import.meta,
	title: "Accordion",
	description: "One at a time, with no JS — and the one reason this isn't a template.",
	icon: "expand_more",

	content(){

		palette(
			["ui.accordion(…)", () => accordion(...QA)],
			["two, and they don't interfere", () => div.c("flex v gap", () => {
				accordion(QA[0], QA[1]);
				accordion(["A second accordion", "Its own group name, so opening this closes nothing above."]);
			})],
			["a function answer", () => accordion(["Longer answer", () => {
				p("Any markup you like.");
				code.js(`p("Even a code block.")`);
			}])],
		);

		md("## Calling it");

		demo(() => {
			accordion(
				["Is there a build step?", "No."],
				["How big is it?", "About 25 KB gzipped."]);
		}, "`[question, answer]` pairs. Open one, then open another — **the first closes itself**, and nothing is listening.");

		md("## Why this one is a function");

		md("The whole component is three lines and one attribute:");

		code.js(`details.c("pad", () => {
    summary(question);
    p(answer);
}).attr("name", group)`);

		md("By the rule on the [index](/framework/ui/), that is a template. It isn't one for a single reason: **the `name` has to be unique per accordion.** A shared `name` is what makes the browser treat the group as exclusive — and it is also what makes a second accordion on the same page steal the first one's open panel, which is exactly what happens the moment someone pastes the snippet twice. `accordion()` counts, so it cannot happen.");

		md("That is the encapsulation bar in one example: not *is this markup long*, but **is there a way to get it wrong that the reader shouldn't have to know about.**");

		md("The open panel is still the DOM's own `open` attribute, so there is no state to hold, no handler to remove, and no way for an arrow to disagree with the panel under it. Drop the `name` and the panels open independently — that is the only knob, and it is the browser's.");

		md("## The marker belongs to the summary, not to you");

		demo(() => {
			div.c("ui-surface flex v", () => {
				details.c("pad", () => {
					summary("Marker — a plain summary");
					p("The UA draws the triangle and turns it on open.");
				}).style("borderBottom", "1px solid var(--line)");

				details.c("pad", () => {
					summary.c("flex v-center split", () => {
						span("No marker — this summary is a flex row");
						span.c("h4", "NEW");
					});
					p("The badge needed a flex row, and the row cost the triangle.");
				});
			});
		}, "The triangle exists because `summary { display: list-item }` — measured, on both rows. Give the summary a flex class to put a badge at the far end and the marker goes with it; that is exactly how [Menu](/framework/ui/menu/) gets a clean button out of the same element. Want both, put the flex on an inner `div`.");

		md("## What it deliberately doesn't do");

		md("**Animate.** A height transition needs `::details-content` and `interpolate-size`, which is a stylesheet of its own. **Nest.** An accordion inside an accordion is two `name` groups and reads as a filesystem — that is [Sidebar](/framework/core/Sidebar/)'s job. **Remember.** Reload and the first panel is closed again, because the state is markup and the markup is rebuilt.");

		md("Next: [Timeline](/framework/ui/timeline/) — a rail, a run of dots, and no pseudo-element.");
	},
});
