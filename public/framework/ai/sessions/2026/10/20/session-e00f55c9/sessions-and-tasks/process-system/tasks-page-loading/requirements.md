# The /tasks/ page never finishes loading

The test `public/framework/core/Task/TasksPage.test.mjs` fails: `/tasks/` still shows "Loading" after 20 seconds. It has been failing since at least 03:59 on 2026-10-22.

Find the cause, fix it, and record what the cause was.

## Where

- Worktree: `C:/Code/lew42/worktrees/tasks-page-loading`, branch `task/tasks-page-loading`, already made from michael/dev with `npm ci` run in Servex/.
- The live site is `http://monorepo.localhost/` and serves the **main** checkout.
- To try your fix, serve the worktree and pass its URL to the test, or point a headless browser at it.
- Look at the console errors and the network requests the page makes.

## Steps

1. Run the test against the live site and reproduce the failure. Note the first error or the request that hangs.
2. Trace it to the code. Likely suspects:
   - `core/Task/TasksPage.js` and whatever data it fetches (an index file, or a jsonl stream that never ends).
   - Recent Task.js changes: `complete` now needs evidence, and `approve` now leaves a task idle. A throw in replay could leave the page at "Loading" for good.
3. Fix it in the worktree, then run the test until it passes.
4. If the page can fail silently, make it show an error instead of "Loading" forever.
5. Commit in the worktree.
6. Run `node Server/review.mjs <this task dir>` from the main checkout. Answer every finding with a `{"review":{"answer":{"n":N,"reply":"fixed|declined|noted: …"}}}` line in this folder's task log, and confirm `node Server/review.mjs --status <this task dir>` passes.

## Rules

- Never `git stash`, `git checkout --` or `git reset` in the main tree. Never `rm -r`. Put temp files in `C:/tmp/rv`.
- Do not merge into michael/dev.

## Done

Report:
- the cause, in one or two plain sentences;
- the commit;
- the test output;
- the `--status` line.
