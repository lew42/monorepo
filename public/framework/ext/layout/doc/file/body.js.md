## What this file is

What a selection *reads as*, once `panel.js` has decided something is selected:
a name, the source line that would rebuild it, and the groups of controls that
apply. `panel.js` owns the drawer's open/close lifecycle and hands this file the
selection, whatever `layout.context()` registered above it, and a redraw
callback; this file never touches the drawer's own chrome.

## `head()` vs `body()`

`head()` is the pinned top strip (name, `copy`, `✕`) — see
[The drawer](/framework/ext/layout/doc/drawer/#the-panels-own-shape-and-what-survives-a-re-render)
for why it is pinned rather than scrolling with the rest. `body()` is everything
below it, and it is the file's real logic: source line, then `container()` **or**
page words (never both — see
[Selection](/framework/ext/layout/doc/selection/#page-words-not-container-words)),
then the item group if the element's parent lays it out, then every registered
`context()` extra.

## `source()` and the CHROME filter

`source($el)` reconstructs the pasteable call — `div.c("flex gap auto")` — by
reading the element's live class list and stripping this widget's own chrome
classes (`layout-*`, `active-*`, `in-path`) via one regex. Those classes are
real DOM state the widget itself wrote or the Router marks on navigation; neither
is vocabulary a caller would ever type, so neither belongs in the readout.

## `container()` redraws itself on mode change

Switching `flex` ↔ `grid` calls `redraw()` rather than patching in place, because
the chip vocabulary depends on the mode (`CHIPS.flex` and `CHIPS.grid` are
different lists) — there is no shared "container chips" list to patch, only two
different bars that happen to render in the same slot.

## Improvements

1. **`CHIPS` and `ITEM` are file-local constants with no cross-reference to
   `words.js`'s `BOX`/`PAGE`.** Both files independently enumerate "which words
   apply to which context," and they agree today only because someone kept them
   in sync by hand. A shared source (even just a comment in each pointing at the
   other) would make the next word addition less likely to update one and miss
   the other. *(medium, important)*
2. **`laid_out()` duplicates the `flex`/`grid` class check `pointed()` already
   makes in `layout.js`.** Two small, currently-identical predicates in two
   files; harmless while they agree, a silent behaviour split if one is ever
   edited without the other. *(simple, useful)*
3. **`nothing()`'s copy is a single long sentence covering three unrelated
   affordances** (click a box, click a region, click the sliders chip). True and
   complete, but a first-time reader has to parse all three before doing any of
   them; a short list would scan faster in a 19rem-wide panel. *(simple,
   speculative)*
