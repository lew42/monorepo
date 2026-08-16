The shortest backend, and the one that exists purely so this module can be
tested and demoed without a browser API or a dev server — it is what powers the
live checks on this module's own Overview page.

## `write()` deep-copies, deliberately

`this.json = JSON.parse(JSON.stringify(item))` rather than `this.json = item`
— so a caller that mutates the object it already handed to `save()` cannot
reach back and corrupt what was "written." That round-trip also doubles as the
same serialization boundary the real backends impose (anything that isn't
JSON-safe fails here exactly as it would against a file or `localStorage`),
which is what makes this a faithful stand-in for the other two in a test.

## `save_count` is test instrumentation, not part of the `Saver` contract

The only property here that isn't shadowing something from the base class —
it exists so a test can assert *how many times* a write actually happened
(the module's own Overview page reads it directly: "50 rapid saves collapse
into two writes"). No other backend has an equivalent.

## Improvements

1. **`deleted` is written but never read anywhere.** Dead instrumentation —
   either a test should assert on it, or it can go. *(simple, speculative.)*
2. **No `write_count` alongside `save_count`.** Both currently mean the same
   thing since `MemorySaver.write()` can't fail, but the distinction (calls to
   `save()` vs. actual writes performed) is exactly what the coalescing
   behaviour is about, and a future backend where they diverge would have
   nothing to compare against. *(simple, speculative — no test needs this yet.)*
