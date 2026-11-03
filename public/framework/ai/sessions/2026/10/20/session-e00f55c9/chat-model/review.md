verdict: fix
1. [fix] The switch-over plan relies on a migration the tool refuses to run. `core/Session/Chat/doc/pseudo-properties.md:41` says `v-u48msei` "needs a real migration run", and `:45` says to run `--apply` on each file the compare finds `partial`. But `Server/ChatToMessages.mjs:24` returns `null` for any file that already has a `messages` or `sentences` line, so a partial session can never be migrated. Either give `ChatToMessages` a way to fill only the unmirrored `{chat}` lines (by `at`, the same test `ChatV1Compare.coverage()` already uses), or say in the doc that partial sessions have no migration path yet.
2. [fix] The merge brings about 25 wrong `"gone":true` index lines again, the same problem as the step-3 review's finding 3. Examples: `ai/queue/files.jsonl` (`tasks/`, `done-check.json`, `dropped.json`, `failures.jsonl`), `core/Task/files.jsonl`, `core/Session/tasks/files.jsonl` (`task.jsonl`), `core/Page/navigation/shots/files.jsonl`, and `class-docs`, `default-view`, `integration`. I checked with `ls`: every one of these targets exists in the main tree, and most are gitignored. The commit `d17eeb380` "worktree housekeeping (index churn)" commits them on purpose. Drop that commit from the merge. The worktree indexer bug keeps coming back, so it needs its own task.
3. [note] The diagnosis holds. I re-ran the compare in the worktree with `said_at` stripped from the `{chat}` lines: `v-sq8y7db` drops from 1183 to 2 differing bubbles (1215 = 1215), and `v-9dvbbrn` drops from 716 to 0 (703 = 703). That is stronger proof than the grep count plus the two `said_at`-free sessions that `pseudo-properties.md:43` cites, so it is worth recording there.
4. [note] `V1Bubbles.js:65` drops a `fix` whose original is not on screen. V1 (`ext/Chat/Chat.js:793`, "never drop it") falls through and draws it as its own line, so the mirror can undercount V1 on sessions whose originals scrolled off.
5. [note] The real-fixture check (`V1Bubbles.test.mjs:61-72`) is still true by construction: `events()` pushes each sentence exactly once. The new synthetic "hard" case does cover merge, reorder and fix, so the earlier gap is mostly closed.
6. [note] `pseudo-properties.md:47` says "Nothing here is built yet", but step 1 at `:40` says "done". Something like "Steps 2–6 are not built" would read clearly.

Re-review of step 8 (commits eded1102f, fc109ec8e, d17eeb380 on worktree/chat-model). No page changed, so this review has no shots. `node public/framework/core/Session/Chat/V1Bubbles.test.mjs` in the worktree: 6 checks passed. The earlier step-8 findings are all addressed: `place()` is mirrored (1), the per-session numbers are correct (2), coverage is measured as full, partial or none (3), "Check it" lists the test and the tool (4), the temp-file round trip is gone (5), a `fix` rewrites text in place (7), and `Server/doc/scripts.md` has a row for the tool (8).

## Requirements
- 8 "a dry-run migration that writes `session.messages` for old sessions from their `{chat}`/`{place}` lines" — partly. `ChatToMessages.plan()` is reused in memory and never `--apply`'d, but it cannot handle partial sessions (finding 1).
- 8 "a side-by-side check that V1 renders the same from either source" — yes. `ChatV1Compare.mjs` and `V1Bubbles.js` mirror `mergeable()`, `place()` and `fix`. `s8/compare.txt` covers 5 sessions, and the causes of the differences are verified (finding 3).
- 8 "Don't run the migration, and don't switch V1" — yes. There is no `--apply`, and `ext/Chat/Chat.js` and `ux/Dictate` are untouched.
- Fences: worktree only, review before merge, V1 renderers untouched — yes.
- Docs (Law 9): readme "Check it", the ✅ line and the pseudo-properties section — yes, with one gap (finding 1).
- Index everything (Law 10) — no. The wrong "gone" lines (finding 2). The new files are indexed in `core/Session/Chat/files.jsonl`, and `s8/` is in `session.jsonl`.
- Could a fresh agent continue from this folder alone? — yes. `s8/requirements.md`, `s8/session.jsonl` (agent, session id, log), `s8/compare.txt` and `plan.md` step 8 cover it.
- New class with live instances? — n/a. `V1Bubbles` is static and holds no state.

## Words
- Plain, full sentences — mostly yes. `pseudo-properties.md:41` is one very long paragraph; splitting it into a list per session would make it easier to scan.
- Owner's name absent — yes.
