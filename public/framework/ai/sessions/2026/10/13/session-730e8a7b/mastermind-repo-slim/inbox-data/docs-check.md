# Docs check — core/Page/ext/Inbox (fresh Sonnet reader, 2026-10-13)

The reader (`reviewer-inbox-docs-check`) could not write here (permission), so its reply is recorded by the mastermind, with what was done.

It found the record vs cache split, the source table and the refresh command "in about two reads". Findings:

1. "computed indexes" never says cache; `ai/cards.jsonl` unlinked → **fixed**: "indexes (caches, computed from the records)", linked.
2. Refresh commands had no path → **fixed**: full repo-root paths in readme and doc; a worktree counts its own older files.
3. Whether the `on-landing.mjs` edit was made; commit the index after `--append` → **fixed**: "Not made yet (2026-10-13)" + commit step.
4. readme 102 lines → **fixed**: the before/after history moved verbatim to `doc/InboxRail-notes.md`; readme 80 lines.
5. readme's Files missed the timeline files → **fixed**: `Timeline.js`, `timeline/`, `Landings.mjs`, `InboxSources.mjs` listed.
6. readme never mentioned `board.jsonl` → **fixed**: one line, retired, read-only.
7. The AI Inbox tab still polls (20 s) → outside the fence; recorded in doc/inbox-data.md and in the owner note at landing.
8. `?debug` unchecked → **proven**: headless probe of `?debug` shows "cards.jsonl 63 · landings.jsonl 1302" and a source + score per card.
