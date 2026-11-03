import { div } from "../../core/View/View.js";
import { simulate, watch } from "./stage.js";

/**
 * pane({ width, height }, fn) — one device frame: a whole screen at a fixed layout
 * width, painted down to fit the room it is given, with nothing cropped.
 *
 * The pane is as wide a SHARE of its row as the device is wide a share of its own
 * height, so fitting by width lands a set of them on one height with no dead space —
 * geometry doing what a second measured pass would have had to.
 *
 * ⚠ `aspect-ratio` on the pane, and the render OUT of flow. The pane's height then
 *   comes from its own width instead of from a 1440px render that has not been
 *   zoomed yet: that unzoomed frame is what made the rail visibly dial itself in,
 *   1440px tall, on every load.
 * ⚠ Hidden until the first fit — a card is built detached, so `clientWidth` is 0
 *   until it lands, and one frame of a layout at 1:1 is the whole artefact.
 *
 * ⚠ This file used to export a `twin(fn)` that drew a 390 phone beside a 3440
 *   monitor. It had NO caller — `ext/demo/layout.js` imported it and never called
 *   it — and no width readout. Deleted with `two.js` (demo-merge step 3). The one
 *   live caller is `ext/Panel/Workspace/viewports.js`, which wants the frames.
 */
export function pane({ width, height }, fn){
	let $view;

	const $box = div(() => {
		$view = div(fn).style({
			position: "absolute", inset: "0 auto auto 0",
			width: width + "px", height: height + "px",
			overflow: "hidden", visibility: "hidden",
		});
	}).style({
		flex: `${width / height} 1 0`, minWidth: "0",
		aspectRatio: `${width} / ${height}`,
		position: "relative", overflow: "hidden",
	});

	const fit = () => {
		const room = $box.el.clientWidth;
		if (!room) return;

		simulate($view, width, room);
		$view.style({ height: height + "px", visibility: "visible" });
	};

	fit();               // a card rebuilt into a live page is measurable right now
	watch($box.el, fit);

	return $box;
}

export default pane;
