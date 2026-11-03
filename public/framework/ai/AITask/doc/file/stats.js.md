Pure derivations, no DOM: `state()`, `progress()`, `spend()`, `quiet()` read a manifest;
`usage_of()`, `tail_activity()`, `timeline_of()` read a raw transcript
directly. `clock()`, `dur()`, `count()`, `ref()`, `elapsed()` are small
formatting/UI helpers shared across every other file in the module.

## Why this file imports nothing from its siblings

`message.js` and `prompt.js` both import `count` (and more) from here — a
second import back into either would be the mutual-import trap
(`import` hoists regardless of textual position, so a circular partner reads
an uninitialized binding). `HARNESS_TAG` and `prose_of()` are this file's own
small, deliberate duplicate of what `prompt.js` does more fully, kept local
for exactly that reason.

## `quiet()` — the only derivation that reads the clock

Every other function here is a pure function of the manifest; `quiet()` compares
its newest timestamp against `Date.now()` and returns a `dur()` string once a
*running* task has been silent longer than `QUIET_AFTER` (30 minutes). That makes
it the one value here that changes without the file changing — it is computed at
render time and is only as fresh as the last redraw, which on the board is every
streamed batch.

The newest timestamp is the max over `requested_at`, `logs`, `actions` and `chats`,
through `Date.parse` rather than a string sort: this repo's logs carry both
`…-05:00` and `…Z` stamps, and those two sort wrongly as text. A landed task is
never quiet, and neither is a manifest nobody has timestamped.

**⚠ It is a guess, phrased as one.** Nothing tells the browser a session died; a
long, honest silence (a big refactor, a slow agent) reads identically to a crash.
The card says *"2h 0m quiet"*, never *"stalled"*, for exactly that reason. The
threshold is a module constant, not an option — an option is API surface forever,
and one number the whole site agrees on is the point.

## The three transcript-native functions are verified, not theoretical

`usage_of()`, `tail_activity()`, `timeline_of()` were each checked against
the real transcript that built this module (372 lines) — dedup counts,
tail-activity phrasing, and the `isMeta` skill-injection filter are all
recorded as measured in the readme's wave log, not assumed correct.

## Improvements

1. **`usage_of()`'s `exclude` parameter (for a fork's copied parent history)
   is implemented but never verified against a live fork pair** — recorded
   honestly in the wave log rather than glossed over, and still true. Needs a
   real forked transcript to confirm before anything depends on it.
   *(medium, important)*
2. **`state()`, `progress()`, `spend()` are the manifest-reading half of this
   file; `usage_of()`/`tail_activity()`/`timeline_of()` are the
   transcript-reading half** — genuinely two different input shapes in one
   file. Not yet worth splitting (both halves are short and nothing else
   needs only one), but worth watching if either grows. *(simple,
   speculative)*
