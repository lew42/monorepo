# Comment prune, round 3: the next 40 files (brief)

Same rule, method and checks as [round 1](../comment-prune/requirements.md) and [round 2](../comment-prune-2/requirements.md), which together took the repo from 21% to 18% comment lines; reuse the verify script from round 1.

**Files:** the top 40 of `node public/framework/code/patterns/comment-census.mjs` now, skipping `Server/` and `Servex/`.

## Done when
- [ ] Comments only (verify script passes); history, lessons and reasons go to `doc/notes.md` with a one-line pointer; readmes link the notes.
- [ ] Smoke clean; `hold.mjs`; one commit per file; census before → after in `STATE.md`; merge; land.

Sonnet 5.5 orchestrating, with Haiku minions for single files under 60k (most of the work). Worktree; one-sentence replies; land with `finish-task`.
