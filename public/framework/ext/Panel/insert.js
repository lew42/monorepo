import View, { div, icon } from "/framework/core/View/View.js";
import Panel from "./Panel.js";

/* A "+" that rides the pointer along a split's gaps and drops a new panel where it snaps.
   One overlay per split, absolutely positioned over `$items` so offering it never nudges
   the layout it is offering to change. Same shape as split.js, aimed at a gap instead of
   an edge. Record: readme.md. */
View.stylesheet(import.meta, "insert.css");

export const INSERT = { on: true };

/* `item` is the SPLIT; `$items` is its `.panel-items` box. The axis is read from `item`,
   never guessed from the DOM — `dir === "row"` means the children are columns, so the bar
   stands tall and narrow; `dir === "col"` means rows, so it lies wide and short. */
export function insert_bar(item, $items){
	if (!INSERT.on) return;

	let ref = null;
	const $bar = div.c("panel-insert", () => icon("add")).attr("title", "Click to insert a panel here");

	const locate = e => {
		const row = item.get("dir") !== "col";
		const at = row ? e.clientX : e.clientY;
		const box = $items.el.getBoundingClientRect();
		const els = [...$items.el.children].filter(el => el.classList.contains("panel"));
		const side = (el, near) => {
			const r = el.getBoundingClientRect();
			return row ? r[near ? "left" : "right"] : r[near ? "top" : "bottom"];
		};

		/* INTERIOR gaps only — between each pair, never before the first or after the last
		   (Mike, 2026-08-16). Those two are the panel's own edges, and an edge already means
		   something better: clicking it opens the split preview, which is one gesture for the
		   same result. A `+` sitting there hid the gesture instead of adding to it. */
		let best;
		for (let i = 1; i < els.length; i++){
			const mid = (side(els[i - 1], false) + side(els[i], true)) / 2;
			if (!best || Math.abs(mid - at) < Math.abs(best.mid - at)) best = { i, mid };
		}

		return best && { ref: item.items.children[best.i] ?? null, at: best.mid - (row ? box.left : box.top) };
	};

	/* ⚠ NOT `coalesce()`. That one is a DRAG throttle — it unbinds itself on the first
	   pointerup, so a single click anywhere in the split retired this bar's tracking for
	   good. Hover tracking outlives clicks, so it gets its own frame throttle: a 240Hz mouse
	   otherwise re-measures every child of the split four times a paint. */
	let last, frame;
	$items.el.addEventListener("pointermove", e => {
		last = e;
		frame ??= requestAnimationFrame(() => {
			frame = null;
			const hit = locate(last);

			// A split of one has no interior gap, so there is nothing to offer.
			$bar[hit ? "ac" : "rc"]("on");
			if (!hit) return;

			ref = hit.ref;
			$bar.style("--insert-at", hit.at + "px");
		});
	});

	return $bar.click(() => new Panel().move(item, ref));
}
