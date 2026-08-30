import { Page, demo, div, p, md } from "/app.js";
import { widths, tokens_plain, tokens_retuned, custom_column, index_true, bleed, default_column, seam } from "./trees.js";

// Container: colstyles/'s own column, `fill` (the demo boxes want more room
// than the 40em default leaves once Vary and Colstyles are also in the row).
// Size: seven demo.app() boxes, stacked. Own layout: `.flow` (the default)
// holding seven `.vary-colstyles-hook` blocks. Regions: one. Preview: default
// card.

export default new Page({
	meta: import.meta,
	title: "Hooks",
	description: "Every control point over how a columns tree renders, live — one demo, one caption, per hook.",
	icon: "tune",
	width: "fill",

	content(){
		md("Seven control points. Each one is a live columns tree, not a screenshot — click, drag, compare.");

		div.c("vary-colstyles-hook", () => {
			demo.app(widths()).style("height", "10em");
			p.c("vary-colstyles-hook-cap", "`width:` picks the track — `small` `hug` *(none)* `large` `fill` `full`, doc/columns.md's six words. Click through; the pane's own width is the only thing that changes.");
		});

		div.c("vary-colstyles-hook", () => {
			div.c("vary-colstyles-pair", () => {
				demo.app(tokens_plain()).style("height", "9em").style("width", "26em");
				demo.app(tokens_retuned()).style("height", "9em").style("width", "26em");
			});
			p.c("vary-colstyles-hook-cap", "The width WORDS are two tokens (`--page-column-min/max/flex`) plus the inset pair (`--page-column-pad-x/y`) — retune the number instead of asking core for a seventh word.");
		});

		div.c("vary-colstyles-hook", () => {
			demo.app(custom_column()).style("height", "9em").style("width", "16em");
			p.c("vary-colstyles-hook-cap", "`column(host)` is the whole body — override it and draw anything. Core's own version (Page.class.js) is ~15 lines; this one is five.");
		});

		div.c("vary-colstyles-hook", () => {
			demo.app(index_true()).style("height", "13em").style("width", "20em");
			p.c("vary-colstyles-hook-cap", "`index: true` — `content()` already drew the children as cards, so core leaves its own rail of rows out. Without the word they would say the same thing twice.");
		});

		div.c("vary-colstyles-hook", () => {
			demo.app(bleed()).style("height", "11em").style("width", "22em");
			p.c("vary-colstyles-hook-cap", "`bleed` spends `--page-column-pad-x/y` back — a wall or a grid reaches the column's real edge; the inset text around it does not move.");
		});

		div.c("vary-colstyles-hook", () => {
			demo.app(default_column()).style("height", "9em").style("width", "26em");
			p.c("vary-colstyles-hook-cap", "`classes: \"default\"` on a child — the host was never routed anywhere, and opens with something already showing instead of 80–93% of the row grey.");
		});

		// ⚠ 40em, and it is the ONE box on this page that may not shrink. Core takes the
		//   seam away under 32em of row (`@container page-columns (width < 32em)`, Page.css)
		//   because down there the row pages one column at a time and a drag would mean
		//   nothing. At 24em this demo shipped both grabs in the DOM and both `display:
		//   none` — the one hook of seven whose caption promises a drag was the one hook
		//   whose seam could never be shown.
		div.c("vary-colstyles-hook", () => {
			/* ⚠ `min-height`, not `height`: a demo's size is a FLOOR (ext/demo readme). At
			 *   `height: 11em` this box clipped its own "Drag the hairline to the right of
			 *   this column" mid-word — the instruction for the gesture the hook exists to
			 *   show. The other six carry ceilings too; only this one overflowed one. */
			demo.app(seam()).style("min-height", "11em").style("width", "40em");
			p.c("vary-colstyles-hook-cap", "Every seam is `column_grab()`, free on every column: drag the hairline between the two panes, double-click it to put the width back. Under 32em of row core takes the seam away — there the row pages one column at a time.");
		});
	},
});
