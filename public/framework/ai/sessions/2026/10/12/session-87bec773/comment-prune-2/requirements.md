# Comment prune, round 2: the next 20 files (brief)

Same rule, method and checks as [round 1](../comment-prune/requirements.md), which took the repo from 21% to 19% comment lines (its verify script is in that folder: reuse it).

**Files:** the top 20 of `node public/framework/code/patterns/comment-census.mjs` after round 1, starting with `ux/Dictate/playground/Playground.js`, `ux/Dictate/variants/v1/Dictate.js`, `ext/drawer/tabs/ai.js`, `ux/Tree/Tree.js`, `ai/rail/rail.js`, `ext/Doc/Doc.js`, `ext/JSONL/JSONL.js`, `ext/AITask/asks.js`. Skip `Server/` and `Servex/` (they need a restart to prove).

## Done when
- [ ] Comments only (the verify script passes on every file); history, lessons and reasons moved to `doc/notes.md` with a one-line pointer; readmes link the notes.
- [ ] Smoke clean; `hold.mjs`; one commit per file; census before → after in `STATE.md`; merge; land.

Sonnet 5.5, with Haiku minions for single files under 60k. Worktree; one-sentence replies; land with `finish-task`.
