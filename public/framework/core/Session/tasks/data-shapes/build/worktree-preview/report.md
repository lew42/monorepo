# Worktree preview: report

Branch `worktree/worktree-preview`, head `adeb55cf5`. **Not merged.** How it works: [Servex/doc/worktree-preview.md](/Servex/doc/worktree-preview.md).

## Commits

- `673e866bc` a landed, unmerged worktree is held until its merge; a preview task's server goes on the LAN with a computed phone link
- `f3850a29e` on-landing's close choice is `Worktrees.on_landing()`; the test
- `1dfc25c09` docs: worktree-preview.md, and the clean-up docs
- `e9e9a6be3` `serve_previews` skips a worktree about to be removed
- `adeb55cf5` review fixes

## Tests

- `node Server/WorktreePreview.test.mjs`: 38 checks pass. It uses a scratch repo in the OS temp folder, with Servex pointed at port 9, so nothing real is touched. When the hold was removed on purpose, it failed.
- The existing suites still pass: ReadyToMerge.test (32), Worktrees.test, pool-hold, processes (38), Pool, pool-heal, pool-restore, Landed-merged.
- Not run:
  - `on-landing.mjs` as a whole, because it spawns paid reviewers.
  - A real phone opening a real worktree.

## Review

[review.md](review.md): 2 fixed, 5 noted. The answers are in `session.jsonl`.

The merge gate passes:

```
node Server/merge.mjs C:/Code/lew42/worktrees/worktree-preview --gate-only --review-dir public/framework/core/Session/tasks/data-shapes/build/worktree-preview
```

It needs `--review-dir` because this task sits outside `ai/sessions/`.

## Going live

1. Merge the branch into `michael/dev`. The `Server/` scripts (on-landing, Worktrees, ReadyToMerge) change at once.
2. Run `node Servex/sustain.mjs --restart` for the `Servex/` parts (the worktree hold, the LAN bind, the reaper exemption).
   - It refuses while agents are working.
   - Never run it during a voice call: it drops the call.
3. To use it, a task logs `{"assign":{"preview":true}}` before it lands.
