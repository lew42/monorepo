import { div, span, button } from "/framework/core/View/View.js";
import { MODE, glyph } from "./glyphs.js";

/* What a seam offers when a click on it never became a drag: hug or fill, one row per
   neighbour, marked with the way it lies. It flips `mode` and nothing else — the same
   `item.set("mode", …)` the panel's own bar toggles, no second sizing channel. The two
   neighbours arrive as arguments, so this file reads nothing of grip.js or workspace.js
   and none of the three circle. `.panel-pop` is toolbar.css's block; where it opens is
   grip.css's. Record: readme.md. */

const MODES = Object.keys(MODE);

/* Built empty under whatever is capturing — the grip — and `display: none` until it opens,
   so a closed menu costs the zero-width divider no layout and hit-tests for nothing. */
export function menu(){
	return div.c("panel-pop").assign({

		/* ⚠ Filled on the way OPEN, never once: every `on` in it is a read of a neighbour's
		   `mode`, and the inspector writes that `mode` from a panel with no part of this menu. */
		open(sides){
			if (!this.hc("on")) this.empty(() => sides.forEach(side));
			this.tc("on");
		},
	});
}

/* One neighbour: the way it lies, then the modes it may have.
   ⚠ `hug` is a LEAF's word — a hugging split measures children that size themselves from
   it and collapses to 0px, taking its own grips with it. The bar and the inspector both
   withhold it from a split, and this menu was the last door in. */
function side([item, el, mark]){
	span.c("panel-grip-side", mark);

	// ⚠ The pop is a three-column grid, so a split still takes hug's CELL — drop it and the
	// next row's mark slides up into the hole.
	if (!item.leaf()) span.c("panel-grip-side");

	const offered = MODES.filter(mode => mode !== "hug" || item.leaf());

	const $btns = offered.map(mode => button.c("panel-btn", glyph(MODE[mode], mode)).attr("title", mode).click(function(){
		$btns.forEach($other => $other.rc("on"));
		this.ac("on");
		el.classList.toggle("hug", mode === "hug");
		item.set("mode", mode);
	}).ac(item.get("mode") === mode && "on"));
}
