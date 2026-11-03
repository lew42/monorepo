# Follow-up, acted on: close or resume the 50 flagged tasks and asks

Budget: $15. Load the `sub-mastermind` skill first. The list you act on is `public/framework/ai/doc/follow-up.md` (+ `follow-up-full.md`), computed today by `node Server/FollowUp.mjs --write`; the owner's raw words are in `../requirements.md` (ask 8, dictation 2: "we don't have a very reliable system to make sure that past work is being followed up on… things falling through the cracks"). Your log is this dir's `task.jsonl`. CLAUDE.md laws apply: never destructive, compute don't recall, follow the owner's words.

## The flagged rows (2026-10-13 16:00)

2 landed with unmerged commits · 36 quiet over 2 h with no live agent · 3 landed with no outcome · 9 open asks in `asks.jsonl` whose owner agent is stopped or gone. `michael/property-of` is the owner's decision: do not merge it.

## Deliverable

1. **Quiet tasks (36):** for each, a Haiku minion (batches of ~10, under 60k tokens each) reads the task's `task.jsonl` + any STATE.md and answers three things with evidence: is the work on `michael/dev` (commit hash or "no"), what is left in one line, and the verdict: `landed` (work is in, write the landing line with the real outcome), `superseded` (a later task did it: landing line says which, with the link), or `open` (real work left: one line of what, and a link). You judge each verdict against the evidence (Sonnet, "prove it is missing before you say so"). Append the landing lines (`assign` with `landed_at`, `title`, `outcome`, `links`) with `node .claude/hooks/append.mjs`; never edit a line. Never resume an old agent to finish real work in this task; an `open` one goes to the list in step 4.
2. **No-outcome (3):** add the outcome line from the evidence, same route.
3. **Unmerged (2):** `worktree/dictate-without-claude` (1 ahead) and `worktree/sessions-tab-polish` (12 ahead, code). Review each diff against `michael/dev`; records-only merges with `merge.mjs`; a code branch gets `Server/smoke.mjs` and a `Server/review.mjs` pass in a worktree first, merged only if the review says fix nothing or you fixed it; otherwise an owner note with the diff stat and your recommendation.
4. **Open asks (9):** in `public/framework/ai/asks.jsonl`, append (never edit) a status line per ask: `done` with the link if the work landed, `dropped` with one line why if it was superseded or the owner withdrew it, or `queued` with a one-line brief if it is still wanted. The queued ones also go to `public/framework/ai/todo.md`, one line each with a link.
5. **Re-run `node Server/FollowUp.mjs --write`** at the end; the before/after counts are your report. Then make this reliable: a one-line entry in `Servex/doc/task-loop.md` (or where the TaskLoop's checks are documented) proposing FollowUp runs daily and its page is linked from the handover; write it as a decision line, do not wire it.
6. **Report** on your card: counts before/after by kind, the list of `open` items with links, what you merged.

Fence: landing lines and status lines appended to other tasks' `task.jsonl` and to `asks.jsonl`; `public/framework/ai/doc/follow-up*.md` (regenerated); `public/framework/ai/todo.md`; `Servex/doc/task-loop.md` (one decision line); this task dir. Code merges only through `merge.mjs` after smoke + review. Never `git stash`, never `git clean`, never delete a task dir.
