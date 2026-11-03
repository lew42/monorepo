import View, { div, label, span, input } from "../../core/View/View.js";

View.stylesheet(import.meta, "depth.css");

/* TWO KNOBS, AND THEY ARE GENUINELY DIFFERENT.
 *
 * Depth is how far apart the layers sit — `z` — which buys growth and scroll
 * parallax together, because those are the same `z/(P - z)` factor and no amount of
 * tuning separates them. Motion is how hard the page REACTS: the pointer lean, the
 * per-layer tilt, the shadow throw, and how fast the vanishing point travels while
 * you scroll.
 *
 * ⚠ Depth BOTTOMS OUT at 0.75, and that floor is not taste. Below it the layers are
 * nearly coplanar, and a tilted plane that is nearly coplanar with its parent
 * INTERSECTS it inside the card's own extent — `preserve-3d` then splits the
 * geometry along that intersection and interleaves the halves, so a card renders
 * sliced down a hard diagonal with half of it behind its own parent. It reads as
 * clipping and nothing warns. More z separation moves the intersection outside the
 * card, which is the whole fix.
 *
 * ⚠ Depth's ceiling is legibility, not maths. The hard limit is `z >= P` (behind the
 * camera, where the counter-scale inverts), but `d` in the displacement term is the
 * distance from the reading line — so at high scale a heading near the top of a
 * scrolled page is thrown a long way off it.
 */
const SLIDERS = [
	{ label: "Depth",  prop: "--depth-scale",  min: 0.75, max: 5 },
	{ label: "Motion", prop: "--depth-motion", min: 0,    max: 2 },
];

/**
 * depth — the enclosing page becomes a 3D scene, and anything wearing `.depth(n)`
 * sits n steps toward the reader.
 *
 *   content(){ depth(); section(…).depth(2); }
 *
 * ⚠ The page's layers do not exist yet when this runs — `content()` is still on its
 * first line — so the controls are placed SYNCHRONOUSLY, while the captor is right,
 * and the wiring happens in a microtask that names its target. Same shape as
 * ext/toc, for the same reason. Design record: readme.md.
 */
export default function depth(...args){
	const ranges = new Map();

	const $ctrl = div.c("depth-ctrl", () => SLIDERS.forEach(knob =>
		label.c("depth-slider", () => {
			span.c("depth-slider-name", knob.label);

			const $range = input.c("depth-slider-range")
				.attr("type", "range").attr("min", knob.min).attr("max", knob.max)
				.attr("step", 0.05).attr("value", 1);

			ranges.set(knob.prop, { $range, $value: span.c("depth-slider-value") });
		})
	)).assign(...args);

	queueMicrotask(() => wire($ctrl, ranges));

	return $ctrl;
}

function wire($ctrl, ranges){
	const scene = $ctrl.el.closest(".page");

	if (!scene)
		return console.warn("depth(): no enclosing .page — nothing to make a scene of");

	scene.classList.add("depth-scene");

	// The scroll handler needs motion as a NUMBER on every frame; the pointer effects
	// need it as a custom property. Kept on both sides here so neither has to read
	// the other's styles — a getComputedStyle per scroll is a style flush per scroll.
	const motion = { rate: 1 };

	// ⚠ `focus()` hands back its update so the Motion slider can apply itself NOW.
	// Without that, motion reaches the pointer instantly (CSS reads the property)
	// but the scroll parallax only catches up on the next scroll event — so
	// dragging the slider and not moving looks like a dead control.
	const refocus = focus(scene, motion);

	ranges.forEach(({ $range, $value }, prop) => {
		const apply = () => {
			scene.style.setProperty(prop, $range.el.value);
			$value.text(Number($range.el.value).toFixed(2));

			if (prop !== "--depth-motion") return;

			motion.rate = parseFloat($range.el.value);
			refocus();
		};

		$range.on("input", apply);

		// Once now: the readout has to start correct, and a slider whose `min` is
		// above 0 cannot assume the page's own token matches its handle.
		apply();
	});

	lean(scene);
}

/* The vanishing point rides the READING CENTRE.
 *
 * Left at the box's own middle it sits thousands of pixels away on a long page, and
 * a layer's displacement — (distance from the origin) × z/(P − z) — grows with it
 * until the layout is simply wrong. Pinned here, displacement is ~0 where the eye
 * is and opens up gently toward the edges, which is the parallax you actually want. */
function focus(scene, motion){
	const scroller = scene.closest(".pages");

	if (!scroller)
		return () => {};

	// Measured once per resize so the scroll handler reads no geometry at all —
	// the scene's offset inside the scrolled content cannot change without one.
	// ⚠ `middle` doubles as the measured flag: until it is set, the CSS fallback
	// (50%) holds, which is wrong but stable. Writing an unmeasured value instead
	// pins the focus half a viewport off and it never recovers.
	let base = 0, middle = 0;

	/* ⚠ Motion is clamped to 1 BELOW, and only amplifies above it. Gain 1 is exact
	   tracking — the origin sits on the reading line, so displacement there is ~0.
	   Any gain under 1 makes the origin LAG the reading line, which produces more
	   drift, not less: the one setting where the slider would fight its own label.
	   Above 1 the origin outruns the content and the parallax opens up. */
	const update = () => middle && scene.style.setProperty("--depth-focus",
		(middle - base + scroller.scrollTop * Math.max(1, motion.rate)) + "px");

	// ⚠ A hidden page measures every rect at 0,0.
	const measure = () => {
		if (!scene.offsetParent) return;

		base = scene.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
		middle = scroller.clientHeight / 2;
		update();
	};

	scroller.addEventListener("scroll", update, { passive: true });
	addEventListener("resize", measure);

	/* ⚠ NOT a one-shot. `depth()` runs inside `content()`, so the page is still
	   unmarked — and therefore `display: none` — for the microtask AND often for
	   the first frame after it; both measures bail and nothing ever tries again.
	   The observer fires when the scene finally gets a box, whenever that is.
	   Setting `--depth-focus` cannot resize the scene, so this does not loop. */
	new ResizeObserver(measure).observe(scene);

	return update;
}

/* ⚠ Writes the lean NORMALISED to -1..1, not in px. Four things read it at four
   different scales — the origin slide (`--depth-lean`), the layer tilt
   (`--depth-tilt`), the shadow throw (`--depth-shadow`) and the motion multiplier —
   and a px value would force JS to know all of them. CSS multiplies; JS just says
   where the pointer is. */
function lean(scene){
	let x = 0, y = 0, queued = false;

	const paint = () => {
		queued = false;
		scene.style.setProperty("--depth-lean-nx", x);
		scene.style.setProperty("--depth-lean-ny", y);
	};

	addEventListener("pointermove", e => {
		x = (e.clientX / innerWidth - 0.5) * 2;
		y = (e.clientY / innerHeight - 0.5) * 2;

		// pointermove fires far more often than the page paints.
		if (!queued){
			queued = true;
			requestAnimationFrame(paint);
		}
	}, { passive: true });
}

/* A layer is a class and a number.
 *
 * ⚠ `steps` is OPTIONAL, and leaving it off is the better default for a page with
 * more than a couple of layers. Passing it writes an INLINE `--depth`, which beats
 * every class rule — so a page that wants to retune "all its headings" or "all its
 * cards" at once has to edit N call sites instead of one selector. `.depth()` bare
 * adds the class and lets CSS say how deep, which is where a tier belongs. */
View.prototype.depth = function(steps){
	this.ac("depth-layer");

	if (steps !== undefined)
		this.style("--depth", String(steps));

	return this;
};

export { depth };
