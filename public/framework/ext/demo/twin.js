import { div } from "../../core/View/View.js";
import { simulate, watch } from "./stage.js";

/**
 * twin(fn) — one layout twice, side by side: a whole 390 phone screen beside a
 * whole 3440 monitor screen, both live, both entire, both landing on one height.
 * The comparison IS the card, and `demo.layout({ twin: true })` is what asks for it.
 *
 * Each pane is as wide a SHARE of the card as its device is wide a share of its own
 * height, so fitting both by width puts them on one height with nothing cropped and
 * no dead space — geometry doing what a second measured pass would have had to.
 *
 * ⚠ `aspect-ratio` on the pane, and the render OUT of flow. The pane's height then
 *   comes from its own width instead of from a 1440px render that has not been
 *   zoomed yet: that unzoomed frame is what made the rail visibly dial itself in,
 *   1440px tall, on every load.
 * ⚠ Hidden until the first fit — a card is built detached, so `clientWidth` is 0
 *   until it lands, and one frame of a layout at 1:1 is the whole artefact.
 */
const PHONE   = { width: 390, height: 844 };
const MONITOR = { width: 3440, height: 1440 };

export default function twin(fn){
	return div.c("flex gap", () => { pane(PHONE, fn); pane(MONITOR, fn); }).style("--gap", "0.4em");
}

function pane({ width, height }, fn){
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

export { twin };
