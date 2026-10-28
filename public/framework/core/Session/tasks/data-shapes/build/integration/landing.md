# Builds A, B and C on one branch: ready for you to look at

![The Watch page after "Run all", on the integration branch](shots/item-watch-run-all-1920.png)

The three data-shapes builds now sit on one branch, **`integration/data-shapes`**, and work together. It is **not merged into michael/dev**.

- **Look at it:** http://data-shapes.localhost/framework/core/Item/ (its own dev server; the folder is `C:/Code/lew42/worktrees/data-shapes`, locked with `git worktree lock` so Servex's clean-up leaves it alone).
- **Branch:** 4 commits on top of michael/dev at `f50d4558d`: three merges and one fix. michael/dev has moved 3 commits since; `merge.mjs` takes care of that.

## What was checked

| Check | Integration | michael/dev | Proof |
|---|---|---|---|
| Node tests (core, ext/Doc, ux/Content/Object, Servex/agents) | **73 of 76 pass** (after the fix; 72 of 76 before it) | 67 of 70 | [tests-integ.txt](proof/tests-integ.txt), [tests-base.txt](proof/tests-base.txt) |
| Tests that passed on dev and fail here | **none** | | same files |
| Old records replayed by A's script, by/ts left out | **5091 of 5092 identical**; the one is `v-9dvbbrn`, the known Session-id fix | | [compare-s.txt](proof/compare-s.txt) |
| The same, by/ts kept | 825 differ: the root's `by`/`ts`, which A moved into `Item.clock` on purpose (its commit says so) | | [compare.txt](proof/compare.txt) |
| Smoke | 43 pages: no page-load error, no 404 page; 36 FAIL, each the console budget or the two layout checks below | 46 pages: 23 FAIL, all the console budget | [smoke2.txt](proof/smoke2.txt), [smoke-dev.txt](proof/smoke-dev.txt) |
| Screenshots, 5 pages at 1920 and 400 | all draw, no load error, no sideways scroll | | [shots/](shots/), [shots.json](proof/shots.json) |

The three tests that fail on both: `PromptLines`, `context-alert`, `item_tool` (Servex/agents). Test counts are files, run one by one with [run-tests.mjs](proof/run-tests.mjs); A's "163 of 165" counted a wider set, so the two numbers do not compare directly. The rule that holds: nothing that passes on michael/dev fails here.

## Conflicts, and the one fix

- **No textual conflicts.** Git merged all three on its own. In `core/Item/Item.js` it kept A's backbone and added B's `views` getter (5 lines); `List.render()` is A's own version of B's hook, drawing through `List.View`.
- **One break only the merge could show** (commit `10d1a6a48`): C was built on B, before A made every saved line name its list. Its Item step test failed: `milk.set({count: 2})` now writes `{"items":{"milk":{"set":{"count":2}}}}`, and the step looked for `{"milk":…}`.
  - Fixed in C's step, its "One line" diagram card, and the `get` and `set` method notes (they also said `get()` searches lists, and that `set(prop, item)` keeps a dead copy; A changed both).
  - `set.md` linked into the data-shapes task folder, a 404 on the site; it now links Item's `architecture.md`.

## Left as they were (they exist on the build branches or on dev)

- **Console budget** (more than 5 console lines on a page): on michael/dev too. The `Doc: … has no member …` allow entries in `Server/console-allow.jsonl` expired on 10-10 and 10-26.
- **"Text touching its box"**: `.ux-content-defaultview-class` (B's class pill, 1 px from the top) and `.doc-class-step-n` (C's step number, 1 px from the bottom). Both are B and C's CSS; A changed no CSS.
- The home page's List card says `class List extends Events(Object)`, while the List page says `List extends Item`.
- A fresh worktree has no `ai/page-work.json` or `ai/tasks.json` (gitignored, made by the main tree's tools), so its pages log 404s. I copied the main tree's copies in.

## How to merge it

Merge **`integration/data-shapes` alone**, in one go: `MSYS_NO_PATHCONV=1 node Server/merge.mjs C:/Code/lew42/worktrees/data-shapes`. It holds A, B and C (each without its "worktree closed" commit of regenerated `files.jsonl`), plus the fix.

Do not merge `worktree/backbone`, `worktree/default-view` or `worktree/class-docs` separately: C on its own would bring back the broken step test.

`merge.mjs` runs smoke, which will fail on the console budget, as michael/dev's own Item pages do today. Unlock the folder after the merge (`git worktree unlock C:/Code/lew42/worktrees/data-shapes`) so Servex can close it.
