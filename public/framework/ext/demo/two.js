import View, { div } from "../../core/View/View.js";
import { simulate, watch, drag, filler } from "./stage.js";

/* css: .demo-sims, .demo-sim, .demo-split — plus `.demo-stage`, `.demo-tools`,
   `.demo-screen` and `.demo-size`, which stage.js emits and this composes. */
View.stylesheet(import.meta, "two.css");

const WIDE = 3440, NARROW = 400, MIN = 0.25, SPLIT = 1 - MIN;

/**
 * two(fn) — the same builder at two simulated widths, on ONE stage.
 * `demo.stage.two(fn)` is the public door; `demo.layout({ twin: true })` is the
 * other caller, and it takes `$views` and `redraw` to wire the parts chips.
 *
 * The handle between the panes is a width DIAL, not just a splitter: every position
 * is a pair of widths mirrored around the middle, so centered the panes are twins,
 * either extreme is exactly `wide` beside `narrow`, and a drag shows both layouts
 * *reflowing* rather than re-zooming. Log-spaced, because breakpoints sit at ratios.
 *
 * It is a stage, so the fullscreen in its strip is the site's ONE fullscreen — this
 * used to be a box with a private one. The width buttons and the zoom stay off: the
 * split handle is this stage's width dial, and two of them would fight.
 *
 * ⚠ A simulated width is not a viewport (stage.js): `@media` answers the real window.
 */
export function two(fn, opts = {}){
	const wide = opts.wide ?? WIDE, narrow = opts.narrow ?? NARROW;
	const panes = [];
	let $sims;

	const $stage = div.c("demo-stage demo-two", $two => {
		div.c("demo-tools", () => div.c("demo-dials", () => filler($two)));

		$sims = div.c("demo-screen demo-sims", () => {
			panes.push(pane(fn));
			handle(split);
			panes.push(pane(fn));
		});
	});

	const $views = panes.map(sim => sim.$view);

	// mirrored around the middle: the share the handle sits at is one width, and
	// its complement is the other
	const simulated = share => Math.round(narrow * (wide / narrow) ** ((share - MIN) / (1 - 2 * MIN)));

	/* Each pane's factor is MEASURED — `clientWidth / simulated` — rather than derived
	   from the share, so the handle's own width is already accounted for. UNCAPPED, so
	   a pane always fills: the stage's width buttons cap at 1:1 because a phone in a
	   wide page should not be magnified, but here the two panes ARE the stage, and a
	   390 screen drawn at 390 in a 744 pane left the pair floating off the ground's
	   left and right edges as the handle moved — which reads as a bug (the owner, 2026-08-15).
	   The readout still prints the width and the factor, so the magnification is stated.
	   ⚠ Both rooms are read BEFORE either pane is written: interleaved, the second
	     read re-lays-out the document the first write just dirtied. */
	function fit(){
		if (!$sims.el.clientWidth) return;   // not laid out yet — the observer is coming

		const rooms = panes.map(sim => sim.$box.el.clientWidth);

		panes.forEach((sim, i) => sim.$size.text(sim.width + "px · "
			+ Math.round(simulate(sim.$view, sim.width, rooms[i]) * 100) + "%"));

		if (opts.level) level($views);
	}

	/* The drag re-simulates as it re-splits: both widths follow the handle, in
	   opposite directions. The share clamps at ¼ / ¾ rather than near the edges, so
	   the pane going mobile zooms *in* as its width falls.
	   ⚠ Unchanged widths mean there is nothing to do, and that is every frame the
	     pointer spends past the clamp — the expensive half must not run for them. */
	function split(share){
		share = Math.min(1 - MIN, Math.max(MIN, share));

		const widths = [simulated(share), simulated(1 - share)];

		if (widths.every((width, i) => width === panes[i].width)) return;

		panes.forEach((sim, i) => sim.width = widths[i]);
		panes[0].$box.style("flex", `0 0 ${(share * 100).toFixed(2)}%`);
		fit();
	}

	split(SPLIT);
	watch($sims.el, fit);

	return { $stage, $views, redraw: () => { $views.forEach($view => $view.empty(fn)); fit(); } };
}

function pane(fn){
	let $view, $size;

	/* No `checkered`. The board asks "did this paint its own background", and on a pane
	   it answered about the wrong box: the room a 1:1-capped fit leaves over is
	   OFF-SCREEN, not an unpainted render — 350px of checkers beside a phone on a wide
	   window. It cannot move onto the render either, where `zoom` smears the tile to a
	   mesh. A two-up compares two widths; the ground behind it is the stage's. */
	const $box = div.c("demo-sim", () => {
		$view = div.c("demo-render flow", fn);
		$size = div.c("demo-size");
	});

	return { $box, $view, $size, width: 0 };
}

function handle(split){
	return div.c("demo-split")
		.attr("title", "Drag to re-split · right-click to reset")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			// the row is the handle's own parent, and only its height moves as you drag
			const row = this.el.parentElement.getBoundingClientRect();

			drag(this.el, ev => split((ev.clientX - row.left) / row.width));
		})
		.on("contextmenu", function(e){
			e.preventDefault();
			split(SPLIT);
		});
}

/* `level:` — the TALLEST pane sets the height and the other grows to meet it. A
 * `min-height` on the render's root, never a height: it can only add, so no width
 * can ever hide content, and what absorbs the extra is the layout's own `flex-1`
 * band, so footers and status bars still land on the bottom edge.
 *
 * ⚠ Cleared before measuring: a previous pass's floor is not evidence.
 * ⚠ `offsetHeight` is the render's OWN box and so is unaffected by `zoom`.
 */
function level($views){
	const roots = $views.map($view => $view.el.firstElementChild);
	if (roots.some(root => !root)) return;

	roots.forEach(root => root.style.minHeight = "");

	const zooms = $views.map($view => parseFloat($view.el.style.zoom) || 1);
	const tallest = Math.max(...$views.map(($view, i) => $view.el.offsetHeight * zooms[i]));

	roots.forEach((root, i) => root.style.minHeight = Math.round(tallest / zooms[i]) + "px");
}

export default two;
