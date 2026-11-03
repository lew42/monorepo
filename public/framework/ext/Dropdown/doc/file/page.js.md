## page.js

The `Doc` for the module: one live dropdown with three icons, the call that
builds it, and a line saying what it picked. Show, don't tell — the page *is* the
demo. Its last paragraph points at [`ext/Panel`](/framework/ext/Panel/)'s rail,
which is where the module earns its keep.

The live example redraws itself on a pick (`draw()` re-fills one box), because a
dropdown closes on a pick and hands you the value — nothing here watches data.
That is the same contract every caller has.
