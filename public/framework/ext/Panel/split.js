import View, { div } from "/framework/core/View/View.js";
import Panel from "./Panel.js";

/* Click a panel's EDGE and a split preview starts: a ghost of the panel about to arrive,
   following the pointer and flipping to whichever side of the midline it is on. Left click
   commits, right click or Escape cancels. One gesture where a strip of edge buttons was
   three, and the edge you pointed at is the argument — `divide()` already takes exactly
   the two things a click on an edge knows (Mike, 2026-08-16).
   css: .panel-edge, .panel-ghost. Record: readme.md. */
View.stylesheet(import.meta, "split.css");

/* l/r divide a ROW — a new column beside me; t/b divide a COLUMN — a new row above or
   below. The side is also the opening guess at which half, so a click that commits
   without moving does the obvious thing. */
const AXIS = { l: "row", r: "row", t: "col", b: "col" };
const LOW = { l: true, t: true, r: false, b: false };

export const SPLIT = { edges: true };

let live;   // one preview per document — a second edge click cancels the first

export function edges(item, $panel){
	if (!SPLIT.edges) return;

	Object.keys(AXIS).forEach(side => div.c("panel-edge panel-edge-" + side)
		.attr("title", AXIS[side] === "row" ? "Click to split into columns" : "Click to split into rows")
		.click(() => begin(item, $panel, side)));
}

function begin(item, $panel, side){
	live?.cancel();

	const dir = AXIS[side];
	const across = dir === "row";
	let before = LOW[side], $ghost;

	$panel.append(() => { $ghost = div.c("panel-ghost panel-ghost-" + dir); });
	mark();

	function mark(){ $ghost.el.classList.toggle("before", before); $ghost.el.classList.toggle("after", !before); }

	const aim = e => {
		const box = $panel.el.getBoundingClientRect();
		const next = across ? e.clientX - box.left < box.width / 2 : e.clientY - box.top < box.height / 2;
		if (next === before) return;
		before = next;
		mark();
	};

	const done = () => {
		live = null;
		$ghost.el.remove();
		document.removeEventListener("pointermove", aim);
		document.removeEventListener("click", commit);
		document.removeEventListener("contextmenu", cancel);
		document.removeEventListener("keydown", key);
	};

	const commit = () => { const at = before; done(); item.divide(dir, new Panel(), at); };
	const cancel = e => { e?.preventDefault(); done(); };
	const key = e => { if (e.key === "Escape") cancel(e); };

	live = { cancel: () => cancel() };

	/* ⚠ Next task, not now: these listeners go on the DOCUMENT, and the click that opened
	   the preview has not finished bubbling — bound synchronously, `commit` fires on that
	   same click and the preview never appears. */
	setTimeout(() => {
		if (!live) return;
		document.addEventListener("pointermove", aim);
		document.addEventListener("click", commit);
		document.addEventListener("contextmenu", cancel);
		document.addEventListener("keydown", key);
	});
}
