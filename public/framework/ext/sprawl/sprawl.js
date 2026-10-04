import { View, div } from "../../core/View/View.js";

/* css: .sprawl, .sprawl-column — both in sprawl.css. */
View.stylesheet(import.meta, "sprawl.css");

/* sprawl(sections) — a wall of big blocks that balances its own columns, instead of
 * leaving one tall column towering over short ones.
 *
 * WHAT IT DOES. You hand it an array of already-built blocks (Views or anything with an
 * `.el`), in priority order — most important first, same as everywhere else on this site.
 * It gives back one View: a CSS grid, columned the ordinary way
 * (`repeat(auto-fit, minmax(min(100%, 60rem), 1fr))` — one column under ~60rem of room,
 * about three at 3440), and it DECIDES WHICH COLUMN each block goes in — walking them in
 * order and dropping each one into whichever column is currently shortest so far — so the
 * columns come out roughly the same height, not "first third of the list, second third,
 * third third" the way plain source order would. It re-runs only on load and when the
 * number of columns itself changes, never on every resize pixel or an unrelated reflow.
 *
 * Full reasoning — the algorithm, the two CSS-only approaches tried and rejected first
 * (equal-height rows, `columns:`), exactly when it re-runs, and the below-breakpoint and
 * hidden-tab cases: [`doc/algorithm.md`](doc/algorithm.md).
 */

const TRACK_REM = 60;   // keep in step with the CSS below if that ever changes

export function sprawl(sections){
	const host = div.c("sprawl");
	let last_n = null, first = true, timer;

	const run = () => {
		const n = column_count(host.el);
		if (n === last_n) return;
		last_n = n;
		place(host, sections, n);
	};

	// Synchronous, before the observer below ever gets a chance to fire — a background or
	// unfocused tab's ResizeObserver never fires at all, which otherwise left the whole
	// grid empty until the tab was focused (review round 4, 2026-10-02). `host.el` has no
	// width yet here (every sprawl() is built detached, same as any other page-level View),
	// so `column_count()` falls back to its own under-the-breakpoint answer, 1 — every
	// section in one column, same as a narrow screen, never nothing on screen. The real
	// column count settles on the observer's own first real callback below. doc/algorithm.md.
	run();

	const observer = new ResizeObserver(() => {
		// `!first &&`: the observer's OWN first notification fires while `host.el` is often
		// still detached (same as the synchronous pass above, just reported asynchronously),
		// so `isConnected` legitimately reads false right then — disconnecting on THAT would
		// kill the observer before it ever saw the page's real, attached size. Past the first
		// callback, the same check every other recurring callback in this codebase uses to
		// notice it has outlived its element (ext/AITask/dashboard.js, ext/files/files.js, …):
		// nothing here ever disconnected this observer once its host left the document, so
		// every sprawl() ever built kept it (and the whole `sections` closure) alive forever
		// (review round 4, 2026-10-02 — the leak doc/algorithm.md now records).
		if (!first && !host.el.isConnected) return observer.disconnect();

		if (first){ first = false; run(); return; }
		clearTimeout(timer);
		timer = setTimeout(run, 150);
	});
	observer.observe(host.el);

	return host;
}

// How many `TRACK_REM`-wide tracks the grid's own CSS (`repeat(auto-fit, minmax(min(100%,
// ${TRACK_REM}rem), 1fr))`) would currently draw — read back from the box itself rather
// than kept as separate state, so this can never disagree with what `auto-fit` decides.
function column_count(el){
	const track_px = TRACK_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
	const gap_px = parseFloat(getComputedStyle(el).columnGap) || 0;
	const width = el.clientWidth;

	if (width <= track_px) return 1;
	return Math.max(1, Math.floor((width + gap_px) / (track_px + gap_px)));
}

// Every block's real height AT THE WIDTH ONE COLUMN WILL HAVE — not the width it happens
// to render at today, which matters: the same paragraph wraps onto more lines, and so
// measures TALLER, squeezed into one of three 3440px columns than it does alone in a
// single 1400px-wide column. A plain off-screen box (`position: absolute`, far
// off-canvas rather than `visibility: hidden` alone, so it can never affect anything
// else's layout or scrollbars) gives every block that exact width for one instant, read
// back with `offsetHeight`, before each one moves to its real, final column.
function measure(sections, column_px){
	const stage = document.createElement("div");
	stage.style.cssText = `position:absolute; left:-99999px; top:0; width:${column_px}px;`;
	document.body.appendChild(stage);

	const heights = sections.map(section => { stage.appendChild(section.el); return section.el.offsetHeight; });

	stage.remove();
	return heights;
}

// THE GREEDY PASS. One column-wrapper View per track, each block moved into whichever
// column's RUNNING HEIGHT TOTAL is currently smallest — ties keep the first (lowest-
// index) column, which is what keeps a 1-column result identical to plain source order.
function place(host, sections, n){
	const gap_px = parseFloat(getComputedStyle(host.el).columnGap) || 0;
	const column_px = (host.el.clientWidth - gap_px * (n - 1)) / n;
	const heights = measure(sections, column_px);

	host.el.textContent = "";

	const columns = Array.from({ length: n }, () => div.c("sprawl-column flex v gap"));
	const totals = new Array(n).fill(0);

	sections.forEach((section, i) => {
		let shortest = 0;
		for (let k = 1; k < n; k++) if (totals[k] < totals[shortest]) shortest = k;

		columns[shortest].append(section);
		totals[shortest] += heights[i];
	});

	columns.forEach(col => host.append(col));
}

export default sprawl;
