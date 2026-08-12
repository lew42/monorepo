import View, { div, select, option } from "../../core/View/View.js";

View.stylesheet(import.meta, "stage.css");

/**
 * The stage — the only resizable viewport on the site, and the whole chrome of a
 * leaf demo page. `demo.stage(fn)` is the public door; `demo()` wraps the same
 * pieces in a box with a code pane.
 *
 * STAGE resizes, SCREEN scrolls, RENDER is the bare content that gets measured.
 * ⚠ The three cannot be merged: `overflow` on the stage clips the handle that
 * hangs over its edge, and `overflow-x` on the render forces `overflow-y` off
 * `visible` for every demo on the site.
 *
 * ⚠ A div is not a viewport — a `@media` query inside an example does not respond
 * to the handle. Everything intrinsic does. readme.md §6.
 *
 * `flow` on the render: examples are written like page code, so they space like
 * page code — and emitting it here is what lets core's flow rules stop naming
 * `.demo-render`.
 */
export function stage(fn, board = ""){
	let $render, $size, $tools;

	const $stage = div.c("demo-stage", $view => {
		div.c("demo-screen " + board, () => { $render = div.c("demo-render flow", fn); });

		$tools = div.c("demo-tools", () => { $size = div.c("demo-size"); });
		resizer($view);
	});

	return { $stage, $render, $tools, measure: ruler($render, $size) };
}

/* CSS `zoom`, not `transform: scale()`. Scale would look identical and lie: a
 * scaled box still occupies its unscaled size, so nothing re-lays-out. */
const ZOOMS = [25, 50, 75, 100, 150, 200];

export function zoom($render, measure){
	const $zoom = select.c("demo-zoom", () =>
		ZOOMS.forEach(z => option(z + "%").attr("value", z / 100)));

	$zoom.el.value = "1";

	return $zoom.attr("title", "Zoom the render").on("change", function(){
		$render.style("zoom", this.el.value);
		measure();
	});
}

/* Drag the stage's right edge; what you set is what you SEE, and the example lays
 * out at that ÷ zoom. Right-click clears it — the only way back to "whatever
 * fits", and cheaper than a toolbar button that undoes another button. */
function resizer($stage){
	return div.c("demo-handle")
		.attr("title", "Drag to resize · right-click to reset")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			// the gap between the pointer and the stage's right edge, held constant
			// for the drag — so the handle doesn't jump to the cursor on grab
			const offset = $stage.el.getBoundingClientRect().right - e.clientX;

			/* ⚠ `flex` too: in a flex row a grow factor hands the dragged width
			   straight back, and the handle appears dead. */
			const drag = ev => $stage.style({ flex: "0 0 auto",
				width: Math.max(160, ev.clientX + offset - $stage.el.getBoundingClientRect().left) + "px" });

			this.el.addEventListener("pointermove", drag);
			this.el.addEventListener("pointerup",
				() => this.el.removeEventListener("pointermove", drag), { once: true });
		})
		.on("contextmenu", function(e){
			e.preventDefault();
			$stage.style({ width: "", flex: "" });
		});
}

/* `offsetWidth` is the element's OWN box and so is unaffected by `zoom` — a 700px
 * stage at 50% reads 1400, which is the width the demo's CSS is responding to.
 * ⚠ Not the ResizeObserver `contentRect`: what that reports under `zoom` has moved
 * between browser versions. */
function ruler($render, $size){
	const measure = () => $size.text(Math.round($render.el.offsetWidth) + "px");

	new ResizeObserver(measure).observe($render.el);
	measure();

	return measure;
}

export default stage;
