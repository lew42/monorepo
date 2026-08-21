import View, { div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "grip.css");

const html = document.documentElement;

/* The resize edge for a rail docked at the screen's inline end — a strip just inside
 * the rail's inline-start edge. There is no permanent handle: the pill exists only
 * while your pointer is near that edge, and it rides the pointer's Y, so the control
 * is always already under your hand and the rail is otherwise a clean line.
 *
 * Mount it inside the rail's box (`dev/DevBar`, `ext/drawer` both do) and give it two
 * functions: `write(px)` on every move — px is the width the pointer implies, and what
 * that means is yours — and `done(width)` once, on release, to remember it. Return the
 * width you actually applied from `write` and that is what `done` is handed.
 *
 * ⚠ No rAF throttle, unlike ext/demo's `drag()`: `pointermove` is already delivered
 * once per frame, and this sets one custom property rather than re-laying-out a
 * live render. Not worth importing the demo system for. */
export default function grip({ write, done, from = "end" }){
	let width, edge;

	return div.c("grip", () => span.c("grip-pill"))
		.attr("title", "Drag to resize")

		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);
			// The rail's OTHER edge is pinned, so one read holds for the whole drag —
			// and reading it, rather than `innerWidth`, is what lets a rail parked
			// beside another one (ext/drawer, offset by `--devbar`) size to the pointer
			// instead of past it.
			const rect = this.el.parentElement.getBoundingClientRect();
			edge = from === "start" ? rect.left : rect.right;
			html.classList.add("grip-sizing");
		})

		// ⚠ One handler for both jobs, because capture routes the whole drag back
		// here: the pill tracks the pointer whether or not a button is down.
		.on("pointermove", function(e){
			this.style("--grip-y", e.clientY + "px");
			if (!html.classList.contains("grip-sizing")) return;
			const px = from === "start" ? e.clientX - edge : edge - e.clientX;
			width = write(px) ?? px;
		})

		// Written once, at the end: `write()` moves the rail every frame, and only the
		// width you let go of is worth remembering.
		.on("pointerup", function(e){
			this.el.releasePointerCapture(e.pointerId);
			html.classList.remove("grip-sizing");
			if (width) done(width);
		});
}

export { grip };
