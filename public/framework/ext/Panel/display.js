import View, { div, span } from "/framework/core/View/View.js";

/* `display` as a panel word: the class a leaf's body actually lays its children out with,
   plus an overlay that draws what that mode is doing — on by default like every other
   surface here (the owner, 2026-08-16): "we want the panel to visually represent all the layout
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

/* ⚠ The CLASS is not written here — `paint.js`'s `show()` is its single writer, so this
   file only ever DRAWS what the class already did; reading `item.get("display")` rather than
   the class keeps one source of truth regardless. ⚠ Returns a DISPOSE function rather than
   waiting for a `ResizeObserver` to notice the box is gone — that never fires for a body that
   was 0×0 or never laid out. `overlays.js` holds it and `draw()` drains it before the next
   structural redraw discards this `$body`. */
export function display_overlay(item, $body){
	const mode = () => (MODES.includes(item.get("display")) ? item.get("display") : "block");
	const $overlay = div.c("panel-display");

	const draw = () => {
		const m = mode();
		$overlay.empty(() => {
			if (m === "flex") flex_layer($overlay.el, $body.el);
			if (m === "grid") grid_layer($overlay.el, $body.el);
		});
	};

	const on_change = key => key === "display" && draw();

	const watch = new ResizeObserver(draw);
	watch.observe($body.el);

	const seen = new MutationObserver(draw);
	seen.observe($body.el, { childList: true });

	item.on("change", on_change);
	draw();

	return () => { watch.disconnect(); seen.disconnect(); item.off("change", on_change); };
}

/* One line, one arrowhead, along the axis the body RESOLVED to — read, never assumed:
   `dir` is a word a panel wears now, and an overlay that drew a row while the body ran as
   a column would be the second source of truth this file exists to avoid. */
function flex_layer(overlay, body){
	div.c("panel-display-axis").ac(getComputedStyle(body).flexDirection.startsWith("column") && "v");

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
