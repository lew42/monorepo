The transcript as a live feed: turns newest-first, expanded, no fold-bars —
the default log view in `AITask.report()`, above a closed `replay()` for
anyone who wants the older rail/detail browsing instead.

## `ingest()` is the whole point

Everything else in this file exists to make `ingest(state, $list, line)`
possible: **one already-parsed transcript line**, either prepended as a new
turn or folded into the currently-open one — no full re-render. Nothing
calls it from a real socket yet; today a refresh button and, localhost-only,
a 5s `poll()` both re-fetch the whole transcript and feed `ingest()` only the
lines past what's already been seen (`state.seen`). Confirmed idempotent
across a poll cycle in the readme's wave log.

## `finalize()` prunes optimistically-drawn noise

A turn opens on its first line, before its prompt is known to be
meaningful. `finalize()` removes it if the *next* real prompt proves it
picked up no flow and had no prose or command of its own — the same
`trivial()` filter `replay.js` applies over a whole batch, decided here one
line at a time.

## Improvements

1. **`load()`, `is_talk()`/`is_prompt()`'s shape, and the SPA-fallback
   guard duplicate `replay.js`** — recorded as Open in the readme
   ("`replay.js`'s `load()`/`turns()`/`is_prompt()` are not exported... Hoist
   when a third caller wants it"). Two callers isn't quite enough to force
   the extraction yet, but the ~15-line duplicate is real. *(medium,
   important — deferred by design until a third caller exists)*
2. **`POLL_MS` is a flat 5s regardless of tab visibility elsewhere** — `poll()`
   does check `document.visibilityState === "visible"` before each `sync()`,
   so this is already handled; noted only because it's easy to assume
   otherwise from the constant alone. Not a real finding. *(trivial)*
