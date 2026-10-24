Budget: $10

# core/Router: a session-store task folder opens with no 404 probes up its ancestors

Load the `minion` skill first. This task's log is `session.jsonl` in this folder.

**Why now:** this blocks a merge. The session page's Work tab on `worktree/qf-3` (mastermind-deputy's branch) fails its merge smoke with about 40 FAILs. Every one is a linked task folder whose load fetches files that do not exist on its way up the ancestors. Evidence (a smoke run, kept at `$TEMP/dry-qf3c.txt`), for `/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/roles/`:

```
404 .../session-e00f55c9/page.js
404 .../session-e00f55c9/sessions-and-tasks/session.jsonl
404 .../session-e00f55c9/sessions-and-tasks/page.js
404 .../sessions-and-tasks/deputy/session.jsonl
404 .../sessions-and-tasks/deputy/task.jsonl
404 .../sessions-and-tasks/deputy/page.js
404 .../session-e00f55c9/requirements.md
```

qf-3 already made `AITask`, `StoreFolder` and `Task.open_ref` try `session.jsonl` first, which took the session page itself from 22 errors to 0. What remains comes from walkers that probe each ancestor.

**Your worktree:** `C:/Code/lew42/worktrees/router-walk`, branch `worktree/router-walk`. It already has `worktree/qf-3` merged in, so it fails exactly the way the evidence shows. It merges after qf-3.

## Do

1. **Find every walker.** Reproduce with `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/router-walk /framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`, run from the main tree. For each kind of 404, name the code that asks for it as file:line. Expect at least these:
   - the Router or `Page.load` looking for an ancestor's `page.js` (`core/Router/Router.js`, `core/App/App.js:107`, `core/Page/`);
   - the task's parent-record walk (`session.jsonl`, `task.jsonl`, `requirements.md`: `ai/AITask/`, `ai/AISession/StoreFolder.js`, `core/Task/Task.js`).

   Write each one as a `log` line on this task.
2. **Choose the fix, and log it as a `decision` line with its alternative.** The aim: a walker asks once whether a file exists, instead of fetching it and getting a 404. Candidates:
   - the folder listing (`files.jsonl`), but in `ai/sessions/YYYY/**` it is git-ignored and often absent, so check whether anything writes it there;
   - the session store's own index (`ai/sessions/sessions.json`, `session-index.json` and `session-tree.json`), which already knows every task folder;
   - a walker that stops at the session root instead of climbing past it.

   Choose the simplest one that leaves no 404 and makes no extra request per ancestor.
3. **Build it, smallest change first.** Commit after each step, and run `node --check` on every file you touch. Do not change what a real page renders. `/framework/core/Page/` and `/framework/` must still pass smoke.
4. **Prove it:** the smoke run above shows 0 FAIL on linked task folders, or the FAILs left are listed with the reason each is not this walk. Also run `node public/framework/core/Task/Task.test.mjs` and any test beside a file you touched.
5. Log `ready: worktree/router-walk at <sha> <one line>` on this task and send `mastermind-page` one line.

## Never

- Kill or restart the dev server or Servex, drive the owner's tabs, or run `git stash`.
- Edit files in the main tree (`C:/Code/lew42/monorepo`), except this task's own log.

**Deliverable:** the branch, the smoke numbers before and after, and one decision line. Cut the third walker first if time runs out, and log why.
