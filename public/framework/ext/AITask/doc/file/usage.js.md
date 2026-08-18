The usage windows as pace meters — `usage_rail(u)` renders one `.ai-meter`
per limit in a `usage.json` snapshot. Full read: [pace](/framework/ext/AITask/doc/pace/).

## The one DOM-after-tick trap this file names for itself

`meter()`'s own comment: "Properties and classes only — never rebuild DOM
here; the captor is long gone." `paint()` runs on a 60s interval closure long
after the initial synchronous render, so it can only mutate what already
exists (`.style()`, `.rc()`/`.ac()`, `.text()`) — never call a factory.

## Improvements

1. **`label_of()`'s `KINDS` map is small and hardcoded** (`session`,
   `weekly_all`, and a `weekly_scoped` special case) — a new limit kind from
   the API would fall through to `l.kind` verbatim rather than a friendly
   label. Low risk (the raw kind string is still legible), but worth a
   one-line note if the usage API ever adds a third scoped variant.
   *(simple, speculative)*
