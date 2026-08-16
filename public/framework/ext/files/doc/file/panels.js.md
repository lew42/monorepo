# `panels.js`

The arrangement: `files()`'s three regions as [ext/Panel](/framework/ext/Panel/)
leaves, wired to one shared selection. It exists as its own file for two
reasons — `files.js` was already at a screen, and this is the only module in
the pair that imports the Panel stack, which lets `files.js` reach it lazily
and keep that cost off every page on the site.

The full argument, including what the flex arrangement it replaced was doing
and why nothing is persisted: [panels](../panels.md).

## `workspace({ saver, templates, seed })` — three keys, one call

The same seam `ext/editor` builds its five-region shell from. `templates` is
this browser's `T` vocabulary, so every bar in it offers `blank tree source
about` and nothing else — ext/Panel withholds `random` from any workspace
running its own vocabulary, and the site's twenty-eight section bands never
appear.

`blank` is in the vocabulary because `Panel.defaults.template` is `"blank"`: a
reader who splits a region gets a fresh leaf holding that name, and a name the
vocabulary lacks draws nothing and warns. `about` is added only when the caller
passed the hook.

## The selection is a closure variable, not panel data

A panel's `data` is the document ext/Panel would persist, and the shown file is
not part of how the room is arranged — so `state.path` lives here and the
regions read it as they draw.

- **One delegated `click`** on the workspace root, so every tree panel is
  wired, including one split off after the fact. The row carries `data-path`;
  nothing here holds a view.
- **`show()` walks rather than holds.** `root.walk()` finds every leaf whose
  template is in `READS` and calls ext/Panel's exported `repaint()` — its own
  answer to "a control in one panel redraws another". Two source panels side by
  side both track the selection (verified live), and a region the reader closed
  is not there to repaint.
- **The tree is exempt from that walk.** `mark()` toggles the class across
  every live tree instead, because repainting would rebuild the DOM and throw
  away the scroll position of the row just clicked. A tree that left the DOM is
  dropped from the set on the next pass — the same self-unbinding hygiene
  ext/Panel's own inspector uses.

## The axis is seeded, never queried

`seed()` reads `window.innerWidth` once and lays a column below `STACK` (640),
a row above it. This is not a shortcut around a media query: **a split holds
its axis at every width** is ext/Panel's recorded decision, and a seed chosen
at roll time is the escape hatch it names. The stacked shares differ from the
row's because a stacked tree needs more of the block than a column of it needs
of the row — one share left the list 82px tall on a 390px viewport, under three
files of it.

## `panel-controls` on the tree

The bar is an overlay that lights on hover, and the tree's top edge is a click
target — so the tree claims the reserve (`panel.css` pads the body by
`--panel-bar-h`) and the other two do not. Found by driving it: the bar sat on
`Doc.js`, the first file in every module's list.

## Improvements

1. **`STACK` and the two sets of shares are five magic numbers** in a file whose
   whole job is the arrangement. They are honest defaults and a reader can drag
   past all of them, but a caller wanting a source-first browser has no way to
   say so short of editing this file. A `seed` option is the obvious shape and
   deliberately not built — an option is API surface forever, and no caller has
   asked. *(medium, speculative)*
2. **Nothing re-seeds on resize.** Stated as Open in the readme rather than
   fixed: re-rolling would discard an arrangement the reader made, and
   ext/Panel has no notion of a layout that is still "untouched". *(medium,
   speculative)*
3. **`READS` is a second list of region names beside `REGIONS`**, and adding a
   region that draws the selected file means remembering both. Three entries
   and one file apart, so it is legible today; derivable from a flag on the
   entry (`reads: true`, the shape ext/Panel's own `focus: true` takes) if a
   fourth ever arrives. *(simple, speculative)*
