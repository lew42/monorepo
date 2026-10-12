# grip-fix — the drag handle follows the mouse, on the line, the right way round; the dev bar hides fully

Minion: Sonnet, effort high. Session id `5ae94a7c-5722-489c-8584-15f4afd363d2`. You are IN A
WORKTREE (the launcher says where, and your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`, `css`,
`ui-test` (this task is proven by driving gestures headless and screenshotting after each).

## The owner's words (2026-09-22 18:07, verbatim)

> the resize handle between the columns on the AI dashboard page is broken. It works inversely
> to what it should. You drag right and it resizes to the left. Also, the hover grip thingy
> follows the mouse, but it's not on top — it's about 200 pixels below the mouse. Also, it's
> offset to the right, instead of being on the line where you drag, it's offset like four or
> five pixels to the right. And I believe that was because the dev bar needed to be that way …
> when the dev bar was at zero pixels off the screen to the right, and you hovered near the
> right edge of the screen, you'd get part of that little drag bar showing … So I had you move
> it to the right, but that doesn't work either. What we need is the dev bar to just have the
> resize handle actually follow the mouse, right on the border where we're dragging, and then
> just move the dev bar off screen by more than like 10 pixels so that it's not hanging on in
> the screen.

## What exists

`public/framework/ext/grip/` — the ONE resize handle (`grip.js` factory, `grip.css`; its
`readme.md` and `doc/` name past offset bugs: "the grip is offset in a strange way" at
`grip.css:32`, the pointer-sizing note at `grip.js:41`). Users: `ai/v/3/page.js:1508` (the
master-detail column split on the AI board — `board-declutter` may have just edited that file;
read its landing) and `dev/DevBar/DevBar.js:77` (the dev bar's rail). `grip.css:43` places the
knob with `top: var(--grip-y, 50%)` and `translate(-50%, -50%)` — `--grip-y` is meant to
follow the pointer.

## Deliverables

1. **Direction.** On `/framework/ai/timeline/` (a card open, the two-column split) dragging the
   handle right widens the left column, left narrows it — measured: pointer moved +120px →
   left column width +120px (±2). Find why it is inverted (the `write`/`done` sign, a
   right-anchored rail treating the delta as the dev bar does, `inset-inline-start` under a
   flipped strip) and fix the cause in `grip.js` so BOTH users are right: the dev bar (right
   edge, drag left = wider) and the column (left edge, drag right = wider) — an `edge` or
   `side` option, not two code paths.
2. **The knob is under the pointer, on the line.** Hovering the strip puts the knob's centre at
   the pointer's y (±2px) and its x on the border line (±1px) — no 200px lag, no 4–5px
   rightward offset. Remove the offset that was added for the dev bar; the dev bar case is
   solved by 3.
3. **The dev bar hides fully.** When hidden, the dev bar sits at least 12px past the viewport's
   right edge, so no part of its grip strip is hoverable or visible at the screen edge; when
   shown, its grip is on its left border like any other. Measure the rail's `getBoundingClientRect().left`
   hidden vs `innerWidth`.
4. **Proof with `ui-test`:** headless on your worktree server: hover the column grip at three
   y positions and screenshot each (knob under the pointer); drag +120 and −120 and log the
   widths before/after; the dev bar hidden — screenshot the right edge zoomed; the dev bar
   open — drag its grip and log the width change sign. Zero console errors. Shots into your
   task dir `shots/`.

## Fence

`public/framework/ext/grip/**`, `public/framework/dev/DevBar/DevBar.js` + its css (the
hide offset only), `public/framework/ai/v/3/page.js` (only the grip call, Edit), your task
dir, `ai/2026-09-22/page.js` `children:`. Land by the launcher's patch into the main tree.

## Length

Fewer lines than before if the offset hacks come out. Landing report: five sentences and the
three measured numbers.
