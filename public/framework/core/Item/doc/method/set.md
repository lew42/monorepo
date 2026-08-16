Writes `data[key]`, and emits `"change"` with `(key, value, old)` — but **only
when the value actually changed** (`old === value` returns early, silently).
That guard is why a document with dirty-tracking cut entirely (see the readme's
Verdicts) still doesn't autosave on every no-op `set`: the emit itself is the
gate, not a separate dirty flag.

**⚠ Reference equality, not deep equality.** Setting `data.tags` to a new array
with the same contents still emits — `set()` has no idea the contents are equal,
only that the reference changed. That is deliberate: a deep-equal check on
arbitrary user `data` would be unbounded work on every keystroke.

Returns `this.emit(...)`, so it chains and `set()` itself returns the Item
(never the event's return value, which nothing here uses).
