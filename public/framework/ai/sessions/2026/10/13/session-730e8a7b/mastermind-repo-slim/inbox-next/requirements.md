# Inbox: the stale pinned Now card no longer outranks today

Budget: $8. Load the `sub-mastermind` and `page` skills first. The brief is already written by the fresh-eyes review: **`public/framework/core/Page/ext/Inbox/doc/next.md`** (the pinned Now card showed a line from Oct 6 above Today, Yesterday and Live at 21:35 on Oct 13; the owner asked for "a prioritized view of only the important things, ranked by recency… once I've seen it, we get rid of it", `../requirements-3.md` ask 2 and `../requirements-10.md` ask 4). The review itself: `../review-ai-pages/review.md`. Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; route everything; the four widths.

## Deliverable

1. Do exactly what `next.md`'s first item says: the Now card's rank follows `Inbox.rank` like every other row (recency decays; a seen/archived item sinks), or the pinned slot only holds a `needs-you` owner note younger than 24 h; say which in a `decision` line with the alternative. Prove with a headless shot at 1200 before/after: the top rows are today's.
2. The other items in `next.md` that are under an hour each: do them; the rest stay listed with the measurement.
3. `check_page` at the four widths, smoke clean, `merge.mjs`; `next.md` marks what is done with the hash; `doc/ranking.md` updated if the rule changed; card with the shots; landing line checked with `tail -1`.

Fence: `public/framework/core/Page/ext/Inbox/**` and its docs, this task dir. Not `Servex/cards/Cards.js` (a needed server change is a `decision` line). Sonnet.
