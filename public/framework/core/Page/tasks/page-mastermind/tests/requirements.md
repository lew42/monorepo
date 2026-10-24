Budget: $8

# core/Page tests: Store, List and streaming

Load the `minion` skill first. This task's log is `session.jsonl` in this folder (Servex wrote line 1 and moved the subtask here).

**Why:** every later core/Page step changes Page, Store or the item tool, and a break there is silent today. [plan.md](../plan.md), section 3, "The first five tests", has the design. Two of the five are already done on `worktree/qf-5` (`core/Page/Page.test.mjs`, and the item tool on a page in `Servex/agents/item_tool.test.mjs`), so three are yours.

## Your three tests

1. **`public/framework/core/Item/Store.test.mjs`** (`core/Item/Store.js`, class `Store`):
   - a `set()` appends exactly one line;
   - replaying the file rebuilds the same state;
   - a child with its own file writes its own file, plus the note in the root.
2. **`public/framework/core/List/List.test.mjs`** (`core/List/List.js`): add, remove, move and order each survive a save and a replay. Also check that `add([a, b])` adds two members (fixed on qf-5, so this test may fail on michael/dev until that merges; if so, say so in the log rather than skipping it).
3. **A streaming test, end to end, in node, with no browser:**
   - Append a line to a page.jsonl in a temp folder.
   - Check that `Server/plugins/SocketServer/Tail.js` sends it to a subscribed socket (use a fake socket object).
   - Check that the browser-side tail applies it to a page, so the page's content changes.
   - Find the browser side yourself, starting at the `live(` call in `public/framework/core/Page/Jsonl.js`, and name its file:line in your log.
   - Put the test beside `Tail.js` as `Server/plugins/SocketServer/Stream.test.mjs`, print how long the trip took, and keep it under 5 seconds.

Use `core/Test/Test.js` (`ok`, `eq`, `done`) and temp folders, the way `core/Item/act.test.mjs` does. If a test finds a real bug:
- fix it if the fix is small and inside `core/Item`, `core/List` or `core/Page`;
- otherwise log it as a `log` line with the file:line, and leave the test failing.

## How

- Work in a worktree of your own: `node Server/worktree-up.mjs page-tests` (branch `worktree/page-tests`). Never work in the main tree.
- Run each test with plain `node <file>`, and also with `node public/framework/core/Test/TestRunner.mjs <file>`.
- Commit after each test.
- Mark each subtask complete on this task's log through the item tool, with evidence (the pass count).
- When all three pass, log `ready: worktree/page-tests at <sha> <one line>` on this task and send `mastermind-page` one line.
- Never kill or restart the dev server or Servex, never drive the owner's tabs, and never `git stash`.
- Write nothing in `Servex/`, in `Server/merge.mjs` or in `Servex/WorktreeWatch.js`. Running tests on save and at merge is a separate proposal.

**Deliverable:** three test files that pass, committed on `worktree/page-tests`, plus a ready line. Cut the streaming test's browser half first if time runs out, and log why.
