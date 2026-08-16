import View, { div } from "/app.js";
import { simulate, watch } from "../../../ext/demo/stage.js";
import { render } from "./spec.js";

View.stylesheet(import.meta, "space.css");

/* One spec at every width AT ONCE — five screens in ONE row, at ONE scale. The whole
 * curve is the question a layout is actually asked, and it is read across rather than
 * scrolled through.
 *
 * ⚠ A SCREEN is a width AND a height. Without one a `fill` page has nothing to
 *   divide, its `scroll` regions never engage, and the 390 shot renders 2839px tall
 *   and swamps the other four — measured, and the reason this list is pairs.
 * ⚠ A simulated width is not a viewport (ext/demo/stage.js): `@media` answers the
 *   real window, which is the standing argument for intrinsic techniques. */

export const SCREENS = [[390, 844], [720, 1024], [1280, 800], [1920, 1080], [3440, 1440]];

/* Below this the row SCROLLS instead of shrinking further. Five screens inside 400px
   of phone is five smudges, and a scrollbar is the honest answer to a room that
   cannot hold the instrument. */
const FLOOR = 0.1;

/* Narrower than this and the caption is wider than the shot it labels. */
const PAIR = 96;

export function ruler(screens = SCREENS){
	const shots = [];
	const total = screens.reduce((sum, [width]) => sum + width, 0);
	let $row, $scale;

	const $ruler = div.c("space-ruler flex v gap", () => {
		$scale = div.c("space-tag muted");

		/* ⚠ The marker goes on the ROW, and it has to. A shot is a picture of another
		     layout at another viewport — without any marker this page reported 542
		     findings, every one of them shrunken text. But marking only the screens
		     leaves the row itself measurable, and ext/LayoutTool then reads a
		     2986×579 box holding 51 characters of caption: `empty`, at HIGH, meaning
		     "a dead url, or content that never arrived". The row is a picture too.
		     ⚠ It is the whole ROW and not the wall around it: the seed wall marks its
		     grid for the same reason, and `words/` proves the opposite case — a box
		     holding real text as well as miniatures must mark only the miniatures. */
		$row = div.c("space-row", () => screens.forEach(([width, height]) => {
			let $view, $size;

			const $shot = div.c("space-shot", () => {
				$size = div.c("space-tag muted");
				div.c("space-screen surface", () => { $view = div.c("space-render"); });
			});

			shots.push({ width, height, $shot, $view, $size });
		})).attr("data-layout-ignore", "");
	}).style("--gap", "0.5em");

	/* ONE zoom for all five, computed from the row's own width — and that is what
	   makes the shots comparable: a card 200px wide on the 1280 screen is 200px wide
	   on the 3440 one, so the row reads as five sizes of the same thing.
	   ⚠ Per-shot fitting is what this replaced, and it was the bug behind "the five
	     aren't visible at once": every shot took its own zoom, so nothing lined up
	     and the tall ones had to be scrolled past.
	   ⚠ The room is read BEFORE anything is written, and what gets written is the
	     row's own CHILDREN — so a write can never dirty the measurement above it. */
	/* ⚠ A BACKGROUND TAB NEVER FITS, and that is the browser, not this code. `watch()`
	     is a ResizeObserver and delivery rides the rendering steps, which a hidden tab
	     does not run — so a ruler rendered while the tab is in the background keeps
	     its shots at max-content (4184px each at 3440, all five identical) and the
	     scale caption stays empty until the tab is looked at. Cost half an hour of
	     chasing a layout bug that was a measurement bug: an agent driving this page
	     through `Server/plugins/MCP.js`'s `eval` is ALWAYS in a hidden tab. Check
	     `document.visibilityState` before believing a geometry read. */
	const fit = () => {
		const room = $row.el.clientWidth;
		if (!room) return;

		const gap = parseFloat(getComputedStyle($row.el).columnGap) || 0;
		const zoom = Math.max(FLOOR, Math.min(1, (room - gap * (shots.length - 1)) / total));

		$scale.text("one scale · " + Math.round(zoom * 100) + "% · "
			+ total.toLocaleString() + "px of screen across");

		shots.forEach(shot => {
			const px = Math.floor(shot.width * zoom);

			// ⚠ The caption is wider than the shot at the small end — `390 × 844` needs
			//   ~90px and the phone gets 73 at 1920. The pair drops to the width alone
			//   rather than clipping to `390 ×`; the `title` always carries both.
			shot.$shot.style("width", px + "px")
				.attr("title", shot.width + " × " + shot.height);
			shot.$size.text(px < PAIR ? shot.width : shot.width + " × " + shot.height);

			simulate(shot.$view, shot.width, px);
		});
	};

	watch($row.el, fit);

	return {
		$ruler,
		shots,
		draw(text){
			shots.forEach(shot => shot.$view.empty(() =>
				render(text).style("height", shot.height + "px")));

			fit();
		},
	};
}

export default ruler;
