import { div, span } from "../View/View.js";
import pane from "../../ext/demo/pane.js";
import { STRIP, by_name } from "./layouts.js";
import { arrange, FIXTURES } from "./fixtures.js";

/* ── THE RESPONSIVENESS STRIP (deliverable 16) ────────────────────────────────

   Seven panes at 400 · 700 · 1000 · 1400 · 2000 · 2800 · 3440, beside the
   drag-handle viewport, so how a layout responds is SEEN rather than claimed.
   Each pane is labelled with its width and with whether that width is inside the
   layout's proven range.

   A pane BELOW the floor draws the layout's `fallback` instead, and says so —
   below its floor a layout stacks to a named 1-column layout, and the fallback is
   the thing being judged there (the mastermind's call, 2026-09-06).

   ⚠ A PANE IS `zoom`, NOT A VIEWPORT. `ext/demo/pane.js` lays a box out at a fixed
     width and paints it down to fit the room it is given, so a `@media` query
     inside a layout answers the REAL window and not the pane. That is honest for
     this catalogue — every one of the thirty is clamps and intrinsic tracks, not
     breakpoints — and it is why APPROVAL is measured by rules.js at a real
     viewport width and never read off the strip. Say it on the page, or the strip
     gets read as proof it is not.                                               */

export function strip(layout, fixture = FIXTURES[4]){
	return div.c("page-layout-strip grid auto gap", () => STRIP.forEach(width => {
		const below = width < layout.widths[0];
		const shown = below ? (by_name(layout.fallback) ?? layout) : layout;

		div.c("page-layout-pane").ac(below && "page-layout-pane-below").append(() => {
			div.c("page-layout-pane-head", () => {
				span.c("page-layout-value", width + "px");
				span.c("muted", below ? "below the floor — " + shown.title : "proven");
			});

			pane({ width, height: Math.max(320, Math.round(width * 0.5)) }, () => arrange(shown, fixture));
		});
	})).style("--column", "11em");
}

export default strip;
