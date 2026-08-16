## grip.js

The divider between two panels, and everything pointer-driven about it: `grip()`
builds the element, tracks the pointer, resizes on a drag, and on a click that
never became one opens the hug/fill menu — which lives in
[`seam.js`](./seam.js.md) and is the only thing this file delegates.
`coalesce()` — the rAF pointer-move throttle — is exported from here and used by
nothing else. Its paint is `grip.css`.

## It writes grow fractions, not pixels

The grip reads its two neighbours' pixel sizes **once**, at `pointerdown`, then
writes `--panel-grow` as a fraction of their combined `grow` on every move — so
a split keeps its proportions when the window resizes, and only commits
(`item.set("grow", …)`) on `pointerup`. Verified across a 500px window change:
0.354 before, 0.354 after. `MIN = 40` clamps the delta so neither neighbour can
be driven below 40px.

Worked, on a 477px/477px pair dragged 70px down: `total` is 2, so `ga = 2 × (477
+ 70) / 954 = 1.147` and `gb = 2 − 1.147 = 0.853` — the two numbers that reached
`panels.json`.

## One handler, two jobs

`track()` runs on plain `pointermove` — the pill follows the pointer whether or
not a button is down — and pointer capture routes the whole drag back to the
same element, so the same handler keeps working off the strip. It bails while
the menu is open (`$pop.hc("on")`), because the menu is anchored to the same
two custom properties and would otherwise crawl away from the pointer.

`SLOP = 4`: nothing is written until the pointer has travelled 4px, so a click
cannot nudge the split. `dragged` is the same flag `pointerup` reads to decide
between committing and opening the menu.

## ⚠ The click-retarget trap

```js grip.js
return $grip.on("pointerdown", function(e){
	if ($pop.el.contains(e.target)) return;
```

The menu lives **inside** the grip, so its buttons' `pointerdown` bubbles here —
and one `setPointerCapture` retargets the ensuing `click` to the grip, killing
every button in the menu with no error anywhere. That bail is the only thing
keeping the menu alive: **anything interactive added inside the grip has to be
added to that test by hand.** The menu moved to `seam.js` and the test did not
move with it — `$pop` is still this file's element, built inside the grip's own
capture callback, and `contains()` still asks the one question that matters.

## The axis comes from the DOM, not from data

`sideways(el)` reads whether the parent carries `.v`. The grip holds no `Item`
of its own — which is also why `PanelDrag.before()` has to skip children that
miss in `Draggable.registry`, and why the neighbours are looked up through
`previousElementSibling`/`nextElementSibling` and the drag aborts quietly if
either is not a registered panel. It is also why the menu's `←→`/`↑↓` marks are
chosen *here* and handed to `seam.js`: this file is the only one holding the
element that knows which way the seam lies.

⚠ **`track()` clears the axis it is not writing.** It sets exactly one of
`--grip-x` / `--grip-y`, and a repaint flips a split's `dir` by toggling `.v`
*without rebuilding its grips* — so the offset this element rode on its old axis
stayed behind as an inline style, and the pill (and the menu anchored to it) drew
off the seam entirely. Measured: a pill 143px below a seam that had just become
horizontal; after the fix, a grip carrying `--grip-y: 30px` carries `--grip-x:
30px` and nothing else once its parent flips. `removeProperty` on the other
token, in the same two lines that write the one.

## ⚠ `pointercancel` ends a resize, exactly as `pointerup` does

An interrupted touch — the browser taking the gesture for a scroll, a system
dialog — fires `pointercancel` and **no** `pointerup`. With the commit sitting on
a `{ once: true }` `pointerup`, that handler simply stayed attached, and the next
unrelated click on that seam ran it: the abandoned drag committed, seconds later,
to a panel nobody was resizing. Measured before the fix: two live `pointerup`
handlers surviving a cancel, and a seam whose data said `1/1` while the next
click wrote `1.6/0.4`.

```js grip.js
const off = () => { el.removeEventListener("pointerup", commit); el.removeEventListener("pointercancel", abort); };
```

Named handlers taken off in pairs — the DOM removes a listener by reference, so
the `{ once: true }` form could not be undone. `abort()` writes each neighbour's
committed `grow` back to its inline `--panel-grow` and commits nothing, which is
`Draggable.cancel()`'s "put the DOM back" applied to a seam. Measured after: a
drag from `1.433/0.47` to `1.668/0.235`, cancelled, is back at `1.433/0.47`; the
grip is left holding one `pointermove`, one `pointerleave` and one `pointerdown`
and nothing else; and the next click on that seam opens the menu and writes
nothing.

## `coalesce()` — the pattern duplicated on purpose

A 240Hz mouse fires several `pointermove` events per paint and one move here
re-lays-out the whole workspace; `coalesce(el, move)` keeps only the latest and
runs `move` once per `requestAnimationFrame`. Lifted from
`ext/demo/stage.js`'s `drag()`, **not imported** — a widget has no business
depending on the demo chrome. The same lines exist a third time,
deliberately not copied, in `dev/DevBar/grip.js`.

⚠ Its teardown listens for `pointercancel` too, and cancels the queued frame:
an interrupted gesture fires no `pointerup`, so the queue would otherwise stay
bound and go on resizing the split from the next hover of the seam.

## Improvements

1. **`coalesce()` is a third copy of a small utility** and sits in a file named
   after the divider rather than anything to do with throttling. It is also the
   whole of this file's remaining excess: the divider is 87 lines and the
   throttle is the other 21. Unifying it would mean a shared home neither
   `ext/demo` nor `ext/Panel` can own — `framework/util/raf_drag()` is the
   standing proposal, and it is the same one the site audit files under
   duplication. *(medium, useful)*
2. **The neighbours are found through the DOM on every `pointerdown`.**
   `previousElementSibling` → `Draggable.registry` → `.item` is three hops that
   a grip built beside its two panels could have been handed instead. It costs
   nothing at panel counts a person can see, and it is what keeps `grip()`
   argument-free. *(simple, speculative)*
