# grip — decisions and record

*Extracted from `dev/DevBar/grip.js` + `grip.css` on 2026-08-18, when `ext/drawer`
needed the same edge. Conclusive, not current guidance — the readme is the index.*

## Why it lives in `ext/`, not `dev/`

`dev/` is dev-only chrome; `ext/drawer` **ships**. An `ext` importing a `dev` module
would invert that, so the shared part moved down to `ext/` and `dev/DevBar` imports it
like any other addon (it already imports `ext/Saver` and `ext/Ask`). Two callers was
the bar for extracting anything, and the second one arrived.

Nothing was left behind in DevBar: `dev/DevBar/grip.js` and `grip.css` are **deleted**,
and `DevBar.js` mounts the shared one with the two functions that were welded into the
old file's body —

```js
grip({ write: rail, done: width => set({ width }) });   // dev/DevBar/DevBar.js
grip({ write: size, done: w => localStorage.setItem(KEY, w + "px") });   // ext/drawer
```

## `write` / `done`, not a target element

The grip owns the **pointer choreography** and nothing else: capture on down, the pill
riding `--grip-y`, the class on `<html>`, release on up. What a width *means* — which
custom property, which clamp, which storage key — is the rail's own business, and the
two rails answer it differently (the dev rail writes `--dev-rail` on `<html>` through a
`localStorage` document; the drawer writes `--drawer-w` on `.app` through one key).
`write` returns the width it actually applied, and that clamped number is what `done`
is handed — so a rail cannot remember a width it refused to take.

## The three facts carried from 2026-08-16 — one of which had already been superseded

1. **The grip sits wholly inside the rail's box** (`inset-inline-start: 0`, no
   straddle, `width: 0.75rem`). This is the whole fix. Two separate bugs came from
   straddling: half the grip hanging past a shut rail's `translateX(100%)` left a 15px
   invisible `ew-resize` column down every page that pointer-captured the gesture; and
   at `2rem` it covered all 15px of `.pages`' scroll gutter, so the page's scrollbar
   could not be dragged. Record: `dev/DevBar/doc/docking.md`.
2. **`html.grip-sizing { --rail-ease: 0s }` travels with it.** `.app` eases its
   `padding-inline-end` by 0.18s (`framework.css`); a drag writes the width every
   frame, so eased, the page visibly trails the pointer. This class is the only reason
   the module touches `<html>` at all. It was `dev-sizing`; renamed on extraction,
   since nothing outside the two files it moved with ever named it.
3. **`--dev-grip: 2rem` and `translateX(calc(100% + var(--dev-grip)))` are NOT carried
   — they no longer exist.** That was the *morning* of 2026-08-16, a stopgap that slid
   the rail far enough to clear the half-grip that hung outside it. The same afternoon
   (`ai/2026-08-16/devbar-grip-scrollbar/`) the grip moved wholly inside the box and
   both the token and the `calc()` were deleted: a plain `translateX(100%)` clears a
   grip that is inside the box, and the two files could no longer disagree about a
   number they no longer shared. Re-introducing the token would restore dead weight and
   a second thing to keep in sync.

## Measured, 2026-08-18 (headless, dev socket blocked)

- **Shut drawer, shut dev rail** — grip box `1281→1293` at `innerWidth` 1280 and
  `3441→3453` at 3440: **0px on screen** at both. `elementFromPoint` down that column
  returns page content (`code-block`, `page`, `h3`), never the grip.
- **Shut drawer, dev rail OPEN** — the shut drawer lands at `1008→1312`, its grip at
  `1009→1021`, *exactly over the dev rail's own grip*. `elementFromPoint` there returns
  the **dev rail's** grip (`.dev-bar` is `z-index: 50`, `.drawer` is 40), and the dev
  rail still dragged 120px through it with the drawer staying shut. A grip wholly
  inside the box goes wherever the box goes — behind the other rail, or off screen.
- **Both rails resize**: drawer +160px → width 459 and `.app`'s reserved strip 459
  (one number, both directions); dev rail +200px → `--dev-rail` 266px → 466px.

## `from: "start"` — and why the visual flip came home (2026-08-29)

`ext/Playground`'s tree column docks at the shell's **start**, not the screen's end, so
`from: "start"` reads `edge = rect.left; px = clientX - edge`. Default `"end"` unchanged.

Shipped 2026-08-19, `from` moved only the *arithmetic* and left the visual flip to the
caller's own CSS. `playground.css` then flipped the **strip** to `inset-inline-end: 0` and
had no way to reach the `::before` — so the lit 2px line stayed anchored to the strip's
other side and drew **10px short of the boundary it drags** (measured: `.pg-tree`'s
tree/canvas boundary at 469.22, line at 457.22–459.22). That is what the owner reported as
"the grip is offset in a strange way".

`grip.js` now stamps **`.grip-start`** and `grip.css` mirrors the whole geometry under it —
strip *and* line together. `playground.css`'s override is deleted; a consumer states which
edge it docks on and compensates for nothing. Verified after: `gap_to_boundary` **0.00px**
on the tree, both Playground grips still drag ±100px exactly, drawer and dev rail
(`from` defaulted) byte-identical.

**The pill needs no mirror.** `inset-inline-start: 50%` with `translate(-50%, -50%)`
centres it in the strip, and a 0.75rem strip's centre is the same point measured from
either side.

**The remaining 1px is correct.** An end-docked rail's line lands 1px inside its boundary
because `position: absolute` insets resolve against the **padding** box and both rails
carry a 1px `border-inline-start`. The 1px `--line` border and the 2px `--prim` line sit
adjacent and read as one lit edge; pulling the strip out to `-1px` would start straddling
the edge that rule 1 above exists to forbid.

## Rejected

- **A `side` option.** Both rails dock at the inline end and grip their inline-start
  edge; an option with one value is API surface forever for a case that does not exist.
  The day a left rail appears, it is a parameter with a caller.
- **`innerWidth - clientX`** (what DevBar's copy did) — correct only for a rail flush
  against the screen edge. The drawer is offset by `--devbar`, so it would size past
  the pointer by exactly the dev rail's width. The grip reads its parent's
  `getBoundingClientRect().right` once, at `pointerdown`: that edge is pinned for the
  whole drag, and it is the same number for a flush rail.
- **An rAF throttle** (`ext/demo`'s `drag()`): `pointermove` already arrives once a
  frame, and this writes one custom property rather than re-laying-out a live render.
  Declined in `dev/DevBar`'s copy too, for the same reason.
