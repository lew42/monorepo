# Twins fold: an accounting check on /live/truth/

Budget: $5. Sonnet. Read `../brief-common.md` first (worktree, tests, docs, report).

## The owner's words (2026-11-09, relayed by voice-app)

"We want to merge our data together in a way where we're not wondering, wait, what the heck is this later… in a systematic way where we can check the accounting." The decision: KEEP the twins fold that ran on 2026-11-06 (commit 6d06f90e1, `node Server/SessionConsolidate.mjs --all --apply`: 1,410 sessions that had two folders each now have one; the originals were copied to a moved-aside folder).

## Deliverables

1. **An accounting check, computed by code (law 7).** Input: the manifest `public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/one-folder/fold-manifest.json` (keys `run`, `folded`, `held`, `relinked`, `groups`). For every folded session: the cost and the task count of the moved-aside halves, added together, must equal the merged record's. Per session and in total. Use the same cost and task readers the site already uses (find them: `core/Session`, `Server/Truth.mjs`; never write a second cost counter, law 6). Nothing is changed: read only.
2. **One table on /live/truth/** (`public/live/truth/`, written by `Server/Truth.mjs`; read its readme first): totals row (sessions checked, matching, mismatched, cost before vs after, tasks before vs after), then the mismatches listed (session, which number differs, both values, links to the merged folder and the moved-aside halves). If everything matches, say so in one line. Extend Truth.mjs (or a class it calls, one class per file) rather than a new page.
3. **The moved-aside originals are linked from `public/framework/ai/sessions/readme.md`**: one line saying where they are, what they are (the pre-fold copies, kept so the fold can be checked or undone) and the manifest, plus the check's command.
4. A lean test for what you add; `node Server/Truth.test.mjs` still passes.

Cut first if short of budget: the per-mismatch links (keep the counts). Report: the totals row as numbers, and whether any mismatch is real or a reader difference.
