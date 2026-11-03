# review.mjs: no false pass from the main checkout

The ask (queue item 1 from the brief to mastermind-system-architect-3, 2026-10-23): `review.mjs` run from the main checkout diffs `michael/dev` with itself and writes "pass". Make it refuse, or find the branch's worktree.

Done when: on `michael/dev`, `review.mjs` reviews the worktree the task record names, or refuses with exit 1; a test proves both; the doc says so.
