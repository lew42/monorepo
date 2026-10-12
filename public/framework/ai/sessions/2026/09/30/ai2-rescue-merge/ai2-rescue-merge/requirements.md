# Rescue-merge the AI 2 inbox/log fix

Verbatim ask: A merge job, budget about $2. The reviewed AI 2 fix (four commits ending at
278b043c: Inbox default again, the heartbeat flood filtered from Needs you, a Log tab, the rail
no longer jumping, the tab strip on the left; reviewed in 3 rounds in
`public/framework/ai/2026-09-30/ai2-inbox-log-fix/review.md`) lost its pool worktree. It now sits
on branch `rescue/ai2-calm` (worktree `C:/Code/lew42/worktrees/ai2-calm-rescue`, which has no dev
server, so merge.mjs's smoke test can't run there).

## Steps

1. Take a pool worktree (`take_worktree`).
2. Merge `rescue/ai2-calm` into it, resolve conflicts with `michael/dev` (the ai2/ files changed
   since; e.g. `c2d25ec3` paused the pollers while hidden — keep both).
3. Run `node Server/merge.mjs <slot path> /framework/ai2/ /framework/ai2/overview/ --no-review
   "reviewed in 3 rounds: ai2-inbox-log-fix/review.md"`.
4. `return_worktree`.
5. Remove the `ai2-calm-rescue` worktree and the `rescue/ai2-calm` branch.
6. Verify `/framework/ai2/` loads with the tabs on the left and Inbox the default.
7. Post one line on card `2026/09/29/inbox-rows-are-the-real-pages-page-class` via
   `POST http://127.0.0.1:8090/card/append?id=…` using node fetch.

## Fence

`public/framework/ai2/` and `public/framework/ai2/overview/` only. No other module.

