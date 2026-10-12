# asks-by-module: state (2026-10-12)

**Result:** the page and AI systems each have a merged asks list, open first: [core/Page/doc/asks.md](/framework/core/Page/doc/asks.md) (9 clusters, 7 open) and [ai/doc/asks.md](/framework/ai/doc/asks.md) (11 clusters, 10 open). Both are linked from their readmes. Rerun: `collect.mjs` → `filter.mjs` → Haiku tags (`haiku-brief.md`) → `merge.mjs` → `clusters.mjs` → Sonnet verifiers (`verify-brief.md`) → `gen.mjs`.

## How accurate was Haiku
- 4,497 owner prompts collected, 1,142 matched page/AI keywords, 336 tags came back (only 26% of candidates yielded a concrete ask).
- Quote check (does the cited quote appear in the source): 77.8%, a lower bound since Haiku trims.
- 16 of 336 tags (4.8%) were agent briefs mistaken for owner prompts. Haiku topic names were nearly all unique, so topic-merging failed; 20 clusters were merged by hand (222 of about 280 page/AI tags; about 58 one-offs unclustered).
- Verifiers (Sonnet) read readmes, docs and file listings, not every line of code; "open" is softer where they say so.

## Was the 2026-10-08 docs review good?
Mostly. Spot-check of 5 readmes (`core/Page`, `ai`, `ai/sessions`, `ai/doc`, `Servex`) against the code: links resolve and the descriptions match what exists, so they are current. They are not short: Page 124 lines, sessions 205, Servex 392, against the ~100-line rule. One dead path in `Servex/readme.md` (`prompt-refine/minion-echo/`, never moved there) was removed. Trimming the three long readmes is left open (moving detail into `doc/` is a judgment job, not an obvious fix).

## Decisions and alternatives
- Coverage: `.claude/prompts` only spans 2026-09-25 to 10-02; later days came from session logs. Alternative: re-tag the later days, not done for cost.
- Routing (sent by message): item-list-content-classes → page-content-unify; page-live-parts and page-context-on-page → page-ai-api; realtime-dictation-tasks and the 38 voice tags → voice-to-session-page. Inbox, class and prompt-refine asks stay in the doc (the verifier's suggested route did not fit the brief).
- Side finding: the smoke gate fails on every page since the console-allow entries for the weight/settings 404s expired 2026-10-10.
