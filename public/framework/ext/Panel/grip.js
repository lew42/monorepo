import Draggable from "/framework/ext/Draggable/Draggable.js";
import View, { div, span } from "/framework/core/View/View.js";
import { menu } from "./seam.js";

/* The divider between two panels — zero-width in flow, so the panels touch. What you grab
   is an overlay strip straddling the seam, with a pill that rides the pointer along it. A
   drag writes GROW FRACTIONS to both neighbours; a click opens seam.js's menu. Record:
   readme.md. */
View.stylesheet(import.meta, "grip.css");

const MIN = 40, SLOP = 4;

// A row of columns is divided sideways; `.v` stacks, so its dividers run the other way.
const sideways = el => !el.parentElement.classList.contains("v");

const grow = (node, fraction) => node.style.setProperty("--panel-grow", fraction);
const round = n => Math.round(n * 1000) / 1000;

export function grip(){
	let $pop;
	const $grip = div.c("panel-grip", () => { span.c("panel-grip-pill"); $pop = menu(); })
		.attr("title", "Drag to resize · click for hug and fill");

	/* ⚠ One handler for both jobs, because pointer capture routes the whole drag back here:
	   the pill tracks the pointer whether or not a button is down. It stands still under an
	   open menu, which is anchored to the same two properties. */
	const track = e => {
		if ($pop.hc("on")) return;
		const across = sideways($grip.el);

		// ⚠ Clear the other one: a repaint flips a split's `dir` without rebuilding its grips,
		// so the axis this element last rode stays behind and draws the pill off the seam.
		$grip.el.style.removeProperty(across ? "--grip-x" : "--grip-y");
		$grip.style(across ? "--grip-y" : "--grip-x", (across ? e.offsetY : e.offsetX) + "px");
	};

	$grip.on("pointermove", track).on("pointerleave", () => { $pop.rc("on"); $grip.rc("on"); });

	/* ⚠ The menu is INSIDE the grip, so its buttons' pointerdown bubbles here — and one
	   setPointerCapture retargets the ensuing click to the grip, killing every button in it
	   silently. Anything interactive added inside the grip joins this test by hand. */
	return $grip.on("pointerdown", function(e){
		if ($pop.el.contains(e.target)) return;

		e.preventDefault();
		track(e);
		const el = this.el, prev = el.previousElementSibling, next = el.nextElementSibling;
		const a = Draggable.registry.get(prev)?.item, b = Draggable.registry.get(next)?.item;
		if (!a || !b) return;

		const across = sideways(el);
		const from = across ? e.clientX : e.clientY;
		const [pa, pb] = [prev, next].map(node => across ? node.offsetWidth : node.offsetHeight);
		const total = a.get("grow") + b.get("grow");
		let ga = a.get("grow"), gb = b.get("grow"), dragged = false;
		el.setPointerCapture(e.pointerId);

		coalesce(el, ev => {
			const at = across ? ev.clientX : ev.clientY;
			if (!dragged && Math.abs(at - from) < SLOP) return;   // a click must not nudge the split
			dragged = true;

			const delta = Math.max(MIN - pa, Math.min(pb - MIN, at - from));
			ga = round(total * (pa + delta) / (pa + pb));
			gb = round(total - ga);
			grow(prev, ga); grow(next, gb);
		});

		/* ⚠ Named and taken off in pairs: an interrupted touch fires no `pointerup`, and a
		   `{ once: true }` handler left behind commits the abandoned drag on the next click. */
		const off = () => { el.removeEventListener("pointerup", commit); el.removeEventListener("pointercancel", abort); };

		const commit = () => {
			off();
			if (dragged){ a.set("grow", ga); b.set("grow", gb); return; }

			$grip.tc("on");
			$pop.open(across ? [[a, prev, "←"], [b, next, "→"]] : [[a, prev, "↑"], [b, next, "↓"]]);
		};

		// Back to where the data says the seam is; an abandoned drag commits nothing.
		const abort = () => { off(); grow(prev, a.get("grow")); grow(next, b.get("grow")); };

		el.addEventListener("pointerup", commit);
		el.addEventListener("pointercancel", abort);
	});
}

/* ⚠ A pointer outruns the screen: a 240Hz mouse fires four moves per paint and one move here
   re-lays-out the whole workspace. Lifted from ext/demo/stage.js, never imported. */
export function coalesce(el, move){
	let event, frame;

	const queue = ev => { event = ev; frame ??= requestAnimationFrame(() => { frame = null; move(event); }); };

	// ⚠ `pointercancel` too, and it drops the queued frame: an interrupted gesture fires no
	// `pointerup`, so the queue would go on resizing the split from the next hover of the seam.
	const stop = () => {
		el.removeEventListener("pointermove", queue);
		el.removeEventListener("pointerup", stop);
		el.removeEventListener("pointercancel", stop);
		if (frame) cancelAnimationFrame(frame);
		frame = null;
	};

	el.addEventListener("pointermove", queue);
	el.addEventListener("pointerup", stop);
	el.addEventListener("pointercancel", stop);
}
