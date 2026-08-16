`pointerup` — finds what's under the cursor with `under(e)`, ends the gesture,
then either `drop(target, e)` or `restore()`. Nothing commits unless
`drop_check(target, e)` allows it.

**Usage** — `Sortable` overrides this outright rather than calling `super`: it
commits a *position* from `locate(e)`, not a single target, so
[`Draggable.drop()`](../drop/) is never reached on a `Sortable` instance. See
[`doc/sortable.md`](../../sortable/).
