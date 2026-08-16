`two(fn, opts)` — the same builder rendered at two simulated widths on one
stage, with the split handle standing in for a width dial. `demo.stage.two()`
is the public door; `demo.layout({ twin: true })` is the other caller, which
also uses the `$views`/`redraw` it returns to wire up the `parts` chips.

## The handle is mirrored around the middle, log-spaced

Every handle position is a *pair* of widths (`simulated(share)`,
`simulated(1 - share)`) computed on a log scale, not linear — breakpoints sit at
ratios, so a linear sweep would spend most of the drag above 2000px where
nothing visibly changes. Centred, the two panes are twins; at either extreme,
one is exactly `wide` beside `narrow`.

## Each pane's zoom factor is measured, not derived — and uncapped

`simulate(sim.$view, sim.width, rooms[i])` reads back `clientWidth / simulated`
for the room each pane actually has, rather than computing it from the share
directly — that absorbs the handle's own width and any scrollbar automatically.
⚠ Unlike the single stage's width buttons (capped at `zoom: 1`, because a phone
shouldn't magnify in a wide page), this cap is **removed** here: the two panes
*are* the stage, and a capped 390px pane in a 744px slot used to float off both
edges of the ground as the handle moved, which read as a bug and was fixed by
removing the cap rather than adding a second layout rule.

## `split()` skips work when nothing moved

Every frame the pointer spends past the ¼/¾ clamp computes the same two widths
it already has — `if (widths.every((width, i) => width === panes[i].width))
return` — which is most of a fast drag, and is one of the three fixes that took
this handle from ~800ms to ~1ms per hundred pointer events (design record §18).

## Improvements

1. **`level()`'s height-flooring reads `offsetHeight` synchronously right after
   clearing every pane's `minHeight`**, which is a forced layout read
   immediately after a style write — the same pattern §18 fixed elsewhere in
   this module by separating reads from writes. At two panes the cost is
   negligible; worth applying the same "read both, then write both" shape if
   this file ever grows a third pane. *(medium, speculative.)*
2. **`WIDE`/`NARROW`/`MIN` are module constants, `opts.wide`/`opts.narrow`
   override two of the three but not `MIN`** — the ¼/¾ clamp is fixed for every
   caller. Deliberate per the design record, but worth a line in this file
   confirming it, since the other two are visibly configurable right next to it.
   *(simple, speculative.)*
