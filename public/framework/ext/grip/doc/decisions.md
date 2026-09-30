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

## 2026-09-18 — two more callers, and the one piece they needed that grip didn't have

`core/Sidebar` and `/layouts/shell/Shell.js` each had their own hand-copied version of
this exact gesture (pointer capture, a drag, a double-click reset) — `Sidebar`'s own
comment named where it copied it FROM, the same day it was written
(`core/Sidebar/doc/decisions.md`, "the resize mechanism is `/layouts/shell/`'s
`Shell.grab()`, copied, not imported"). The overlap study
(`ai/2026-09-18/overlap-study/overlap.md`, `overlap-shared-resize-grab`) flagged exactly
that: a gesture copied from one file's own comment is the cheapest possible thing to
un-copy, the same day.

**Everything both callers needed already existed except one thing.** `write`/`done`
already covered "what does a width mean" and "remember the one I let go of." What
neither copy had a grip equivalent for was **double-click resets** — both `Sidebar.grab()`
and `Shell.grab()` had their own `dblclick` handler calling `size(null)` /
`size_rail()` with no argument, and `grip.js` had no hook for a caller to supply that
at all. Added: an optional `reset` callback, wired to the strip's own `dblclick`,
firing with no argument — "what reset means" is exactly as much the caller's business
as "what a width means" already was for `write`.

**`done` became genuinely optional, not just unused by convention.** `Shell`'s own
`page.size_rail(px)` already saves on every call, not just on release (it always has —
the clamp lives in CSS, so there is nothing to postpone), so its `grip()` call has no
use for a `done` at all. The old code was `if (width) done(width);`, which would have
thrown calling `undefined` as a function the moment a caller left `done` out — changed
to `done?.(width)`, matching `reset` and making the contract honest: pass what your
rail needs, skip what it doesn't.

**Both merges deleted more CSS than JS.** `Sidebar.css`'s `.sidebar-grab` block (25
lines: a straddling 10px target, a `::after` line, a `-grabbing` class) and
`shell.css`'s `.std-shell-grab` block (26 lines, the same shape) are both gone —
`grip.css`'s own `.grip`/`.grip-start`/`.grip-pill` draws both rails now, which also
means both rails' resize handle moved from straddling the track's border (half in,
half out) to sitting wholly inside it, this module's own rule 1 above. Total, across
both `.js` files and both stylesheets: 101 lines deleted, 57 added, a net 44-line
reduction (`core/Sidebar/doc/decisions.md` has the hunk-by-hunk count) — bigger than
the overlap study's own ~30-line estimate, which only ever measured the two `.js`
files against each other and never looked at either file's CSS.

## `mirror`, the pill fix, and the `--grip-y` frame — 2026-09-22

Three bugs the owner reported together, on `ai/v/3`'s column split (`page.js:1508`):
dragging right narrowed the LEFT column instead of widening it, the knob trailed the
pointer by ~200px vertically, and it sat 4–5px right of the actual drag line. A fourth,
adjacent: the dev bar's hidden position left its grip strip exactly 0px off the
viewport's right edge — findable by a hover right at the screen's edge — which is what
an earlier session's fix for the 4–5px offset was reaching for and never actually
solved. `task.jsonl` (`ai/2026-09-22/grip-fix/`) has the measurements.

**Direction.** `ai/v/3` mounts grip as a full-bleed sibling of both columns and moves
it with an inline `left: px`, so its own box's LOCAL LEFT is always the true boundary —
the same visual placement `from: "end"` already gives every rail (dev bar, drawer). But
the WIDTH it needs is the LEFT column's, which needs `from: "start"`'s arithmetic
(`edge = rect.left`). No existing combination of `from` gave both: `from: "start"` also
stamped `.grip-start`, which mirrors the strip to the box's own right — 12px off the
boundary this consumer actually draws at. Added `mirror`, defaulting to `from ===
"start"` (right for every rail, where the parent's pinned edge and the strip's own edge
are opposite sides of the same moving box) and overridable — `ai/v/3` passes `from:
"start", mirror: false`. Verified: pointer +120px → left column width +120px exactly,
both directions, `.grip` box.left − `.v3-split` box.left before and after.

**The knob's y.** `--grip-y` was set from raw `e.clientY`, but `top: var(--grip-y)` on
`.grip-pill` resolves against `.grip`'s OWN padding box, not the viewport — correct by
coincidence for every existing rail (`inset-block: 0`, own top already IS the viewport's
0) and wrong the instant a consumer's box sits partway down the page. Now reads
`this.el.getBoundingClientRect().top` on every move and subtracts it. Verified: pill
centre y equalled the pointer's clientY exactly at three y positions on the column
split (100, 450, 800).

**The knob's x.** `.grip-pill` centred itself in the whole 0.75rem strip
(`inset-inline-start: 50%`), which is only "on the line" when the line itself runs
through the strip's centre — true of nothing here, since rule 1 above puts the strip
wholly on ONE side of the boundary and the `::before` line at that same side's edge.
The pill was 6px into the rail from the true boundary on every consumer, all along —
what the owner's "4–5px right" was seeing on the dev rail itself, before this task ever
touched `ai/v/3`. Changed to `inset-inline-start: 0` (matching `.grip::before`) with a
mirrored `.grip-start .grip-pill { inset-inline-start: 100% }`, so the pill is what
`.grip::before` already was: centred exactly on the box's own edge, whichever edge that
is. Verified: pill centre x equalled `.grip`'s own `getBoundingClientRect().left`
exactly, both classes.

**Why the earlier "move it to the right" attempt (named in the owner's brief, not found
as code — likely this same 50%-centring, read as intentional headroom rather than as a
bug) never worked:** it treated the KNOB's offset as the fix for the DEV BAR's hidden
position showing at the edge. Those are unrelated boxes — moving the knob does nothing
for the rail's own geometry. Deliverable 3 below is the actual fix for that; deliverable
2 above just needed the knob to stop being offset at all, everywhere.

**The dev bar's hide.** `transform: translateX(100%)` moves a flush-right rail by
exactly its own width — its hidden LEFT edge lands exactly on `innerWidth`, 0px past
it, so the 12px grip strip just inside that edge is findable by a hover at the very
last pixel of the screen. Changed to `translateX(calc(100% + 16px))` — the rail's own
fixed margin, comfortably past the strip's 12px. Verified:
`.dev-bar.getBoundingClientRect().left − innerWidth` reads 16 both hidden and after a
reopen/close round trip; open, unchanged (`transform: none`, grip on the left border).

## `axis: "x" | "y"` — the same strip, rotated (grip-everywhere, 2026-09-29)

The owner's words: one resize handle, everywhere — columns (already done) AND
vertical sections, starting with the mobile ✦ sheet's own top edge
(`ext/drawer/rail.js`, `.drawer-rail-sheet`, capped at `50dvh` by default).

**Reused, not rebuilt.** Every fact this file already recorded about `from` and
`mirror` — which edge of the PARENT is pinned, which side of the box's OWN
edge the strip sits on, why the strip stays wholly inside the box, why `edge`
is read once at `pointerdown` — carries over unchanged, just read against the
block axis (top/bottom) instead of the inline one (left/right) when
`axis: "y"`. `on_x = axis !== "y"` is the one branch point in `grip.js`;
every line after it either reads `rect.left/right` or `rect.top/bottom`,
`e.clientX` or `e.clientY`, by that one flag. Leaving `axis` out takes neither
branch's new code at all — traced line by line, it is the exact code that
shipped before this task, same classes, same pointer math.

**Two custom properties, not one, because the pill's CROSS axis flips too.**
The x-axis pill already rode `--grip-y` (the vertical position along a
*vertical* strip). A y-axis strip is horizontal, so its pill rides the
*horizontal* position instead — a second property, `--grip-x`, added rather
than repurposing the first, so a page with both an x-grip and a y-grip open
at once (not true yet, but the "planned vertical split" the owner's brief
names might be) can never have one overwrite the other's custom property by
accident.

**The 34em hide rule needed an exemption.** `@media (width < 34em) { .grip {
display: none } }` exists because both SIDE rails stop being rails around
that width — an `ew-resize` strip down an inline edge resizes nothing on a
screen that narrow. The new `.grip-y` is the opposite case: its only caller
so far, the ✦ sheet, exists **only** below that width (`ext/drawer/rail.js`
is a `(max-width: 52em)` rail). Left unexempted, the rule would have hidden
the sheet's own handle at exactly the sizes deliverable 5 tests it at (400px,
touch). Fixed with `.grip:not(.grip-y)`.

**Touch/coarse pointer, one shared rule, both axes.** A hover-only 2px line
means nothing to a thumb — there is no hover to reveal it on touch, and 2px
is not a target you can reliably land a finger on. `@media (pointer: coarse),
(hover: none)` makes the strip itself bigger (0.75rem → 1.25rem) and its lit
line thicker (2px → 4px) and visible **at rest** (opacity 0.5, not 0) — on
whichever axis the strip is. `touch-action: none` already covered both axes
(it was never axis-specific). Verified headless: at 1920×1080 with a real
mouse the strip measured 12px (0.75rem) and stayed invisible until hover; at
400×800 with touch emulation it measured 20px (1.25rem) and was visible
immediately, before any pointer event at all — both numbers are `rem`
measured at the browser's default 16px root font size, the same assumption
this file's own `rem`-not-`em` rule at the top already leans on; a reader
zoomed past that default sees the same *ratio*, not these exact pixels. A
narrowed **desktop** window (500px, mouse, no touch)
still got the slim 12px hover-only strip — the rule reads pointer capability,
never viewport width, which the owner's brief asked for explicitly ("on
desktop keep it slim… on touch or mobile, show a visible handle").

**The sheet's own height: `max-block-size`, a ceiling, not a forced size.**
`rail.css` reads `max-block-size: var(--sheet-h, 50dvh)` — the exact property
the owner's brief names. This is deliberately a *maximum*: a short, empty
sheet (nothing said yet) renders at its own natural content height, however
small, never stretched up to fill the cap. Measured headless: a brand-new
sheet with no saved height and no messages rendered at 188px, well under the
800px-tall test viewport's 400px half — proving the "or its content height,
if smaller" half of deliverable 3 actually took effect, not just the 50%
default. Dragging still works as expected once there is enough content to
reach the cap (verified with 14 seeded messages: 188px → 337px, both the
rendered box and `getComputedStyle().maxBlockSize` agreeing) — a real
conversation, unlike a fresh test page, reaches this within a few exchanges.

**The grip needed room of its own above the header.** The strip is absolutely
positioned at the sheet's own top edge, inside whatever the sheet's own
top padding reserves — the identical trick both side rails already use for
their vertical strip (this file's rule 1, "the dead strip both rails already
have"). `0.9em` of existing top padding already cleared the desktop strip
(12px) but not the bigger touch one (20px), so `rail.css` bumps
`padding-block-start` to `1.6em`, but **only** inside the same
`(pointer: coarse), (hover: none)` query the thicker strip itself uses — a
mouse sees no spacing change at all.

**The remembered height is its own localStorage key.** `lew42-drawer-rail-
sheet-h`, never the drawer's own `lew42-drawer-w` (`ext/drawer/drawer.js`) —
two different rails on the same device would otherwise read and overwrite
each other's number. Both `getItem` and `setItem` are wrapped in try/catch
(the owner's own words) — a phone in private browsing throws on `setItem`,
not only on a blocked `getItem`, and either one throwing should leave the
sheet usable, just not remembering, rather than breaking the open. Only a
REAL drag writes this key (`done`, on `pointerup`) — the automatic 50%-or-
content default on an untouched sheet is never persisted, so it keeps
tracking the sheet's own content on every open until the reader actually
drags the handle once, on that device.

**Verified with real pointer events, not just Playwright's touch API.**
`page.touchscreen` alone does not reliably fire the `pointerdown`/
`pointermove`/`pointerup` sequence this module is built entirely on, so the
proof drives those events directly (`el.dispatchEvent(new PointerEvent(...,
{ pointerType: "touch" }))`) — the same sequence a real phone's WebKit/Chrome
delivers. Full run, screenshots and numbers:
`ai/2026-09-29/grip-everywhere/build/shots/`.

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
