# Inbox: next

Found by the fresh-eyes review of 2026-10-13 ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)).

- ✅ **The pinned Now card no longer outranks today.** `Inbox.pin_alive` (rule in [ranking.md](ranking.md)) keeps it only while under 24 h old; `ai/rail/rail.js` `render_pinned()` calls it. Before and after at 1200: `/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-next/` (`before/`, `after/`).
- ⬜ **"Your prompts" is also pinned and showed Oct 12.** Same rule would apply if it should leave the slot; not asked, so left.

## The owner could not find "needs you" (2026-10-14)

The owner asked where the items waiting on them live and said the dashboard is "so broken and ugly". The decisions were posted as 20+ cards titled "<task>: decided N things for you", mixed in with every other card. That is the miss: a decision that waits on the owner needs one fixed place, not a card among sixty.

- ⬜ **One "Waiting on you" list, pinned at the top of the Inbox**: every open owner decision, one line each, with its card linked; gone when ticked. Source: cards whose title or body says "for you" or "decision", plus `ai/asks.jsonl` lines with status waiting.
- ⬜ **Stop the "decided N things for you" card title pattern**: the mastermind skill should post one line onto that list instead of a new card per task.
- ⬜ **Fresh-eyes layout pass on the Inbox at 400 / 1200 / 1920** against the owner's words: "broken and ugly".
