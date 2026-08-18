## display.js

`display` as a panel word — `block`/`flex`/`grid`, the CSS a leaf's own
**content** lays out with — plus an overlay that draws what the chosen mode
is actually doing: the flex axis and each child's grow, or the grid's real
resolved track widths.

```js display.js
export const DISPLAY = { on: true };
export const MODES = ["block", "flex", "grid"];
```

## ⚠ The class is written elsewhere — this file only reads it

```js display.js
const mode = () => (MODES.includes(item.get("display")) ? item.get("display") : "block");
```

`workspace.js`'s `show()` is the class's single writer (`.panel-d-block` /
`flex` / `grid`, written to `.panel-body`). `display_overlay()` reads
`item.get("display")` — never the class itself — which keeps one source of
truth: the overlay and the class can never disagree about which mode a panel
is in, because only one of them is ever asked.

## The redraw triggers, and why there are three

```js display.js
const watch = new ResizeObserver(wake);
watch.observe($body.el);
const seen = new MutationObserver(wake);
seen.observe($body.el, { childList: true });
item.on("change", on_change);
```

A `change` on `display` itself is the obvious trigger. The other two exist
because the overlay draws **geometry** (track widths, child positions) that
can go stale without the mode ever changing: a `ResizeObserver` catches the
body itself resizing (a seam dragged, a window resized), and a
`MutationObserver` catches the template's own content changing shape (a
lazy-loaded scene landing, a template swap) — both of which redraw pixels the
overlay needs to redraw its own numbers against.

## Teardown is handed back, never detected

```js display.js
return () => { watch.disconnect(); seen.disconnect(); item.off("change", on_change); };
```

`display_overlay()` returns its **disposer**, and `workspace.js` registers it
against the workspace root; `draw()` drains the previous generation's disposers
immediately before `$root.empty()`, while every observer is still reachable.

⚠ **This replaced a teardown that detected its own death and did not always
notice** (2026-08-16). The old `wake()` called `stop()` when it saw
`!$body.el.isConnected` — which depends on a `ResizeObserver` firing *after*
detach, and that never happens for a body that was `0×0` or never laid out.
`on_change` was gated on `key === "display"`, so no other key reached the lazy
path either. Measured over 20 structural redraws: **+953 MutationObservers and
+253 ResizeObservers**, with per-document `change` listeners growing `2→22`,
`4→50`, `11→87` — and those stale `item.on("change")` closures outlive every DOM
**and still fire**. After the fix, both observer counts are **flat at +0**,
reproduced at 20 and at 60 redraws.

The lesson generalises past this file: **a teardown that depends on a signal
arriving is not a teardown.** The thing that knows a generation is over is the
code that replaces it.

## `grid_layer()` — the browser's own numbers, not the spec that produced them

```js display.js
const tracks = style.gridTemplateColumns.split(" ").map(parseFloat).filter(n => !Number.isNaN(n));
```

⚠ **`grid-template-columns` only resolves to real pixels when it is READ.**
`getComputedStyle` returns `auto-fit`'s actual resolved track count and each
track's real width — not the `minmax(8em, 1fr)` that produced them — so a
track no child ever claimed still draws, labelled with the number the browser
actually laid out rather than a number derived from the rule.

## `flex_layer()` — one line, one arrowhead, no per-child axis reading

```js display.js
function flex_layer(overlay, body){
	div.c("panel-display-axis");
	[...body.children].forEach(child => {
		span.c("panel-display-badge", getComputedStyle(child).flexGrow)
			.style({ left: …, top: … });
	});
}
```

Deliberately simpler than `grid_layer()`: a flex row's main axis never
varies (it's always the row itself), so the axis line is drawn once and
nothing about it reads a child. Only the grow badges are per-child.

## Improvements

1. **`live_axes(mode, dir)` is exported, correct, and unused.** Its truth
   table (grid: both axes live; flex row: cross only; flex column: the
   other; block: neither) describes *self*-alignment against a parent — a
   control the 3×3 does not have yet, since the 3×3 today aligns a leaf's own
   **content**, not the leaf against its slot. Wiring it in now would grey
   out buttons that currently work. *(medium, blocked on a control that
   doesn't exist — tracked in the readme's Open section)*
2. **`flex_layer` and `grid_layer` take `(overlay, body)` in that order while
   `display_overlay` itself takes `(item, $body)`** — a reader following the
   call has to remember the element/View split changes shape one level down.
   Consistent within each function, just not across the file. *(simple,
   speculative)*
