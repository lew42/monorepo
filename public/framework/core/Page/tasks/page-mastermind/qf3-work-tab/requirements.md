Budget: $8

# The session page's Work tab: bare task-id lines count, and a TaskPage opens its step folders

Load the `minion` skill first. This task's log is `session.jsonl` in this folder.

**Why:** the owner's session page has a Work tab (session `e00f55c9`). mastermind-deputy's branch `worktree/qf-3` fails its merge smoke on 21 linked pages, for two causes. Both are in the code that reads task records and opens task folders. You fix them on a branch the deputy can fast-forward qf-3 to.

**Reproduce first** (run from `C:/Code/lew42/monorepo`; this copy of smoke.mjs treats git-ignored 404s as warnings):
`node C:/Code/lew42/worktrees/smoke-ignored/Server/smoke.mjs C:/Code/lew42/worktrees/qf3-work-tab /framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/ --main C:/Code/lew42/monorepo`
Keep the output in your scratchpad, and log the FAIL count.

## Cause 1: a line that names a task by its bare id is dropped

`public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session.jsonl`:
- lines 124 and 129 write a nested task's id at the TOP level: `{"top-priority-task-resolution-objective-4":{"start":{}, …}}`;
- line 120 writes the same walk the long way: `{"tasks":{"top-priority-task-resolution-objective-4":…}}`.

The item tool's documented grammar says a key naming a child walks into that child wherever it lives. So **the decision is: the replay resolves a bare child id anywhere in the tree.** The alternative was that the writer refuses it, but lines like these are already in committed logs, and the readers must still read them. Two readers drop these lines today:
- **(a) The record:** check whether `Task.replay` (`core/Task/Task.js`) and `Session` (`core/Session/Session.js`, `apply_line`) apply a top-level bare id to a nested child, including one nested two levels down (line 129 nests a second id inside the first). Find where a key is resolved (Item's `apply` / `locate` in `core/Item/Item.js`). Make a bare id that is not a field, method or list resolve to the descendant with that id (Item has a deep `find`). Write a node test beside the class you change that proves line 129's shape completes the nested child. Run `node public/framework/core/Task/Task.test.mjs` (60/60 today) and the core/Session tests.
- **(b) The browser viewer:** `TaskJSONL` (`public/framework/ext/JSONL/JSONL.js`, `skip()` at about line 119) warns "unknown verb <id>" for each such line. That is what pushes 16 pages over the console budget (13–15 against 5). After the replay, a key that names a task in the replayed task (`this.task` in `ai/AITask/AITask.js` `session()`, or the TaskJSONL's own replay) is a walk, not an unknown verb: do not warn for it.

Check the result: the Work tab's done count for process-system. Log it before and after.

## Cause 2: a TaskPage does not route its step folders

`…/process-system/run-1/readmes-page/` has a `page.js` (`new TaskPage({meta: import.meta})`, `core/Task/TaskPage.js`) and four step folders, `review/`, `execute/`, `investigate/` and `improve-plan/`. Each holds a `session.jsonl` and a `past-work.md`, and no `page.js`. All four 404 with "nothing matches".
- `AITask.route()` (`ai/AITask/AITask.js`, about line 79) already opens such a folder: it asks the folder listing whether the folder holds `session.jsonl` or `task.jsonl` and no `page.js`.
- The listing is `ai/AITask/listing.js` (`names(dir)`, which asks the dev server's `/api/folder-names` and nothing off the dev server).
- core must not import from `ai/`. So **move `listing.js` to `public/framework/core/Router/listing.js`**, the one folder listing for routing. Do it with `git mv`, and update its importers (`rg "listing.js"`).
- Give `TaskPage` a `route(sub)` with the same rule, opening the child as whatever AITask/TaskPage opens a task folder as today. Read how `AITask.route` builds its child, and reuse it rather than writing a second copy.

## Prove it, then hand back

- `node --check` every touched file; Task.test 60/60, plus your new test.
- Re-run the smoke above. Log the FAIL count before and after, and list every FAIL left with its cause.
- `/framework/core/Page/` and `/framework/` must still pass.
- **Commit on `worktree/qf3-work-tab` only.** It starts exactly at qf-3 (`d19c5a375`), so the deputy can fast-forward qf-3 to it. Never merge michael/dev into it; that would break the fast-forward.
- Log `ready: worktree/qf3-work-tab at <sha> <one line>` on this task, and send `mastermind-page` one line.

## Never

- Kill or restart the dev server or Servex, drive the owner's tabs, or run `git stash`.
- Edit the main tree (`C:/Code/lew42/monorepo`), except this task's log.
- Rewrite a line in any `.jsonl` log: the old lines must read as written.

**Deliverable:** the branch, the smoke numbers before and after, the Work tab done count before and after, and the new test. If time runs out, cut cause 2 first and log why: cause 1 also fixes a wrong count.
