# Make the core/Task page pass the merge smoke

Budget: $3. Load the `minion` skill first.

**Why:** the fast-write branch (`worktree/qf-3`, worktree `C:/Code/lew42/worktrees/qf-3`) changed one line of `public/framework/core/Task/readme.md`. So `Server/merge.mjs` smoke-tests the `/framework/core/Task/` page and every page it links. Seven of those links fail, and all seven failed before this branch. Nothing merges until they pass.

**The failures** (from `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/qf-3 /framework/core/Task/`):

1. `/framework/core/Task/files/` fetches `/framework/core/Task/doc/file/Task.js.md`, which is a 404.
2. `/framework/core/Task/processes/` is a 404 (`processes/` has no page.js). It is linked at `core/Task/readme.md:8`.
3. `/framework/ai/md/past-work-index/` has three missing images (`ai/c-views/item-ui-c-object-1920.png`, `ai/idle/live-1920-processes.png`, `ai/wire/card-1920.png`). It is linked at readme.md:25.
4. and 5. `.../voice-20261016/task-migrate/md/plan/` and `md/dry-run/` each fetch `task-migrate/readme.md`, a file that does not exist. They are linked at readme.md:54.
6. and 7. `/Server/md/doc/ai-index/` and `/Server/md/doc/stale-close/` are 404s, because `Server/` is not served as pages. They are linked at readme.md:58, 76 and 77.

**What to do, in `C:/Code/lew42/worktrees/qf-3` only:**

- **A wrong link:** fix it in `core/Task/readme.md`. A `Server/…` or `Servex/…` file opens in the explorer: `/framework/servex/fs/?file=Server/doc/ai-index.md`. Line 116 already does this for `Servex/doc/item-tool.md`.
- **A viewer that fetches a file which may not exist** (items 1, 4 and 5): find the code that makes the fetch. If it should check first, or treat a missing optional file as "none", make that small fix. Run `node --check` on the file, and say which file and line you changed.
- **A missing image** (item 3): point the image at a shot that exists, or drop it. Never invent a file.

Then rerun the smoke command above until it shows no `FAIL`. Commit each fix by exact path, then stop.

**Never:** kill or restart the dev server or any server other than qf-3's own, `git stash`, drive the owner's browser tabs, or edit anything outside qf-3.

**Report (one screen):** each failure, what you changed (file:line), the commit hash, and the smoke's last line.
