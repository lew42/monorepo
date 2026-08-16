# `App.js`

Boot, and the one flat container. There is no Router yet — `resolve()` walks
`location.pathname` one segment at a time through pages that are already in
memory, because `Page.class.js` in this tier declares children as direct
imports. `mark()` is the whole of what this tier says about appearance: two
classes plus a `data-mode` attribute, everything else left to CSS.

## The captor fix

`render()` sets `View.set_captor(this.$pages)`, not `$app`. An earlier version
captured `$app`, so every `page.render()` briefly built its view beside the
sidebar and only looked right because `mount()` reparented it one line later —
any other caller of `render()` would have stranded a view there, invisible only
because `.page { display: none }` is the default. Fixed here; see the readme's
"What the review round caught".

## `mark()` wipes, then reapplies

No diff against the previous chain — with every page retained forever and
visibility entirely CSS, a page leaving the chain needs nothing undone beyond
its classes removed. Order is CSS `order`, not re-appending: appending an
attached node is a detach+attach, which would reset every column's scroll.

## `mode` resolution

`chain.findLast(p => p.mode) ?? "replace"` — nearest the leaf wins, so a deep
page can declare `full` inside a `columns` topic, the same override direction
as CSS specificity. This whole mechanism is deleted in `new/1` in favor of a
page classing itself directly.

## Improvements

1. **None ranked.** This file is a closed, superseded prototype — its
   `mode`/`resolve()` design was deliberately replaced, not iterated on. Any
   fix belongs in `core/App/App.js`, the live descendant.
