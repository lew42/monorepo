## split.js

Click a panel's **edge**, get a split preview: a ghost of the arriving panel
that follows the pointer and flips across the midline, committing on a left
click and cancelling on a right click or Escape. One gesture where a strip of
edge buttons used to be three, because the edge you clicked already supplies
both arguments `divide()` takes.

**Two verbs, two gestures (2026-08-19):** an edge click here is **split** —
the struck panel's own twin, empty, via `Panel.restyle()`. The Workspace
bar's `+` is **add** — a fresh panel from scratch (`Workspace.js`'s `add()`).
Neither reaches for the other. [doc/decisions.md](../decisions.md).

```js split.js
const AXIS = { l: "row", r: "row", t: "col", b: "col" };
const LOW = { l: true, t: true, r: false, b: false };
```

`l`/`r` divide a **row** — a new column beside you; `t`/`b` divide a
**column** — a new row above or below. `LOW` is also the opening guess at
which side the ghost starts on, so a click that commits without any pointer
movement still does the obvious thing.

## One live preview per document

```js split.js
let live;   // one preview per document — a second edge click cancels the first
```

Module-scope, not per-call: clicking a second edge while a preview is already
open cancels the first (`live?.cancel()`) before starting the new one, rather
than leaving two previews live at once.

## `begin()` — the ghost, and the pointer read

```js split.js
const aim = e => {
	const box = $panel.el.getBoundingClientRect();
	const next = across ? e.clientX - box.left < box.width / 2 : e.clientY - box.top < box.height / 2;
	if (next === before) return;
	before = next;
	mark();
};
```

`$ghost` is placed once, synchronously, inside `$panel.append()`; `aim()`
only ever toggles its `before`/`after` class as the pointer crosses the
midline, so a redraw never has to rebuild the element mid-drag.

## ⚠ Document listeners bind on a `setTimeout`, not synchronously

```js split.js
setTimeout(() => {
	if (!live) return;
	document.addEventListener("pointermove", aim);
	document.addEventListener("click", commit);
	…
});
```

The click that **opened** the preview has not finished bubbling to the
document yet. Bind `commit` on `click` synchronously and that same click
fires it immediately — the preview would commit itself before it had ever
been drawn. The `if (!live) return` guard covers the case where `cancel()`
already ran (a second edge click, or Escape) inside that same zero-delay
window.

## `commit`/`cancel`/`key` — three ways out, one teardown

```js split.js
const done = () => {
	live = null;
	$ghost.el.remove();
	document.removeEventListener("pointermove", aim);
	…
};
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
```

`commit()` reads `before` into a local (`at`) **before** calling `done()`,
because `done()` is what removes the ghost and its listeners — reading the
flag after teardown would still work here (nothing clears `before` itself),
but the ordering keeps "what was decided" and "cleanup" from interleaving.

⚠ **`new Panel().restyle(item)`, not `new Panel()`** (2026-08-19) — the
arrival is the struck panel's own *twin*: `restyle()` copies `Panel.shared`
minus `template seed text`, so the split shares a look but starts genuinely
empty. Not `mirror()`: that shares live, this copies once.

⚠ **And the struck panel's own SPACE, halved** (2026-08-19). `restyle()`
copies the struck panel's whole `grow`, which is right for a NEST — both
children of the fresh container start level at 1 — and wrong the moment
`divide()` takes its same-direction branch and drops the twin into the row:
two full shares where there was one, so three columns came back 33/33/33
where the ghost had drawn 25/25/50. The gesture states its own share here, a
split never touches a sibling's, and `add` (the Workspace bar's `+`, "a new
column", not a split) never comes through this line and keeps its equal
share. Measured in a 600px workspace: 300/300 → **150/150/300**, and the
ghost's box equals the arriving panel's box to the pixel.
[doc/sizing.md](/framework/ext/Panel/doc/sizing/), [doc/decisions.md](../decisions.md).

## Three gestures, one strip (2026-08-19)

```js split.js
const SIZE = {
	r: { extent: "w", at: "w_at", prop: "--panel-w-at", fixed: "panel-w-fixed", hug: "panel-w-hug", back: "fill", cursor: "width" },
	b: { extent: "h", at: "h_at", prop: "--panel-h-at", fixed: "panel-h-fixed", hug: "panel-h-hug", back: "hug", cursor: "height" },
};
```

The right and bottom strips carry **click = split** (unchanged), **drag =
resize this panel's own axis**, and **right-click = that axis back to its
default word**. Top and left stay split-only: a panel in flow is anchored at
its top-left, so dragging those two would move the content rather than size
the box (the owner).

A pointer that moves `SLOP` (4px) before pointerup is a drag, and the click
it ends with is swallowed — so no ghost ever appears for a resize. The flag
resets on every **pointerdown** rather than after the click: pointer capture
makes the trailing click reliable but not guaranteed, and a flag left true
would swallow the next honest split.

⚠ **One `set` on commit, and the WORD goes into `data` by hand.**
`set(extent, "fixed")` alone no-ops on a second drag of an already-fixed
panel (`Item.set` returns early when the value is unchanged) and the new
length would be quietly lost. Writing the word into `data` and setting the
LENGTH makes the length the announcement — one save, one repaint.

⚠ **A live preview owns the right button first.** `begin()` binds its own
canceller on the document; the reset handler returns early while `live` is
set and lets the event through, rather than doing both.

The length is `em` of the panel's own font size, to the quarter — so an
arrangement survives a zoom and a 3440 screen the way `grow` ratios do.
[doc/sizing.md](/framework/ext/Panel/doc/sizing/).

## Improvements

1. **`AXIS` and `LOW` are two maps over the same four keys**, and every
   caller that reads one immediately reads the other beside it (`begin()`
   does exactly this). A single `{ l: { dir: "row", before: true }, … }`
   would read as one table instead of two that happen to share keys.
   *(simple, speculative — 76 lines, not worth it yet)*
