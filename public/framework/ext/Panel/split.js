import View, { div } from "/framework/core/View/View.js";
import Panel from "./Panel.js";
import { sizing } from "./size.js";
import { coalesce } from "./grip.js";

/* Click a panel's EDGE and a split preview starts: a ghost of the panel about to arrive,
   following the pointer and flipping to whichever side of the midline it is on. Left click
   commits, right click or Escape cancels. One gesture where a strip of edge buttons was
   three, and the edge you pointed at is the argument — `divide()` already takes exactly
   the two things a click on an edge knows (the owner, 2026-08-16).

   ⚠ Two verbs, two gestures (design §5, 2026-08-19): an EDGE click here is SPLIT — the
   struck panel's own twin, empty, via `restyle()`. The Workspace bar's `+` is ADD — a
   fresh panel from scratch (`Workspace.js`'s `add()`). Neither reaches for the other.
   css: .panel-edge, .panel-ghost. Record: readme.md. */
View.stylesheet(import.meta, "split.css");

/* l/r divide a ROW — a new column beside me; t/b divide a COLUMN — a new row above or
   below. The side is also the opening guess at which half, so a click that commits
   without moving does the obvious thing. */
const AXIS = { l: "row", r: "row", t: "col", b: "col" };
const LOW = { l: true, t: true, r: false, b: false };

/* ONE strip, THREE gestures (the owner, 2026-08-19). Click still splits; DRAG resizes this
   panel's own axis; RIGHT-CLICK puts that axis back to its default word. Only the right and
   bottom edges — "for a default situation, the top and left resize handles aren't useful
   (they wouldn't work properly anyway)", and they are right: a panel in flow is anchored at
   its top-left, so dragging those two would move the content rather than size the box.
   Each entry is the whole vocabulary of one axis. doc/sizing.md. */
const SIZE = {
	r: { extent: "w", at: "w_at", prop: "--panel-w-at", fixed: "panel-w-fixed", hug: "panel-w-hug", back: "fill", cursor: "width" },
	b: { extent: "h", at: "h_at", prop: "--panel-h-at", fixed: "panel-h-fixed", hug: "panel-h-hug", back: "hug", cursor: "height" },
};

// A pointer that moved this far is a DRAG, and the click it ends with is not a split.
const SLOP = 4, MIN = 40;

export const SPLIT = { edges: true };

let live;   // one preview per document — a second edge click cancels the first

export function edges(item, $panel){
	Object.keys(AXIS).forEach(side => {
		const cfg = SIZE[side];
		const $edge = div.c("panel-edge panel-edge-" + side).attr("title", cfg
			? `Drag to set the ${cfg.cursor} · click to split · right-click to reset`
			: AXIS[side] === "row" ? "Click to split into columns" : "Click to split into rows");

		// ⚠ Shared by all three gestures, and reset on every pointerdown rather than after
		// the click: pointer capture makes the click reliable but not guaranteed, and a flag
		// left true would swallow the next honest split.
		let dragged = false;

		$edge.click(() => { if (dragged) return void (dragged = false); begin(item, $panel, side); });
		if (!cfg) return;

		/* Back to the default word. ⚠ A live preview owns the right button first — `begin()`
		   binds its own canceller on the document, and this handler lets the event through
		   to it rather than doing both. Nothing written, nothing to reset. */
		$edge.on("contextmenu", e => {
			if (live || (item.data[cfg.extent] === undefined && item.data[cfg.at] === undefined)) return;
			e.preventDefault();
			delete item.data[cfg.at];
			item.set(cfg.extent, cfg.back);
			sizing(item, $panel);
		});

		$edge.on("pointerdown", e => {
			if (e.button) return;                 // the right button is the reset above
			e.preventDefault();
			dragged = false;

			const el = $panel.el, edge = $edge.el, across = side === "r";
			const from = across ? e.clientX : e.clientY;
			const start = across ? el.offsetWidth : el.offsetHeight;
			let at = start;
			edge.setPointerCapture(e.pointerId);

			// Live, straight onto the element — the class and the property are exactly what
			// `sizing()` would write, so the drag previews the answer it is about to commit.
			coalesce(edge, ev => {
				const moved = (across ? ev.clientX : ev.clientY) - from;
				if (!dragged && Math.abs(moved) < SLOP) return;
				if (!dragged){ dragged = true; live?.cancel(); el.classList.remove(cfg.hug); el.classList.add(cfg.fixed); }

				at = Math.max(MIN, start + moved);
				el.style.setProperty(cfg.prop, at + "px");
			});

			// ⚠ Named and taken off in pairs, grip.js's lesson: an interrupted touch fires no
			// `pointerup`, and a `{ once: true }` handler left behind commits an abandoned drag.
			const off = () => { edge.removeEventListener("pointerup", commit); edge.removeEventListener("pointercancel", abort); };

			/* ⚠ ONE `set`, so one save and one repaint: `w_at`/`h_at` are not shared keys, so
			   the word goes straight into `data` and the LENGTH is the write that announces
			   both. `set(extent, "fixed")` alone would no-op on a second drag of an
			   already-fixed panel and quietly lose it. */
			const commit = () => {
				off();
				if (!dragged) return;

				el.style.removeProperty(cfg.prop);
				item.data[cfg.extent] = "fixed";
				item.set(cfg.at, length(at, el));
				sizing(item, $panel);
			};

			const abort = () => { off(); dragged = false; el.style.removeProperty(cfg.prop); sizing(item, $panel); };

			edge.addEventListener("pointerup", commit);
			edge.addEventListener("pointercancel", abort);
		});
	});
}

/* `em` of the PANEL'S OWN font size, to the quarter — never px. A saved arrangement then
   survives a browser zoom and a 3440 screen the way `grow` ratios already do (doc/sizing.md),
   and it reads back as the same kind of length `glyphs.js`'s `LENGTHS` offer, so the picker
   and the drag write one vocabulary. */
const length = (px, el) => Math.round(px / parseFloat(getComputedStyle(el).fontSize) * 4) / 4 + "em";

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

	/* The struck panel's own look, empty — `restyle()`, not `mirror()`: this copies once.

	   ⚠ And the struck panel's own SPACE, halved — the result must be the ghost you were
	   just shown (the owner, 2026-08-19: three columns came back 33/33/33 where the preview
	   drew 25/25/50). `restyle()` copies the struck panel's whole `grow`, which is right for
	   a NEST (both children of the fresh container start level at 1) and wrong the moment
	   `divide()` takes its same-direction branch and drops the twin into the row: two
	   full shares where there was one. So the gesture states its own share here — a split
	   never touches a sibling's — and `add` (the Workspace bar's `+`, "a new column", not a
	   split) keeps the equal share it always had, because it never comes through this line.
	   doc/decisions.md, doc/sizing.md. */
	const commit = () => {
		const at = before;
		done();

		const beside = item.parent?.get("dir") === dir;
		const half = beside ? Math.round(item.get("grow") * 500) / 1000 : 1;
		const twin = new Panel().restyle(item);

		twin.data.grow = half;
		if (beside) item.set("grow", half);

		item.divide(dir, twin, at);
	};
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
