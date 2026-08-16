import View, { div, span } from "../../core/View/View.js";
import { rail, set } from "./settings.js";

View.stylesheet(import.meta, "grip.css");

const html = document.documentElement;

/* The grip — a strip just inside the rail's inline edge. There is no permanent
 * handle: the pill exists only while your pointer is near that edge, and it rides
 * the pointer's Y, so the control is always already under your hand and the rail
 * is otherwise a clean line.
 *
 * ⚠ No rAF throttle, unlike ext/demo's `drag()`: `pointermove` is already delivered
 * once per frame, and this sets one custom property rather than re-laying-out a
 * live render. Not worth importing the demo system for. */
export default function grip(){
	let width;

	return div.c("dev-grip", () => span.c("dev-grip-pill"))
		.attr("title", "Drag to resize")

		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);
			html.classList.add("dev-sizing");
		})

		// ⚠ One handler for both jobs, because capture routes the whole drag back
		// here: the pill tracks the pointer whether or not a button is down.
		.on("pointermove", function(e){
			this.style("--grip-y", e.clientY + "px");
			if (html.classList.contains("dev-sizing")) width = rail(innerWidth - e.clientX);
		})

		// Written once, at the end: `rail()` moves the rail every frame, and only the
		// width you let go of is worth remembering.
		.on("pointerup", function(e){
			this.el.releasePointerCapture(e.pointerId);
			html.classList.remove("dev-sizing");
			if (width) set({ width });
		});
}

export { grip };
