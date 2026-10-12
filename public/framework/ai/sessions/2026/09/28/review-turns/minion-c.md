# Minion C — fix the fresh review's findings

Load the `minion` skill first. Directory: `public/framework/ai/2026-09-28/review-turns/`. A fresh
reviewer just reviewed this whole task (verdict `fix`, 9 findings) — read `review.md` there in
full before touching anything. The task mastermind has judged each finding; do exactly this:

**Fix (your job):**
1. **Finding 1** — `status()` in `Server/review.mjs` (~line 170) only recognizes replies starting
   `fixed`/`declined` as answered; a `[note]` finding answered e.g. `"noted: ..."` still counts as
   unanswered. Accept a `noted` reply too (for `[note]` findings specifically — a `[fix]` finding
   still needs `fixed`/`declined`, never `noted`). Also: the refusal/status strings (~line 172 and
   ~299 in review.mjs, and the message `merge.mjs` prints, ~line 129) say only a COUNT of
   unanswered findings ("N unanswered") — change them to name the finding NUMBERS too (e.g.
   "2 unanswered: #3, #7"), so whoever reads it doesn't have to go hunting.
2. **Finding 2** — `worktreeBase()` (~line 420) silently returns the main site's URL
   (`http://monorepo.localhost`) when the worktree isn't in `.worktrees.json`, so a review run can
   screenshot the WRONG tree without saying so (this happened for real on this task's own review).
   When it falls back, print a warning to stdout naming the worktree dir and that it's using the
   main site instead (never throw — this file's whole style is "never throws").
3. **Finding 3** — `/framework/ext/Collab/` with no `?src=` shows the DEMO scoreboard
   (`demo/scoreboard.jsonl` in `page.js`'s `DEMO_SCORE`), which has no review rows, so the real
   backfilled reviews (in `public/framework/ai/collab/scoreboard.jsonl`) are invisible to anyone who
   just opens the page — the proof explicitly asks for a Reviews view "the owner can find," and a
   view behind an undiscoverable `?src=` query param fails that. Read `ext/Collab/page.js` and
   `view.js`: the Reviews section you (or your sibling minion did) build should read the REAL shared
   scoreboard directly (`/framework/ai/collab/scoreboard.jsonl`), not whatever `?src=` happens to
   point the rest of the page at — the reviews table isn't about one collab run, it's a sitewide
   rollup. Keep the demo data for the collab-run replay above it; only the Reviews section itself
   should always read the real file.
4. **Finding 8** — on the Collab page, the reviews/scoreboard content sits below the fold at every
   width, so a reader won't find it without scrolling (checked at 1280/1920/3440 in
   `review-turns/review/shots/`). Move the Reviews section up near the top of the page (just under
   the page title, above the collab-run replay), and cap its width with a measure word instead of
   letting it stretch full-bleed. Don't restyle anything else on the page.

**Decline (already judged by the task mastermind — write these into task.jsonl yourself as
`{"review":{"answer":{...}}}`, don't redo the judgment):**
- Finding 5 (`changed_outcome` overstates usefulness): `{"review":{"answer":{"n":5,"reply":"declined: fixed>0 is a documented proxy for now (doc/review.md says so); tracking whether a fix actually MERGED needs a merge-time hook this pass doesn't have — next brief's job"}}}`
- Finding 6 (review.mjs doesn't literally reuse `Collab.Phase`): `{"review":{"answer":{"n":6,"reply":"declined: Collab.js's Phase/Member/Vote classes are a browser-side JSONL REPLAY (fetch by URL); review.mjs is a Node writer with no browser — it follows the same one-verb-per-line phase/kind JSONL convention collab.jsonl uses, which is the reusable part. Added one line to doc/review.md saying so."}}}`
- Finding 7 (diff carries the whole collab-rounds branch): `{"review":{"answer":{"n":7,"reply":"declined: collab-rounds isn't merged to michael/dev yet (its own mastermind is still finishing collab.mjs's vote-counting fix) — flagged to mastermind-servex already. Bundling it into this merge is the coordinated resolution, not an oversight."}}}`
- Finding 9: no answer needed, it's a "nothing to change" note.

For finding 6's decline, add the one line it promises to `Server/doc/review.md` yourself (small,
in scope of the decline).

Once each fix actually lands, append its own `{"review":{"answer":{"n":N,"reply":"fixed"}}}` line
to `public/framework/ai/2026-09-28/review-turns/task.jsonl` for findings 1, 2, 3, 4 and 8 (4 shares
finding 1's fix — same "fixed" answer), alongside the three decline lines above for 5, 6, 7.

## Where you're working

Same worktree, `C:\Code\lew42\worktrees\review-turns`. Fence: `Server/review.mjs`,
`Server/doc/review.md` (findings 1, 2, the finding-6 doc line), and
`public/framework/ext/Collab/page.js` + `view.js` (findings 3, 4). Nothing else.

## Proof

Re-run `node Server/review.mjs --status public/framework/ai/2026-09-28/review-turns` — should now
read something like "reviewed: N fixed, 3 declined" with the fix findings counted correctly. Take a
fresh 1920 screenshot of `/framework/ext/Collab/` (no `?src=`) showing the real Reviews section
above the fold with real numbers. `node --check Server/review.mjs`. Log each step in
`public/framework/ai/2026-09-28/review-turns/task.jsonl`. Commit when done, report back to the task
mastermind — don't merge.
