Blank on purpose. Called from `release()` only when `drop_check(target, e)`
returned true — never speculatively, and never for a `Sortable` instance:
[`Sortable.release()`](../release/) is a full override that never calls this.
