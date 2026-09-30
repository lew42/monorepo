import View, { div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "grip.css");

const html = document.documentElement;

/* The resize edge for a rail docked at the screen's inline end — a strip just inside
 * the rail's inline-start edge. There is no permanent handle: the pill exists only
 * while your pointer is near that edge, and it rides the pointer's cross axis, so the
 * control is always already under your hand and the rail is otherwise a clean line.
 *
 * Mount it inside the rail's box (`dev/DevBar`, `ext/drawer` both do) and give it two
 * functions: `write(px)` on every move — px is the size (a width, or a height on the
 * `y` axis) the pointer implies, and what that means is yours — and `done(size)` once,
 * on release, to remember it. Return the size you actually applied from `write` and
 * that is what `done` is handed. `done` is optional — skip it when `write` already
 * persists on every call, as `size_rail()` in `/layouts/shell/page.js` does.
 *
 * `reset`, also optional: fires on a double-click with no argument, for "put the size
 * back" — `core/Sidebar` and `/layouts/shell/Shell.js` both had their own copy of this
 * gesture (grab, drag, double-click-to-reset) before they were merged onto this file,
 * 2026-09-18, and this is the one piece grip did not already have.
 *
 * `axis: "x" | "y"` (default `"x"`, 2026-09-29): which size the strip drags — a WIDTH,
 * standing on its own INLINE edge and dragging sideways (every caller before today),
 * or a HEIGHT, lying on its own BLOCK edge and dragging up/down (the mobile ✦ sheet's
 * own top handle, `ext/drawer/rail.js`). `from` and `mirror` mean exactly what they
 * always have, just read against the other pair of edges: `from` still names which
 * edge of the PARENT is pinned (`"end"`, the default, is the box's own right on `x` or
 * its own bottom on `y` — the unmoving edge for every rail today and for the sheet);
 * `mirror` still picks which side of the box's OWN edge the strip and its lit line sit
 * on. Leaving `axis` out is byte-identical to before it existed: same classes, same
 * pointer math, same CSS.
 *
 * ⚠ No rAF throttle, unlike ext/demo's `drag()`: `pointermove` is already delivered
 * once per frame, and this sets one custom property rather than re-laying-out a
 * live render. Not worth importing the demo system for. */
export default function grip({ write, done, reset, from = "end", mirror = from === "start", axis = "x" }){
	let size, edge, grab = 0;
	const on_x = axis !== "y";

	let cls = mirror ? "grip grip-start" : "grip";
	if (!on_x) cls += " grip-y";

	function end(e){
		if (this.el.hasPointerCapture?.(e.pointerId)) this.el.releasePointerCapture(e.pointerId);
		if (!html.classList.contains("grip-sizing")) return;
		html.classList.remove("grip-sizing", "grip-sizing-x", "grip-sizing-y");
		if (size) done?.(size);
	}

	return div.c(cls, () => span.c("grip-pill"))
		.attr("title", "Drag to resize")

		.on("pointerdown", function(e){
			e.preventDefault();
			// A fresh drag starts with no size: the last drag's size used to linger
			// here, so a plain tap on the strip re-fired `done()` with it (the
			// sheet snapped to full height on a tap, sheet-as-page 2026-09-30).
			size = undefined;
			this.el.setPointerCapture(e.pointerId);
			// The rail's OTHER edge is pinned, so one read holds for the whole drag —
			// and reading it, rather than `innerWidth`/`innerHeight`, is what lets a
			// rail parked beside another one (ext/drawer, offset by `--devbar`) size to
			// the pointer instead of past it.
			const rect = this.el.parentElement.getBoundingClientRect();
			edge = on_x
				? (from === "start" ? rect.left : rect.right)
				: (from === "start" ? rect.top : rect.bottom);
			// y only: where in the strip the finger landed, so the box's edge stays
			// under the finger instead of jumping up to 1.25rem on the first move
			// (the ✦ sheet, sheet-as-page 2026-09-30). The x rails size to the
			// pointer itself, as they always have.
			grab = on_x ? 0 : rect.height - (from === "start" ? e.clientY - edge : edge - e.clientY);
			// The axis-specific class is ONLY for the cursor (grip.css) — the whole
			// page should show a resize cursor even where the pointer strays off
			// the thin strip mid-drag, and which one depends on which axis this
			// grip is.
			html.classList.add("grip-sizing", on_x ? "grip-sizing-x" : "grip-sizing-y");
		})

		// ⚠ One handler for both jobs, because capture routes the whole drag back
		// here: the pill tracks the pointer whether or not a button is down.
		// ⚠ `--grip-y` (x-axis grip) / `--grip-x` (y-axis grip) name the CROSS axis —
		// the one the pill rides, not the one being dragged — and grip.css reads
		// them on an absolutely positioned child, so the value has to be relative to
		// THIS box's own top-left, not the viewport — a plain `e.clientY` matched the
		// dev rail (`inset-block: 0`, its own top already IS the viewport's) but
		// landed ~200px low on `ai/v/3`'s column split, whose box sits partway down
		// the page (measured live, 2026-09-22).
		.on("pointermove", function(e){
			const rect = this.el.getBoundingClientRect();
			if (on_x) this.style("--grip-y", (e.clientY - rect.top) + "px");
			else this.style("--grip-x", (e.clientX - rect.left) + "px");
			if (!html.classList.contains("grip-sizing")) return;
			const pointer = on_x ? e.clientX : e.clientY;
			const px = (from === "start" ? pointer - edge : edge - pointer) + grab;
			size = write(px) ?? px;
		})

		// Written once, at the end: `write()` moves the rail every frame, and only the
		// size you let go of is worth remembering. `done` is optional.
		.on("pointerup", function(e){ end.call(this, e); })

		// A touch the browser takes back (a system gesture, a scroll it decided on)
		// ends with `pointercancel`, never `pointerup` — without this the whole page
		// stayed in resize mode (`grip-sizing`: no text selection, the resize cursor).
		.on("pointercancel", function(e){ end.call(this, e); })

		// The size back to whatever `write(undefined)` (or the caller's own default)
		// means — never touched by drag, so nothing here decides what "reset" means.
		.on("dblclick", () => reset?.());
}

export { grip };
