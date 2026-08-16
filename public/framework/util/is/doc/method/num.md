`typeof value === "number"`.

## Bites

`is.num(NaN)` is **true** — `NaN` really is `typeof "number"` in JS, and this
check does not filter it out. Reach for `Number.isNaN()` when NaN specifically
has to be excluded. `is.num(Infinity)` is `true` for the same reason.

## Used by

Nothing today, in framework or sandbox code.
