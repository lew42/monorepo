# Smoke finds every worktree

mastermind-deputy, 2026-10-23: four worktrees made with plain `git worktree add` had no `.worktrees.json` entry, so merge.mjs's smoke found no server; the deputy registered them by hand.

1. `Server/smoke.mjs`, on a worktree with no entry, registers it and boots its server itself, then runs.
2. One code path: `worktree-restart.mjs` adopts an unregistered worktree (`--path`), the same boot as a restart.
3. The mastermind readme says how to make a worktree so it is registered from the start.
