import View, { div } from "/app.js";
import { simulate, watch } from "../../../ext/demo/stage.js";
import { render } from "./spec.js";

View.stylesheet(import.meta, "space.css");

/* One spec at every width AT ONCE — the stage's own `simulate()`, five times, each
 * shot as large as its column allows and never magnified past 1:1. A drag shows one
 * width at a time; the whole curve is the question a layout is actually asked.
 *
 * ⚠ A SCREEN is a width AND a height. Without one a `fill` page has nothing to
 *   divide, its `scroll` regions never engage, and the 390 shot renders 2839px tall
 *   and swamps the other four — measured, and the reason this list is pairs.
 * ⚠ A simulated width is not a viewport (ext/demo/stage.js): `@media` answers the
 *   real window, which is the standing argument for intrinsic techniques. */

export const SCREENS = [[390, 844], [720, 1024], [1280, 800], [1920, 1080], [3440, 1440]];

export function ruler(screens = SCREENS){
	const shots = [];

	const $ruler = div.c("space-ruler", () => screens.forEach(([width, height]) => {
		let $view, $size;

		div.c("space-shot", () => {
			// A readout, at body size — `h4` here read as an outline jump from the page's
			// own h1 and h2, and a number you compare wants to be legible anyway.
			$size = div.c("space-tag muted");
			// ⚠ A shot is a picture of another layout at another viewport, so it declares
			//   itself to ext/LayoutTool the way that tool's record requires — without it
			//   this page reported 542 findings, every one of them shrunken text.
			div.c("space-screen surface", () => { $view = div.c("space-render"); })
				.attr("data-layout-ignore", "");
		}).style({ flex: "0 1 " + width + "px", maxWidth: "100%" });

		shots.push({ width, height, $view, $size });
	}));

	// ⚠ Every room is read BEFORE any shot is written: interleaved, the second read
	//   re-lays-out the document the first write just dirtied.
	const fit = () => {
		const rooms = shots.map(shot => shot.$view.el.parentElement.clientWidth);
		if (!rooms[0]) return;

		shots.forEach((shot, i) => shot.$size.text(shot.width + " × " + shot.height + " · "
			+ Math.round(simulate(shot.$view, shot.width, Math.min(rooms[i], shot.width)) * 100) + "%"));
	};

	watch($ruler.el, fit);

	return {
		$ruler,
		draw(text){
			shots.forEach(shot => shot.$view.empty(() =>
				render(text).style("height", shot.height + "px")));

			fit();
		},
	};
}

export default ruler;
