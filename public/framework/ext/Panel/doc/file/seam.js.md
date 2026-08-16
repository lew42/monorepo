## seam.js

What a seam offers when a click on it never became a drag: **hug or fill**, one
row per neighbour. Forty-five lines, extracted from `grip.js` on 2026-08-15 —
the one thing in that file that was not the divider. `grip.js` builds it, holds
it and opens it; nothing else in the module knows it exists.

## Two calls, and both of them are grip.js's

```js seam.js
export function menu()          // the empty popover, built under whatever is capturing
$pop.open(sides)                // fill it from the CURRENT data, then toggle
```

`menu()` takes no arguments because it needs none — it is created inside the
grip's own capture callback, so the captor puts it where it belongs, exactly as
`toolbar.js`'s `pop()` is created inside the bar's. Everything it draws arrives
at `open()` instead: `sides` is `[[item, el, mark], …]`, one entry per
neighbour.

⚠ **The neighbours are arguments, not lookups.** Reading them from here would
mean importing `workspace.js`, which reaches this file through `grip.js` — and a
**mutual import breaks only on deep reloads**. Same discipline as `random.js`'s
vocabulary and `toolbar.js`'s `T`: this file imports `View` and nothing else in
ext/Panel.

The **marks** (`←→` / `↑↓`) come in with the sides rather than being worked out
here, because the axis is the grip's own reading of the DOM (`sideways()`, which
is `.v` on the parent) and the grip is the only thing holding that element.

## Built empty, filled on the way open

```js seam.js
open(sides){
	if (!this.hc("on")) this.empty(() => sides.forEach(side));
	this.tc("on");
}
```

⚠ **Built once, it lied.** Every `on` in this menu is a read of a neighbour's
`mode`, and the inspector — or that panel's own bar — writes that `mode` from
somewhere with no part of this menu, so a seam reopened after an edit elsewhere
still marked the mode from the first time you clicked it. Filling on the way
open is the smallest thing that makes reopened chrome honest, and a reopen is the
only moment its state can be read fresh without a full reactive resync. It is the
same shape `toolbar.js`'s `pop()` uses, for the same reason. Measured: hug set
from the panel's own bar, seam reopened, `fill` no longer marked — the menu
followed.

The popover is created **eagerly and empty** and is `display: none` until it
opens (`.panel-pop` in `toolbar.css`), so a closed menu costs the zero-width
divider no layout and hit-tests for nothing. Measured on `/full/`: 15 grips, 15
popovers, 0 of them visible or reachable.

`open()` is assigned onto the View (`div.c("panel-pop").assign({ open })`) so the
grip holds **one** handle: `$pop.hc("on")` while tracking, `$pop.rc("on")` on
`pointerleave`, `$pop.el.contains(e.target)` in the click-retarget bail, and
`$pop.open(sides)` on a click. Two names for one popover was the alternative.

## ⚠ `hug` is a leaf's word, and this menu was the way in

```js seam.js
if (!item.leaf()) span.c("panel-grip-side");

const offered = MODES.filter(mode => mode !== "hug" || item.leaf());
```

A hugging **split** measures children that size themselves from it: the panel
collapses to 0px and takes its own grips with it, leaving nothing to point at.
The bar withholds the toggle from a split (it sits inside `if ($body)`) and the
inspector withholds `mode` the same way — so a seam beside a split was the last
door, and it is shut here. `fill` is offered on both sides either way: it is what
a split already is, and it is the way back from a hug.

⚠ **The empty `span` is not decoration.** `grip.css` lays the popover out as
`grid-template-columns: auto auto auto` — one row is *mark, hug, fill* — so a
side that contributes two cells instead of three pulls the next row's mark up
into the hole. The split's row keeps hug's cell and leaves it blank. Measured
across all four split-neighbour seams on the demo page, on both axes: the two
`fill` buttons land at the same x every time (756, 450, 1033, 756).

## It emits classes it does not own

`.panel-pop` is `toolbar.css`'s block, `.panel-grip-side` and the placement over
the pill are `grip.css`'s, and `.panel-btn` is styled by both. This file loads no
stylesheet of its own — it is reached only through `grip.js` (which loads
`grip.css`) inside a workspace (which loads `toolbar.css`), so both are always
already there. ⚠ Calling `menu()` from anywhere else would draw an unstyled box
and nothing would say so.

## Improvements

1. **The three-column grid is a silent contract between two files.** `side()`
   emits a blank cell because `grip.css` says `auto auto auto`; change the column
   count there and this file has to be edited to match, with nothing failing in
   between. A `--panel-cols` token like the bar's pickers use would at least put
   the number in one place. *(simple, useful)*
2. **`open()` is assigned onto a View instance.** It is one line and it keeps the
   grip to a single handle, but it is the only place in the module where a View
   grows a method — a `Menu extends View` would say so louder and cost a
   `classify()` name nobody wants. *(simple, speculative)*
3. **`mode: "hug"` from this menu used to collapse a `cq`-sized template to 0px**
   (517.8 → 0, measured) — fixed in `panel.css`, where hug now *declares* an
   extent (`--panel-hug`) instead of measuring one: hugging a leaf from here takes
   it to 248.3px, the same 16em the bar's toggle gives. *(done)*
