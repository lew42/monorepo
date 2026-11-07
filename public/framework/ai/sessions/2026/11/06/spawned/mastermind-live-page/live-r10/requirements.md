# /live/: one bad line never blanks the page, then card previews

Asks relayed by voice-app, 2026-11-06 (the owner's words are in voice-app's session log).

## Part 1: errors (this merge)

- [ ] `/live/plan/today/` loads again. It crashed with `Cannot create property 'parent' on string 'ov-keep'` in LiveContent's removal archive. A missing or moved id is skipped and logged, never thrown.
- [ ] Error boundaries: one bad line or card never blanks the page. Catch per line replay, per card render and per delta; show a small inline error card in its place.
- [ ] Every caught error is appended to one shared log as `{ts, page, kind:"error", message, stack, line}`, and the owning agent is notified.
- [ ] Risky code: built in a worktree, smoke-tested with no page load errors, then merged.

**Log decision:** use ext/ErrorLog, the existing error log (`/framework/ai/errors/<date>.jsonl`, one file a day, so it rotates by day). No new `log.jsonl` (law 6, one of everything).
**Alternative:** one `log.jsonl` with 5 MB rotation, if UI events join it later.

## Part 2: previews (next merge)

- [ ] Every page or item has a `preview` List, separate from `content`, authored by deltas (`{"preview":{"add":…}}`).
- [ ] The parent's card shows title + preview; an empty preview falls back to `description`, then nothing.
- [ ] The detail page shows title, preview, then the full content.
- [ ] Link-card chevron: bottom-right corner, absolute, no width.
- [ ] Code in cards scrolls; no double padding.
- [ ] The decision log table is readable at 400px.
- [ ] The card icon lines up with the text below it.
