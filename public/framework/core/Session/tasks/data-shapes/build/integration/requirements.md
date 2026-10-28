# Integration: builds A, B and C on one branch, tested together, NOT merged into michael/dev

**Why:** three build branches landed separately: `worktree/backbone` (A), `worktree/default-view` (B) and `worktree/class-docs` (C, branched from B). The owner should review **one** branch that holds all three and is proven to work together, and the next builds start from it.

Read: [../../plan.md](../../plan.md) ("Running now"), then each build's landing and review: [../backbone/review.md](../backbone/review.md), [../default-view/review/report.md](../default-view/review/report.md), [../class-docs/review/report.md](../class-docs/review/report.md).

## Steps

1. **A new worktree from michael/dev:** `git worktree add C:/Code/lew42/worktrees/data-shapes -b integration/data-shapes michael/dev`.
2. **Merge each build without its last commit.** Each branch ends in a Servex "worktree closed: N leftover file(s) saved" commit of regenerated `files.jsonl`. Leave those out:
   - `git merge worktree/backbone~1`;
   - `git merge worktree/default-view~1`;
   - `git merge worktree/class-docs~1`.

   Check with `git log -1 --format=%s <branch>` that each tip really is the "worktree closed" commit before dropping it.
3. **Resolve conflicts** by reading both sides. B adds about 5 lines to `core/Item/Item.js` (`views`); A rewrote much of it. Keep A's backbone, and B's `views` and its `List.render()` hook (A already added `List.View`). Log each resolution.
4. **Prove it together:**
   - every `*.test.mjs` and `*.test.js` under `public/framework/core`, `ext/Doc`, `ux/Content/Object` and `Servex/agents` (A's landing says 163 of 165 pass, and that the 2 failures also fail on michael/dev; confirm the same holds here);
   - A's replay comparison over every real record file (its script is on its branch; find it from A's log): identical except the one known Session-id fix;
   - `node Server/smoke.mjs <worktree>`;
   - headless screenshots at 1920 and 400 of `/framework/core/Item/`, `/framework/core/Item/watch/`, `/framework/core/List/`, `/framework/core/Item/methods/set/` and `/framework/` (home), each judged for errors.
5. **A dev server for the worktree,** started through Servex (`start_server`), with its url logged. Write the worktree path into your task's line-1 record so Servex's worktree lifecycle keeps it: the earlier builds' folders were closed because "no task.jsonl names this worktree". **Keep the folder and server up;** the owner will look at it.
6. **Land:**
   - the branch name and server url;
   - the test counts against michael/dev's;
   - each conflict and how it was resolved;
   - a merge note for the owner, saying what `merge.mjs` should merge and in what order.

## Fences

- **Never merge into michael/dev.** Don't restart Servex or the main dev server.
- Fix only what integration breaks, each fix its own commit with a reason. A bug that already exists on a build branch is logged, not redesigned.
- **Budget:** about $30. Spawn no one. **Finish by about 19:00,** so the next builds can start from this branch.
