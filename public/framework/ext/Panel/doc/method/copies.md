`copies()` returns every panel whose `data.mirror` points at `this.id` — the
live duplicates reading `this` as their master. It walks the whole tree from
the root once (`this.root().walk(...)`), because that one hop is the whole
set: `mirror()` collapses a mirror-of-a-mirror to the original at creation
(`of.master() ?? of`), so no panel's `data.mirror` ever points at another
mirror. There is no chain to follow, only a flat set to find.

`bequeath()` is the only caller. A panel that is itself a mirror always has
zero copies — the same collapsing invariant means nothing ever points at
it — so `copies()` returning `[]` is what makes `bequeath()` a safe no-op on
a mirror.
