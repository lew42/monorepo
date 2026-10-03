import { Page, div } from "/app.js";

/* Rung 0 of the framework-literacy ladder (public/framework/ai/2026-10-02/model-weights/
 * requirements.md, "The framework-literacy ladder"): can a model turn plain HTML into THIS site's
 * View helpers, with no page, no children, no class to get right — just one tree of tags?
 * The model's job: read fixture/source.html (or prompt.md, which has the same text) and rebuild
 * that exact tree, with View helpers, inside the div.c("rung0-output") call below. Never replace
 * the whole file — only fill in the empty callback.
 *
 * The mechanical check (library.mjs's checksTreeMatch) loads this page, reads the
 * ".rung0-output" element, and walks it node by node against source.html — same tags, same
 * classes (order doesn't matter), same attributes, same text, same nesting. A plain pass/fail
 * plus a diff, by code — no judge, no opinion (requirements.md: "Machine check, no opinion"). */
export default new Page({
	meta: import.meta,
	title: "Rung 0 — HTML to View helpers",
	description: "Translate fixture/source.html into View helpers, inside the .rung0-output box below.",

	content(){
		div.c("rung0-output", () => {
			// Build source.html's tree here, with View helpers (div, p, h1-h6, span, a, ul, li, ...).
			// Example shape: div.c("some-class", () => { p("text"); }).attr("data-x", "1");
		});
	}
});
