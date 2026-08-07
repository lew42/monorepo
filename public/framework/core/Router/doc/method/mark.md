Wipe, then reapply down the new chain. Two classes, and that is the **entire**
appearance API of this tier:

```
.active-page       the leaf
.active-ancestor   everything above it
```

**A page that left needs nothing undone, only its classes gone** — which is a
query, not a lifecycle call. That is why there is no teardown protocol to get
wrong, and why an arrangement can be pure CSS: every layout on the site is these
two classes plus one a page opted into by name.

Scoped to `$app`, **never `document`**. On a cold load `$app` is still detached,
so a document-wide query finds zero links and nothing lights up.

## `order` is gone

This used to write `style="order: i"` from the chain index. Unnecessary: pages are
appended root-to-leaf and never moved, so DOM order is already chain order — and
same-depth siblings are never visible together, so their relative order cannot be
observed.

Cost: 89µs over 49 anchors; ~11ms projected at 5000.
