`close()` removes `this` from its parent and returns the parent (or `this`,
if there was no parent to remove from). If that removal leaves the parent
holding exactly one remaining child, the parent calls `absorb()` on itself —
a container left with one child is no longer meaningfully a split.

This is the exact inverse of `divide()`'s "I become the split" branch:
`divide()` demotes a leaf into a split with two children; `close()` +
`absorb()` promotes a split's last remaining child back up to replace it.
