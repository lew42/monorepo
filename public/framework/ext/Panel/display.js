import View, { div, span } from "/framework/core/View/View.js";

/* `display` as a panel word: the class a leaf's body actually lays its children out with,
   plus an overlay that draws what that mode is doing — on by default like every other
   surface here (Mike, 2026-08-16): "we want the panel to visually represent all the layout
   dynamics." css: .panel-d-block, .panel-d-flex, .panel-d-grid, .panel-display*.
   Record: readme.md. */
View.stylesheet(import.meta, "display.css");

export const DISPLAY = { on: true };
export const MODES = ["block", "flex", "grid"];

/* Which axes a CHILD can actually place itself on. Flex has no `justify-self` at all — the
   main axis is always the parent's call, and a column swaps which axis that is; grid gives
   a child both. */
export function live_axes(mode, dir){
	if (mode === "grid") return { x: true, y: true };
	if (mode === "flex") return dir === "col" ? { x: true, y: false } : { x: false, y: true };
	return { x: false, y: false };
}

/* ⚠ The CLASS is not written here — `workspace.js`'s `show()` is its single writer, so this
   file only ever DRAWS what the class already did; reading `item.get("display")` rather than
   the class keeps one source of truth regardless. ⚠ The first `draw()` runs before `$body` is
   ever attached — `isConnected` only starts meaning something once an observer fires AFTER
   that, which is also the one signal a panel torn down by a full-tree redraw reliably sends:
   a detached box resizes to nothing. */
export function display_overlay(item, $body){
	if (!DISPLAY.on) return;

	const mode = () => (MODES.includes(item.get("display")) ? item.get("display") : "block");
	const $overlay = div.c("panel-display");

	const draw = () => {
		const m = mode();
		$overlay.empty(() => {
			if (m === "flex") flex_layer($overlay.el, $body.el);
			if (m === "grid") grid_layer($overlay.el, $body.el);
		});
	};

	const on_change = key => key === "display" && wake();

	function wake(){
		if (!$body.el.isConnected) return stop();
		draw();
	}

	function stop(){
		watch.disconnect();
		seen.disconnect();
		item.off("change", on_change);
	}

	const watch = new ResizeObserver(wake);
	watch.observe($body.el);

	const seen = new MutationObserver(wake);
	seen.observe($body.el, { childList: true });

	item.on("change", on_change);
	draw();

	return $overlay;
}

// One line, one arrowhead — flex's row never varies, so nothing about it reads a child.
function flex_layer(overlay, body){
	div.c("panel-display-axis");

	const base = overlay.getBoundingClientRect();
	[...body.children].forEach(child => {
		const box = child.getBoundingClientRect();
		span.c("panel-display-badge", getComputedStyle(child).flexGrow)
			.style({ left: (box.left - base.left) + "px", top: (box.top - base.top) + "px" });
	});
}

/* `grid-template-columns` resolves to real pixels the moment it is READ — auto-fit's own
   track count, not the `minmax()` that produced it — so a track a child never claimed still
   draws, and the labels are the browser's own numbers. */
function grid_layer(overlay, body){
	const style = getComputedStyle(body);
	const tracks = style.gridTemplateColumns.split(" ").map(parseFloat).filter(n => !Number.isNaN(n));
	if (!tracks.length) return;

	const base = overlay.getBoundingClientRect();
	const box = body.getBoundingClientRect();
	const gap = parseFloat(style.columnGap) || 0;

	let x = box.left - base.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);

	tracks.forEach(w => {
		div.c("panel-display-line").style("left", x + "px");
		span.c("panel-display-badge", Math.round(w) + "px").style({ left: (x + 4) + "px", top: "4px" });
		x += w + gap;
	});
}
