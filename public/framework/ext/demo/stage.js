import View, { div, button, select, option, icon } from "../../core/View/View.js";

View.stylesheet(import.meta, "stage.css");

/**
 * The stage — the only resizable viewport on the site, and the whole chrome of a
 * leaf demo page. `demo.stage(fn)` is the public door; `demo()` wraps the same
 * pieces in a box with a code pane.
 *
 * TOOLS is the strip, STAGE resizes, SCREEN scrolls, RENDER is the bare content
 * that gets measured. ⚠ The middle three cannot be merged: `overflow` on the stage
 * clips the handle that hangs over its edge, and `overflow-x` on the render forces
 * `overflow-y` off `visible` for every demo on the site.
 *
 * The strip is the stage's own and every consumer gets it — widths centred, dials
 * on the right, and nothing to wire up: `demo()`, `demo.stage()`, `demo.exhibit()`
 * and `demo.tree()` each just build a stage. doc/record.md §20.
 *
 * `two.js` composes the same shell with two simulated panes and only the filler in
 * its strip, which is why `filler()` is exported and the split handle is that
 * stage's width dial.
 *
 * ⚠ A div is not a viewport — a `@media` query inside an example answers the real
 * window, not the handle and not a simulated width. doc/record.md §6, §17.
 *
 * `flow` on the render: examples are written like page code, so they space like
 * page code — and emitting it here is what lets core's flow rules stop naming
 * `.demo-render`.
 */
export function stage(fn, board = ""){
	let $render, $size, $tools;

	const $stage = div.c("demo-stage", () => {
		$tools = div.c("demo-tools");
		div.c("demo-screen " + board, () => { $render = div.c("demo-render flow", fn); });
		$size = div.c("demo-size");
	});

	const measure = ruler($render, $size);

	// The strip is placed first and filled now — its controls point at the render
	// below it — and the handle is the one thing that can release what they set.
	$stage.append(() => resizer($stage, tools($tools, $render, $stage, measure)));

	return { $stage, $render, $tools, measure };
}

/* Lay a box out at `width` and draw it in the `room` there is for it. CSS `zoom`,
 * not `transform: scale()`: scale looks identical and lies, because a scaled box
 * still occupies its unscaled size, so nothing re-lays-out.
 * ⚠ `flex` too — in a flex row a basis hands the width straight back. */
export function simulate($view, width, room){
	const factor = room / width;

	$view.style({ flex: "0 0 auto", width: width + "px", zoom: factor });

	return factor;
}

/* ⚠ Width only: a re-fit changes the box's HEIGHT, which would otherwise call this
 * straight back on every pass. */
export function watch(el, fn){
	let last = -1;

	new ResizeObserver(() => {
		if (el.clientWidth === last) return;
		last = el.clientWidth;
		fn();
	}).observe(el);
}

/* ⚠ A pointer outruns the screen: a 240Hz mouse fires four moves per paint, and one
 * move here re-lays-out a live render. One per frame is all anyone can see. */
export function drag(el, move){
	let event, frame;

	const track = ev => {
		event = ev;
		frame ??= requestAnimationFrame(() => { frame = null; move(event); });
	};

	el.addEventListener("pointermove", track);
	el.addEventListener("pointerup", () => el.removeEventListener("pointermove", track), { once: true });
}

const ZOOMS = [25, 50, 75, 100, 150, 200];

/* The word is on the button, the number in its title and in the readout. What these
 * deliver is a layout WIDTH — ⚠ not a device: `@media` answers the real window. */
const WIDTHS = [[390, "mobile"], [810, "tablet"], [1440, "desktop"], [3440, "mega"]];

/* css: `.demo-btn` is demo.css's. ⚠ This module cannot import demo.js — that pair
   would be a cycle and this is the half that gets imported — so the class arrives
   with whoever built the stage, which is demo.js or exhibit.js in every case. */
const btn = (content, title) => button.c("demo-btn", content).attr("title", title);

/**
 * The strip: [ · | mobile tablet desktop mega | 🔍 zoom ⤢ ]. A width lays the render
 * out at 390–3440 and computes the zoom that fits the room it has, capped at 1;
 * the magnifier and the select then zoom on top of that width, so you can lean into
 * a phone layout instead of only looking at it. Returns what releases a width —
 * the handle owns the stage's width and cannot share it. doc/record.md §20.
 */
function tools($tools, $render, $stage, measure){
	let width = 0, fitted = true, $devices, $zoom, $custom;

	const zoomed = () => parseFloat($render.style("zoom")) || 1;

	// a width, or 0 for none. Pressing the pressed one releases it, and either way
	// the zoom is recomputed — a width and the zoom that fits it arrive together.
	const sim = w => {
		width = w;
		fitted = true;
		$render.style({ flex: "", width: "", zoom: "" });

		if (width) simulate($render, width, Math.min($render.el.offsetWidth, width));

		update();
	};

	// ⚠ `fitted` is what stops a container resize from stomping a zoom the reader
	// chose: it re-fits only while the zoom is still the one this computed.
	const set = factor => {
		fitted = false;
		$render.style("zoom", Math.min(4, Math.max(0.1, factor)));
		update();
	};

	const update = () => {
		measure();

		WIDTHS.forEach(([w], i) => $devices.el.children[i].classList.toggle("on", w === width));

		const value = String(zoomed()), listed = ZOOMS.some(z => String(z / 100) === value);

		$custom.el.hidden = listed;
		if (!listed) $custom.attr("value", value).text(Math.round(zoomed() * 100) + "%");
		$zoom.el.value = value;
	};

	// what the magnifier's click means: show the thing whole again, which under a
	// simulated width is its fit and otherwise is 1:1
	const whole = () => width ? sim(width) : set(1);

	$tools.append(() => {
		$devices = div.c("demo-devices", () => WIDTHS.forEach(([w, name]) =>
			btn(name, w + "px of layout — a width, not a device").click(() => sim(w === width ? 0 : w))));

		div.c("demo-dials", () => {
			magnifier(set, zoomed, whole);

			$zoom = select.c("demo-zoom", () => {
				ZOOMS.forEach(z => option(z + "%").attr("value", z / 100));
				$custom = option("").attr("hidden", "");
			}).attr("title", "Zoom the render").on("change", function(){ set(+this.el.value); });

			filler($stage);
		});
	});

	watch($render.el.parentElement, () => { if (width && fitted) sim(width); });

	update();

	// ⚠ A computed zoom belongs to the width that computed it and goes when it goes,
	// or a released `mega` would leave the render laid out at 3440 ÷ 4. A zoom the
	// reader chose is theirs and survives the drag.
	return all => {
		if (!width && !all) return;
		$render.style(all || fitted ? { flex: "", width: "", zoom: "" } : { flex: "", width: "" });
		width = 0;
		fitted = true;
		update();
	};
}

/* Scrubby zoom — the continuous control a stepped `<select>` cannot be. It
 * MULTIPLIES: zoom is logarithmic, so 240px of drag doubles it whether you started
 * at 25% or at 200%. A press that never moved shows the thing whole again. */
function magnifier(set, zoomed, whole){
	return btn(() => icon("zoom_in"), "Drag to zoom · click to fit").ac("demo-scrub")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			const from = zoomed(), x = e.clientX;
			let moved = false;

			drag(this.el, ev => { moved = true; set(from * 2 ** ((ev.clientX - x) / 240)); });
			this.el.addEventListener("pointerup", () => moved || whole(), { once: true });
		});
}

/* One fill-the-window, and it lives on the stage: `demo()` used to carry its own,
 * which filled the screen with the code pane too. ⚠ A way of LOOKING, not a place —
 * `requestFullscreen()` needs a gesture and can never be restored on a reload, so a
 * layout that wants a url claims one instead (styles/layouts/full.js). doc/record.md §7. */
export function filler($stage){
	return btn(() => icon("open_in_full"), "Fill the window").click(function(){
		$stage.tc("max");
		this.tc("on").empty(() => icon($stage.hc("max") ? "close_fullscreen" : "open_in_full"));
	});
}

/* Drag the stage's right edge; what you set is what you SEE, and the example lays
 * out at that ÷ zoom. The handle is the width dial too, so a drag releases a
 * simulated width rather than fighting it. Right-click clears everything — the only
 * way back to "whatever fits", and cheaper than a button that undoes another button. */
function resizer($stage, release){
	return div.c("demo-handle")
		.attr("title", "Drag to resize · right-click to reset")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);
			release(false);

			// the gap between the pointer and the stage's right edge, held constant
			// for the drag — so the handle doesn't jump to the cursor on grab
			const offset = $stage.el.getBoundingClientRect().right - e.clientX;

			/* ⚠ `flex` too: in a flex row a grow factor hands the dragged width
			   straight back, and the handle appears dead. */
			drag(this.el, ev => $stage.style({ flex: "0 0 auto",
				width: Math.max(160, ev.clientX + offset - $stage.el.getBoundingClientRect().left) + "px" }));
		})
		.on("contextmenu", function(e){
			e.preventDefault();
			release(true);
			$stage.style({ width: "", flex: "" });
		});
}

/* `offsetWidth` is the element's OWN box and so is unaffected by `zoom` — a 700px
 * stage at 50% reads 1400, which is the width the demo's CSS is responding to, and a
 * simulated width reads back exactly the number that was picked. The factor rides
 * along when it isn't 1: under a width nothing else says what it was computed to be.
 * ⚠ Not the ResizeObserver `contentRect`: what that reports under `zoom` has moved
 * between browser versions. */
function ruler($render, $size){
	const measure = () => {
		const factor = parseFloat($render.style("zoom")) || 1;

		$size.text(Math.round($render.el.offsetWidth) + "px"
			+ (factor === 1 ? "" : " · " + Math.round(factor * 100) + "%"));
	};

	new ResizeObserver(measure).observe($render.el);
	measure();

	return measure;
}

export default stage;
