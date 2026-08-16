# Phase 2 — deferred, not built

Everything here was named and consciously deferred during the 2026-08-14
design pass ([`framework/ai/2026-08-14/timeline/design.md`](/framework/ai/2026-08-14/timeline/design.md)),
not discovered later. None of it blocks the class working today.

- **A live control surface.** `page.js`'s "two zooms" demo shows two fixed
  `Timeline`s side by side rather than one slider — that IS the dilemma:
  Timeline exposes `zoom`/orientation as plain properties, but the h/v toggle
  and zoom slider themselves belong to `ext/layout` (the one interactive
  control surface, five-block rule), not built here.
- **Container-query auto-flip** — `.h` collapsing to vertical below ~40em
  inline size. The design record's "Responsive" section called for it; not
  MVP.
- **Nested-children mini-packing.** A fan-out's agent slivers/log dots inside
  one bar are NOT packed — they can overlap when a fork's children collide in
  time. `lay()` is already the right shape to reuse recursively; not done.
- **Deep-link scroll-into-view.** `ext/catalog`'s `reveal()` looks for
  `.page-preview` in the rail to scroll it into view; a Timeline rail has none
  of those, so navigating straight to a task's url leaves the rail wherever it
  was, unlike a card rail.
- **Historical window bands.** The `kind: "window"` demo renders one flat band
  at a fixed percent. A stepped fill from `ai/usage.jsonl`'s snapshot
  history — and past, spent windows staying on the timeline as their own
  bands — needs that log actually accumulating a few days of history first.
- **Agent slivers in `ai.js`.** Dispatched agents have no `at` timestamp today
  (only `task.jsonl`'s `logs`/`actions` do), so the adapter renders those as
  child dots and skips agents entirely. Moot while `ai.js` has no caller —
  see the readme's "Used by".

## Improvements

1. **This list should be re-scoped before anyone resumes it.** Half of it
   (the live control surface, deep-link reveal) assumed `ai.js` stayed wired
   into `framework/ai/`; it isn't, today (readme, "Used by"). Whoever revives
   either should re-read that section first rather than building phase 2 for
   a page that no longer calls this module. *(simple, important)*
