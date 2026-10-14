# Session page: a flat Coverage list, and the title drawn first

Budget: $8. Load the `sub-mastermind` and `page` skills first. The brief is already written by the fresh-eyes review: **`public/framework/ai/sessions/doc/next.md`** (Coverage tab: a `details` box inside a white card, ~70 px apart at 1920, so only three prompts fit above the fold; one flat list would show seven or eight. A session page's title arrives late: the crumb and column head draw the id and rename once `sessions.json` answers). The review: `../review-ai-pages/review.md`. The owner's standard: level 1 above the fold (CLAUDE.md "Presentation"); names the owner knows (`../requirements-8.md` ask 2). Your log is this dir's `task.jsonl`.

## Deliverable

1. **Coverage flat**: the refined prompts as one flat list of rows (the box alone, no outer card), seven or more above the fold at 1920; headless shots before/after at 1200 and 1920 with the count above the fold.
2. **Title first**: the detail route draws the session's name from `SessionIndex` (the row carries it) before the first paint instead of the id then a rename, or the index row is fetched before the page mounts; a `decision` line with the alternative; proof: a shot of the first paint shows the name.
3. `check_page` at the four widths, smoke clean, `merge.mjs`; `next.md` marks both with hashes; `ai/sessions/doc/ui/detail-layout.md` gets the two lines; card with the shots; landing line checked with `tail -1`.

Fence: `ai/AISession/AISessionDetail.js`, `AISessionCoverage.js`, the detail route's page file, `ai/sessions/doc/**`, this task dir. Not `SessionIndex` internals (a query param is fine). Sonnet.
