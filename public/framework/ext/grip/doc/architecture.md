# Grip architecture — one resize edge, the caller owns the size

`ext/grip` is the resize strip on the inline or block edge of a rail: one function, `grip()`, returns a small element that the rail mounts inside its own box. The module owns only the pointer gesture and the hover pill; what a size *means* stays with the caller. Entry point: [`grip.js`](../grip.js) (`export default function grip`), styles in [`grip.css`](../grip.css).

## One resize edge for every rail

**Decided:** every rail on the site resizes through `grip()`; no rail carries its own drag handler.
**Why:** two copies of the same gesture (`core/Sidebar` and `/layouts/shell/`) had already drifted, and the fix (a double-click reset) had to be made twice.
**Instead:** a bespoke handler per rail. Rejected 2026-09-18; the copies were deleted.
**Detail:** [decisions: why it lives in `ext/`](./decisions.md#why-it-lives-in-ext-not-dev).

## The caller owns the size; grip owns the pointer

**Decided:** `grip({ write, done, reset, from, mirror, axis })` only moves the pointer. `write(px)` says what a size means, `done(size)` runs once on release, `reset()` on double-click.
**Why:** a width is a custom property, a clamp and a storage key, and each rail answers those differently.
**Instead:** a `target` element option, which would have made grip know every rail's CSS. A `side` option was rejected: nothing needs a left rail yet.
**Detail:** [decisions: `write` / `done`](./decisions.md#write--done-not-a-target-element).

## Hidden until you are near, grabbed only on the strip

**Decided:** a ~50px SHOW zone, listened to on `document`, toggles `.grip-near` to reveal the line and pill. Only the small `.grip` box takes the pointer.
**Why:** a 50px hit box sat on top of the rail's own scrollbar and stole its clicks.
**Instead:** a wide invisible hit box. Rejected 2026-09-30 (grip-zones).
**Detail:** [decisions: two zones](./decisions.md#two-zones-not-one--and-why-only-grip-start-gets-the-asymmetric-box-grip-zones-2026-09-30).

## The grab box stays inside its rail, except on a start dock

**Decided:** a plain `.grip` sits wholly inside its rail's box. A `.grip-start` (start-docked rail) reaches ~8px out across the boundary and only ~1px in, toward the rail's own scrollbar.
**Why:** a box straddling a shut rail's edge left an invisible `ew-resize` column down every page; the start dock has no collapsing rail, so its outward reach is safe.
**Instead:** a symmetric straddle (rejected, it blocked scrollbars).
**Detail:** [decisions: two zones](./decisions.md#two-zones-not-one--and-why-only-grip-start-gets-the-asymmetric-box-grip-zones-2026-09-30).

## A start-docked rail mirrors strip, line and pill together

**Decided:** `from: "start"` stamps `.grip-start`, and CSS mirrors the strip, lit line and pill as one unit.
**Why:** flipping only the strip left the line 10px short of the boundary it drags.
**Instead:** `from` moved the arithmetic only, and each caller fixed its own CSS. Rejected 2026-08-29.
**Detail:** [decisions: `from: "start"`](./decisions.md#from-start--and-why-the-visual-flip-came-home-2026-08-29).

## `mirror` names the side; `axis: "y"` reuses both

**Decided:** `mirror` (default `from === "start"`) picks the side of the box's own edge for the strip. `axis: "y"` drags a height with the same `from`/`mirror` rules on the block edges. The pill rides `--grip-x` on that axis, `--grip-y` on x.
**Why:** `ai/v/3`'s column split needed the start arithmetic without the start mirror; the mobile ✦ sheet needed a height grip.
**Instead:** a second module for vertical grips, which would have forked the gesture.
**Detail:** [decisions: `mirror`](./decisions.md#mirror-the-pill-fix-and-the---grip-y-frame--2026-09-22) · [decisions: `axis`](./decisions.md#axis-x--y--the-same-strip-rotated-grip-everywhere-2026-09-29).

## Pill coordinates are relative to the grip's own box

**Decided:** `--grip-y` (or `--grip-x`) is the pointer minus the grip's own `getBoundingClientRect()` top (or left) on every move.
**Why:** a grip sitting partway down the page put the pill ~200px low when read against the viewport.
**Instead:** raw `clientY`, which was correct only for rails flush with the top.
**Detail:** [decisions: the `--grip-y` frame](./decisions.md#mirror-the-pill-fix-and-the---grip-y-frame--2026-09-22).

## Resizing turns off the page's own easing

**Decided:** `html.grip-sizing` sets `--rail-ease: 0s` for the whole drag.
**Why:** the shell eases its push by 0.18s; a drag writes every frame, so the page trailed the pointer.
**Instead:** no class on `<html>`, which left the lag visible. Only reason the module touches `<html>`.
**Detail:** [decisions: the three facts](./decisions.md#the-three-facts-carried-from-2026-08-16--one-of-which-had-already-been-superseded).

## Every drag starts blank; a tap or a cancel ends it cleanly

**Decided:** `pointerdown` clears the last size, and `pointerup` and `pointercancel` both end the drag. `done` runs only when a size was written in this drag.
**Why:** a plain tap re-sent the last drag's size and snapped the ✦ sheet to full height; a browser-taken touch left the page stuck in resize mode.
**Instead:** the old code kept the last drag's size, which is what fired the snap. Not reinstated.
**Detail:** [decisions](./decisions.md) (the 2026-09-30 notes on pointer cancel and tap).

## Touch gets a visible handle; the choice follows the pointer, not the width

**Decided:** `(pointer: coarse), (hover: none)` shows a bigger strip, always visible. A narrow desktop window keeps the slim hover-only strip.
**Why:** a hover-only 2px line means nothing to a thumb, and the owner asked for slim on desktop regardless of width.
**Instead:** a viewport-width rule, which would have made a narrow mouse window look like a phone.
**Detail:** [decisions: `axis`, touch section](./decisions.md#axis-x--y--the-same-strip-rotated-grip-everywhere-2026-09-29).

## Code check

Checked against `grip.js` and `grip.css` on 2026-10-13: no `⚠` mismatches. The old "wholly inside the box" fact in the log is superseded by the two-zones entry above.
