# Inbox: next

Found by the fresh-eyes review of 2026-10-13 ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)).

- ✅ **The pinned Now card no longer outranks today.** `Inbox.pin_alive` (rule in [ranking.md](ranking.md)) keeps it only while under 24 h old; `ai/rail/rail.js` `render_pinned()` calls it. Before and after at 1200: `/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-next/` (`before/`, `after/`).
- ⬜ **"Your prompts" is also pinned and showed Oct 12.** Same rule would apply if it should leave the slot; not asked, so left.

## The owner could not find "needs you" (2026-10-14)

The owner asked where the items waiting on them live and said the dashboard is "so broken and ugly". The decisions were posted as 20+ cards titled "<task>: decided N things for you", mixed in with every other card. That is the miss: a decision that waits on the owner needs one fixed place, not a card among sixty.

- ✅ (2026-10-14, `WaitingOnYou.js` on [Browse](/framework/ux/Browse/)) **One "Waiting on you" list, pinned at the top of the Inbox**: every open owner decision, one line each, with its card linked; gone when ticked. Source: cards whose title or body says "for you" or "decision", plus `ai/asks.jsonl` lines with status waiting.
- ⬜ **Stop the "decided N things for you" card title pattern**: the mastermind skill should post one line onto that list instead of a new card per task.
- ✅ (2026-10-14: the list is a third of the screen at 1920, wider at 3440, a table row past 60em; a phone opens on the list) **Fresh-eyes layout pass on the Inbox at 400 / 1200 / 1920** against the owner's words: "broken and ugly".

## After Browse (2026-10-14)

- ⬜ **The timeline on Browse**: `TimelinePage` still lays out with `columns()`; it becomes a `Browse` whose list is its `DataGrid` (ux/Browse/doc/architecture.md).
- ⬜ **The rail's chrome**: one row of controls above the list (New card, Needs you, three category chips, the score floor, auto-transcribe, search); with the list a third of the screen it fits on one line at 1920, but on a phone it is two. Folding the rarely used ones (score floor, categories) behind one "Filters" word is the next simplification.
- ⬜ Waiting on you holds 114 lines today, mostly "<task> decided N things for you" cards; "tick all" archives them. The mastermind skill should post one line onto this list instead of a new card per task (still open, above).

**2026-10-14:** `own_notes()` reads a folder's `page.jsonl` only when the parent's file list (`Page.listing`) calls it a jsonl page; this removed the console 404 on every open, at the cost of one memoised parent-listing fetch. A page whose `page.jsonl` is newer than its parent's file list is skipped until the list refreshes.
