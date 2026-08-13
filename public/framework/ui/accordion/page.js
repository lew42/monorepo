import { Page, md, demo, div, details, summary, span, p, code } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const faq = () => {
	const QA = [
		["Is there a build step?", "No. Everything under public/ is served as-is and runs as a native ES module."],
		["How big is it?", "About 25 KB gzipped — comments included, because the readable source is the product."],
		["Can I bring my own CSS?", "Four layers decide who wins, so yours can be one declaration or a whole theme."],
	];

	return div.c("surface flex v", () => QA.forEach(([question, answer]) =>
		details.c("ui-accordion-item pad", () => {
			summary(question);
			p.c("muted", answer);
		}).attr("name", "faq")));
};

const markers = () => div.c("surface flex v", () => {
	details.c("ui-accordion-item pad", () => {
		summary("Marker — a plain summary");
		p("The UA draws the triangle and turns it on open.");
	});

	details.c("ui-accordion-item pad", () => {
		summary.c("flex v-center split", () => {
			span("No marker — this summary is a flex row");
			span.c("h4", "NEW");
		});
		p("The badge needed a flex row, and the row cost the triangle.");
	});
});

export default new Page({
	meta: import.meta,
	title: "Accordion",
	description: "One at a time, with no JS — the exclusivity is an attribute you can see.",
	icon: "expand_more",

	children: [
		demo.page("markers", markers, {
			note: "The triangle exists because `summary { display: list-item }` — measured, on both rows. Give the summary a flex class to put a badge at the far end and the marker goes with it; that is exactly how [Menu](/framework/ui/menu/) gets a clean button out of the same element. Want both, put the flex on an inner `div`." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(faq, steer).ac("bleed"),
			def: faq,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.accordion()`.** Its whole logic was a module-scope counter minting `name=\"ui-accordion-3\"` so two accordions on a page stayed independent — and the two real FAQ builders on this site hand-rolled raw `details` and chose *non*-exclusive anyway. **A visible `name=\"faq\"` beats an invisible counter**: you can read it, you can share it on purpose, and you can delete it when you want them all open at once.",
		});

		md("## The attribute is the component");

		code.js(`details.c("ui-accordion-item pad", () => {
    summary(question);
    p(answer);
}).attr("name", "faq")`);

		md("A shared `name` is what makes the browser close the others: no listener, no state, and the open panel is the DOM's own `open` attribute — so there is nothing to remove and no way for an arrow to disagree with the panel under it. Drop the `name` and the panels open independently. That is the only knob, and it is the browser's.");

		md("## The two rules that are not markup");

		md("```css\n.ui-accordion-item + .ui-accordion-item { border-top: 1px solid var(--line); }\n.ui-accordion-item > p { margin: 0.6em 0 0; }\n```");

		md("A hairline **between** items and a margin under a summary are both relationships, so `accordion.js` survives as those two lines and nothing else. The `+` is what keeps the first item from wearing a rule above it.");

		md("## What it deliberately doesn't do");

		md("**Animate.** A height transition needs `::details-content` and `interpolate-size`, which is a stylesheet of its own. **Nest.** An accordion inside an accordion is two `name` groups and reads as a filesystem — that is [Sidebar](/framework/core/Sidebar/)'s job. **Remember.** Reload and the first panel is closed again, because the state is markup and the markup is rebuilt.");

		md("Next: [Timeline](/framework/ui/timeline/) — a rail, a run of dots, and no pseudo-element.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", faq)); },
});
