# grip — a rail's resize edge: a strip just inside the edge it drags, and a pill that rides your pointer. No permanent handle. Shared by [`ext/drawer`](/framework/ext/drawer/), [`dev/DevBar`](/framework/dev/DevBar/), [`core/Sidebar`](/framework/core/Sidebar/), [`/layouts/shell/`](/layouts/shell/) and [`ai2`](/framework/ai2/) (`ext/Playground` also used it, deleted 2026-09-06 — see `core/Layout`).

**Names** (grip-zones, 2026-09-30) — so "where's the resize handle?" has one answer: this
widget is **the grip**, and it lives here, at `ext/grip`. Where it sits in AI 2's inbox, it
drags the edge between two named layouts — the **preview rail** (a flush stack of card
previews, one per line, the persistent list you pick from — [flush stack](/framework/design/layout/doc/rules.md), [list and detail](/framework/core/Layout/list-and-detail/)) and the **detail**
(whichever card's own page opens beside it). Both names are the site's own, not new coinage.

## Use

```js
import grip from "/framework/ext/grip/grip.js";

// inside the rail's own box, which must be positioned
grip({
    write: px => size(px),    // every move: px is the width (or height, on axis:"y") the pointer implies; return what you applied
    done: w => remember(w),   // optional — once, on release, the size you let go of; skip it if write() already persists on every call
    reset: () => size(null),  // optional — a double-click, with no argument, for "put the size back"
    from: "start",            // omit for a rail docked at the screen's END (drawer, dev rail)
    mirror: from === "start", // the default — override only if your box isn't flush against a rail edge · [doc/decisions.md](./doc/decisions.md)
    axis: "x",                 // the default — "y" drags a HEIGHT instead, block axis instead of inline (the ✦ sheet's own top handle, ext/drawer/rail.js) · [doc/decisions.md](./doc/decisions.md)
});
```

## Watch out

- `axis: "y"` (2026-09-29) reuses `from`/`mirror` exactly as they already work — just read against the box's top/bottom instead of its left/right. Leaving `axis` out is byte-identical to before it existed. Responsive: a mouse still gets the slim hover-only strip on either axis; touch or a coarse pointer gets a visible, thicker bar with a bigger invisible hit area, on both axes, from one shared CSS rule · [doc/decisions.md](./doc/decisions.md)
- `from` picks the pointer arithmetic (which edge of the PARENT is pinned); `mirror` (defaults to matching `from`) picks which side the strip and its lit line sit on. Every rail wants the default. A grip whose OWN box is repositioned every frame by the caller, not flush against a moving rail edge — `ai/v/3`'s column split — passes `mirror: false` to keep the line under its own local start regardless of `from` · [doc/decisions.md](./doc/decisions.md)
- A start-docked rail is stamped `.grip-start` and `grip.css` mirrors strip, lit line AND pill together; never flip the strip in your own stylesheet, which leaves the line 10px off the boundary · [doc/decisions.md](./doc/decisions.md)
- The pill's `top` is relative to the grip's OWN box, not the viewport — grip.js reads `getBoundingClientRect().top` on every move and subtracts it, or the pill lags by however far the grip sits down the page · [doc/decisions.md](./doc/decisions.md)
- Mount it **inside** the rail's box. A plain, unmirrored grip never straddles its edge — a strip hanging outside survives a SHUT rail's slide as an invisible `ew-resize` column down every page, and `setPointerCapture` swallows the whole gesture, not just the click. `.grip-start` is the one exception, on purpose, below · [doc/decisions.md](./doc/decisions.md)
- **Two invisible zones, not one** (grip-zones, 2026-09-30): a ~50px SHOW zone (`.grip-near`, toggled by grip.js from `document`) just makes the line and the pill visible from further away — no hit-target, steals no click. The real GRAB zone is the small `.grip` box itself, and on a `.grip-start` dock (every master–detail split so far — AI 2's rail, the Playground tree) it is asymmetric: mostly reaching OUT across the boundary (`--grip-out`, ~8px, into the sibling pane, which has no scrollbar to lose), pulled back to ~1px on its own interior side (`--grip-in`) — that interior side is where a scrolling rail keeps its OWN scrollbar, flush against the same edge. Touch is unchanged: no `.grip-near`, and `.grip-start` resets back to flush-and-symmetric under `(pointer: coarse), (hover: none)` · [doc/decisions.md](./doc/decisions.md)
- `html.grip-sizing` carries `--rail-ease: 0s`; without it the shell's push trails the pointer by 0.18s · [doc/decisions.md](./doc/decisions.md)
- The width is measured from the rail's **own** inline-end edge, not `innerWidth` — a rail parked beside another one would size past the pointer · [doc/decisions.md](./doc/decisions.md)
- `rem`, never `em`: a grab target does not scale with the type beside it · [doc/decisions.md](./doc/decisions.md)
- Hidden below 34em — both rails stop being side rails around there; a rail that stacks at a WIDER breakpoint than that (`core/Sidebar`'s 52em, `/layouts/shell/`'s 44rem) needs its own extra override, since 34em is `grip.css`'s own floor, not every consumer's · [doc/decisions.md](./doc/decisions.md)
- Every drag starts with no size, and `pointercancel` ends a drag like `pointerup` (2026-09-30). Before, a plain tap re-sent the LAST drag's size to `done`, and a touch the browser took back left the page stuck in resize mode. On `axis: "y"` only, the box's edge stays under the finger (where in the strip it landed is kept); the x rails still size to the pointer itself · [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md)
- `done` and `reset` are both optional — pass only the ones your rail needs. A `write()` that already saves on every call (`/layouts/shell/page.js`'s `size_rail()`) has no use for `done`. · [doc/decisions.md](./doc/decisions.md)

## More

- [doc/decisions.md](./doc/decisions.md) — why it left `dev/DevBar`, the offscreen record, what `write`/`done`/`reset` are for, and the 2026-09-18 merge with `core/Sidebar` + `/layouts/shell/`'s own copied gesture
- Files: `grip.js` (the pointer choreography), `grip.css` (the strip, the pill, the sizing class)
- [Overview](/framework/ext/grip/) — the page
