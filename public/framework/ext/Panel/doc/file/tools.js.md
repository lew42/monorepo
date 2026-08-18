## tools.js

The surfaces that sit **on** a panel rather than in its bar: the alignment
3×3, the scrub zoom, and the two listeners that put a selection's words in
`ext/drawer`. Everything is revealed by the same hover the bar is, and
everything lives behind a flag in `TOOLS` — on by default (the owner, 2026-08-16:
"I want to see all the core tools for now"), so a surface can be hidden later
by flipping one word rather than unbuilding it.

```js tools.js
export const TOOLS = { align: true, zoom: true, inspect: true };
```

## Two listeners, one rail, no import in either direction

```js tools.js
document.addEventListener("panel-focus", async e => {
	if (!TOOLS.inspect) return;
	if (!e.detail) return drawer.refresh();

	const { fields } = await import("./properties.js");
	drawer(($slot, $body) => { … });
});
```

`panel-focus` (a whole panel selected) and `panel-text` (a run of prose
selected, announced by `text.js`) both fill the same `ext/drawer` rail with
the same two-region shape — a tag in `$slot`, controls in `$body` — which is
the whole reason the rail was pulled out of `ext/layout` in the first place:
one properties surface, fed by more than one kind of selection.

⚠ **`properties.js` arrives *inside* the listener, never as a static
import.** `properties.js` imports `workspace.js`, and a static import here
would close a ring — `workspace.js` → `tools.js` → `properties.js` →
`workspace.js` — of exactly the kind that only breaks on a **deep** reload
(`/framework/ext/Panel/` throws, a route two levels down works, per
`CLAUDE.md`'s mutual-import trap). `text.js`'s own listener needs no such
care because `text.js` imports nothing of `ext/Panel` at all.

⚠ **Nothing is built by a bare factory call after the `await`.** Both
listeners are `async`, and capturing is synchronous — every element inside
`drawer(...)`'s callback lands correctly only because `drawer()` re-establishes
the captor for its own callback; nothing here calls a factory directly after
the `await import(...)` line.

## `align_grid(item, $body)` — a grid cell *is* its placement

```js tools.js
button.c("panel-btn panel-tool", glyph(COMPASS[code], code))
	.style({ "--tool-y": PLACE[code[0]], "--tool-x": PLACE[code[1]] })
```

Nine buttons, each told where it sits by two custom properties `tools.css`
reads as `align-self`/`justify-self` on its own grid cell — nothing computes a
pixel position, and the grid's own padding is what holds a corner arrow off
the very corner. ⚠ **The overlay itself never hit-tests** (`pointer-events:
none` on `.panel-align`, re-enabled only on `.panel-tool`) — without that,
every click meant for the content under a hovered panel would die on the grid
instead.

## `zoom_scrub(item, $body)` — a property, not a transform

```js tools.js
const set = factor => $body.style("zoom", Math.min(4, Math.max(0.1, factor)));
coalesce(this.el, ev => { moved = true; set(from * 2 ** ((ev.clientX - x) / 240)); });
```

Lifted in shape from `ext/demo/stage.js`'s magnifier and rebuilt on this
module's own `coalesce()` (imported from `grip.js`) rather than imported —
pulling in the demo chrome would drag `stage.css` and the whole stage module
behind one button.

⚠ **`zoom`, never `transform: scale()`.** A scaled box still occupies its
unscaled footprint, so nothing re-lays-out; a panel's templates size
themselves in `cq` units against the body, which only re-queries because
`zoom` genuinely changes the box the browser measures.

⚠ **It multiplies, not adds.** `2 ** (dx / 240)` means 240px of travel always
*doubles* the current zoom, whether you started at 25% or 200% — a linear
`from + dx / k` would make the same drag distance feel different depending on
where you started.

## Improvements

1. **`align_grid` and `zoom_scrub` both take `(item, $body)` but only
   `align_grid` reads `item`** (for the current alignment code, to mark the
   active button). A reader skimming both signatures can't tell that apart
   without opening the bodies. *(simple, speculative)*
2. **The two `document.addEventListener` blocks are the same shape typed
   twice** — detect nothing, look up a lazy render function, call `drawer()`
   with the same two-region callback shape. Small enough (12 lines each) that
   extracting a helper would cost a third abstraction to save one duplicate.
   *(simple, not worth it yet — a third selection kind would tip it)*
