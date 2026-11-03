import View from "/framework/core/View/View.js";
import { live_axes } from "./display.js";
import { PLACE } from "./glyphs.js";

/* Per-axis sizing: `w`/`h`, each `fill | hug | fixed`, replacing the one-word `mode` for
   BOTH axes at once — plus the two rules that fall straight out of it. `self`, where the
   panel sits in the slot its split hands it, exists ONLY on an axis that does not fill.
   `position` says whether the panel is in that slot at all, or floating over it.
   `sizing()` is the sole writer of the classes and custom properties size.css reads — call
   it after any redraw, as many times as you like. `hug` means AUTO: the box measures what
   it holds, because nothing in this module is a query container any more. doc/sizing.md.
   css: .panel-w-hug, .panel-w-fixed, .panel-h-hug, .panel-h-fixed, .panel-pos-absolute,
   .panel-mode-document, plus `.panel-self`/`.panel-seat`, the control that draws this rule.
   Record: readme.md, doc/file/size.js.md. */
View.stylesheet(import.meta, "size.css");

export const SIZE = { on: true };
export const EXTENTS = ["fill", "hug", "fixed"];

// ⚠ `hug` rides the list with nothing writing it any more: a document saved while the class
// existed keeps it in no DOM this file does not rebuild, and dropping it from the CLEAR list
// is how a stale one would survive a redraw. Cheap; delete it once a sweep has been through.
const CLASSES = EXTENTS.flatMap(e => ["w", "h"].map(axis => `panel-${axis}-${e}`)).join(" ") + " panel-pos-absolute hug panel-mode-document panel-group";

// In the slot, or over it. One word, and `static` is every panel that never chose.
export const floating = item => item.get("position") === "absolute";

/* A split's own word (2026-08-19): does it collapse Figma-style selection onto ITSELF —
   `group: on | off` — until something drills past it? Every split may wear it; unset reads
   as ON for a document root's own sections (`mode: document`'s direct children) and OFF
   everywhere else, which is today's plain innermost-wins. `item.data.group`, never
   `item.get()`: there is no static default to put in `Panel.defaults` for a value that
   depends on WHERE a split sits. `focus.js` reads this to resolve a click and to walk
   Escape back out; the CSS gate in panel.css reads the class it writes below. */
export const grouped = item => !item.leaf() && (item.data.group
	?? (item.parent && !item.parent.parent && item.parent.document() ? "on" : "off")) === "on";

/* `mode` was never really "hug both axes" — flex-grow/shrink/basis only ever touch the
   MAIN axis (the one the split runs along; row or root is inline, col is block), so an old
   `mode: "hug"` panel already only hugged that one and filled the other. A saved document
   with no `w`/`h` reads exactly that: hug on whichever axis is main, fill the cross one —
   until an explicit `w`/`h` says otherwise, per key. ⚠ `item.data.w`, never `item.get("w")`:
   `Panel.defaults` answers "fill" and would swallow the legacy fallback whole. */
export function extents(item){
	const main = item.parent?.get("dir") === "col" ? "h" : "w";
	const legacy = item.get("mode") === "hug" ? main : null;

	return {
		main,
		w: item.data.w ?? (legacy === "w" ? "hug" : "fill"),
		/* ⚠ `hug`, not `fill` (2026-08-19): the DEFAULT is flow — a panel's height is what it
		   holds, so a split or a section added inside grows it instead of scrolling inside
		   it. A saved document that never wrote `h` reads `hug` from today, and the two
		   places that filled a screen still do (a workspace handed a `--panel-height`
		   stretches its root; `mode: document` is untouched). doc/sizing.md. */
		h: item.data.h ?? "hug",
	};
}

/* Every panel's own element, so `self_axes()` can read what its slot ACTUALLY is instead
   of assuming — the control that asks lives in the properties rail and holds no part of
   the panel it edits. Weak, so a closed panel's entry leaves with it. */
const panels = new WeakMap();

export function sizing(item, $panel){
	const { w, h } = extents(item);
	const over = floating(item);
	panels.set(item, $panel);

	$panel.rc(CLASSES)
		.ac(w !== "fill" && `panel-w-${w}`)
		.ac(h !== "fill" && `panel-h-${h}`)
		.ac(over && "panel-pos-absolute")
		/* The root's `mode`, as the one class panel.css reads to make a workspace a
		   scrolling DOCUMENT — written here because this is already the sole writer of
		   `$panel`'s own layout classes. ⚠ Root only:
		   `document()` is the test, never the key, because `split()` hands a root's data
		   down to its first section. */
		.ac(item.document() && "panel-mode-document")
		.ac(grouped(item) && "panel-group");

	if (w === "fixed" && item.get("w_at")) $panel.style("--panel-w-at", item.get("w_at"));
	if (h === "fixed" && item.get("h_at")) $panel.style("--panel-h-at", item.get("h_at"));

	/* Read by size.css only from rules already gated on a NON-filling axis: which rule
	   exists is what enforces "a filling panel has nothing left to align", so nothing here
	   has to test it. The other half of the truth table is the engine's — `justify-self` is
	   inert in flex, so writing it can never make a main axis movable. `self[0]` is the
	   block half, `self[1]` the inline one.

	   ⚠ Only when the panel CHOSE one (2026-08-19). `Panel.defaults.self` answers `tl`, so
	   `item.get()` here wrote `start` on every panel ever built and no rule below could
	   have a different default — which is exactly what a hugging HEIGHT needs, because a
	   div in a row stretches. Unset now falls through to size.css's own fallback: `start`
	   everywhere it always was, `stretch` for the one rule that is the flow default. */
	const self = item.data.self;
	if (self) $panel.style({ "--panel-self-x": PLACE[self[1]] ?? "start", "--panel-self-y": PLACE[self[0]] ?? "start" });

	return $panel;
}

/* Which self-alignment axes a panel can actually use, and why not. TWO conditions, both
   necessary: the axis must not FILL, and the slot's display mode must let a child place
   itself on that axis at all (`live_axes`). Only the CONTROL needs this — the CSS above
   needs neither test. Shape: `{ x: { live, why }, y: { live, why } }`. */
export function self_axes(item){
	const { w, h } = extents(item);
	const dir = item.parent?.get("dir") ?? "row";
	const mode = slot_mode(panels.get(item));

	/* Out of flow the slot's display mode has no say at all: an abspos box is aligned
	   against its containing block on BOTH axes, so only the fill test is left. */
	const live = floating(item) ? { x: true, y: true } : live_axes(mode, dir);
	return { x: verdict(live.x, w, "width", mode, dir), y: verdict(live.y, h, "height", mode, dir) };
}

const verdict = (placeable, extent, axis, mode, dir) => {
	const why = [];

	if (extent === "fill") why.push(`${axis} fills — nothing to align`);
	if (!placeable) why.push(mode === "block"
		? "a block slot places neither axis"
		: `a flex ${dir === "col" ? "column" : "row"} owns ${axis}`);

	return { live: placeable && extent !== "fill", why: why.join(" · ") };
};

/* What the panel is sitting in, READ rather than assumed: a split's `.panel-items` and the
   root `.panel-workspace` are flex today, and the day either is not, the control follows
   with no second source of truth to disagree. ⚠ A detached element computes to nothing,
   so an unmounted panel reads as the flex it is about to be. */
const slot_mode = $panel => {
	const el = $panel?.el.parentElement;
	if (!el?.isConnected) return "flex";

	const display = getComputedStyle(el).display;
	return display.includes("grid") ? "grid" : display.includes("flex") ? "flex" : "block";
};
