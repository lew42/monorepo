/**
 * pack($wall) — the measuring pass `.packed` needs (framework.css).
 *
 *     import { pack } from "./masonry.js";
 *     pack(div.c("packed", () => site.notes(14)));
 *
 * `.masonry` needs none of this and is the default answer; this is what the second
 * one costs to keep left-to-right reading order. Design record: readme.md.
 */
export function pack($wall){
	const el = $wall.el ?? $wall;
	let frame = 0, mounted = false;

	const measure = () => {
		frame = 0;

		/* ⚠ Detached is not dead. A page builds its wall and the ROUTER appends it, and
		   the first frame can land in between — `/framework/ui/`'s Doc builds its
		   Overview into a region that mounts later, so the first measure found nothing
		   connected, disconnected itself, and left nineteen cards on the `span 40`
		   fallback with nothing in the console. Only a wall that HAS been mounted and
		   then left is gone; before that, wait — the observer fires the moment the
		   items get a box. */
		if (!el.isConnected) return mounted && observer.disconnect();
		mounted = true;

		const style = getComputedStyle(el);
		const row = parseFloat(style.gridAutoRows) || 4;

		/* ⚠ `columnGap`, not `rowGap`. `.packed` declares `gap: 0 var(--gap)` — the row
		   gap is zero because the SPAN carries the space — so the column gap is the only
		   resolved pixel value the wall has for how far apart two notes should sit. */
		const gap = parseFloat(style.columnGap) || 0;

		/* ⚠ `offsetHeight`, never `getBoundingClientRect()`. A rect is in VIEWPORT space,
		   so an ancestor's `zoom` scales it while the computed `grid-auto-rows` beside it
		   stays in author space — the ratio is then wrong by the zoom factor, and the
		   spans come out short (overlap) or long (gaps). ext/demo's twin stage zooms
		   every pane it draws, uncapped, which is where this showed up: the 400px pane
		   packed at ~1.8x and left a note-sized hole under every note. `offsetHeight` is
		   the element's own box and is unaffected — the same measure, for the same
		   reason, as `level()` in ext/demo/two.js. */
		for (const item of el.children)
			item.style.gridRowEnd = `span ${Math.ceil((item.offsetHeight + gap) / row)}`;
	};

	const repack = () => { frame ||= requestAnimationFrame(measure); };

	/* ⚠ The ITEMS, never the wall. A width change reaches the items as a height change
	   anyway (narrower column, taller note), and observing the wall as well feeds its
	   own span writes back in as a resize — the loop `align-self: start` exists to
	   break. That declaration is also why re-measuring is stable: an item keeps its
	   content height whatever span it is handed. */
	const observer = new ResizeObserver(repack);
	for (const item of el.children) observer.observe(item);

	// ⚠ The web font lands after the first measure and every note changes height with
	// it — without this the wall keeps the metrics of the fallback face forever.
	document.fonts?.ready.then(repack);

	repack();
	return $wall;
}

export default pack;
