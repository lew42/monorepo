Budget: $20

# Item tool: instant read, query and CRUD of any item by path

**What the owner asked** ([prompt 0517a079, 2026-10-23 20:19](/framework/ai/sessions/2026/10/20/session-e00f55c9/), in `prompts.jsonl`):
- One item call answers any question about an item (a session, a task, a page), at once.
- The server builds the item, replays its lines and keeps it in memory; the call runs a method on it.
- Asking what is in a session never means reading raw JSONL or asking a mastermind.

**The plan:** [plan.md](../plan.md), section 2, "The item tool answers any item", and the gaps list below it. It records what is true today, measured.

## Your four subtasks (they are on this task's log, in this order)

1. **`query-without-writing`.** A class lists the methods and getters that only read, for example `static queries = ["progress", "cost", "duration", "children", "summary"]`. A delta whose keys are all queries runs them, answers `{ok, answer: {<key>: value}}` and writes **no** line. A delta that mixes a query with a change is refused with a clear reason. The `target` path (walking into a child) works for queries too. "A key naming a method calls it" stays the one grammar, so do not add a separate `get` key.
2. **`a-session-answers-as-a-session`.** One call on a session folder answers its tasks, completion, cost, duration and child sessions. Today a session folder replays as a Task (`class_of`, `Servex/agents/page_tools.js:383`), lists every task (150 for session-e00f55c9) and has no cost, duration or child sessions. `Task.cost` exists (`Agents.js` wires `cost_resolver`), but it is not in the answer. Add `duration` and `children` (the child tasks whose folder holds a session record), plus a `summary` query: counts by state, the open tasks only (id, title, state), completion, cost, duration and child sessions. **Keep the fields the current answer already has,** because other tools read them. Read `core/Session/readme.md` before you decide whether a session folder should replay as `Session` or stay a Task with these queries, and write down which you chose and why.
3. **`tests-for-session-task-and-page`, first half.** Add to `Servex/agents/item_tool.test.mjs`, using temp folders the way it already does:
   - a query writes no line (compare the file size before and after);
   - a mixed delta is refused;
   - the session summary is correct for a session with nested and referenced tasks.
4. **`a-real-page-on-the-server`.** Give the item tool a Page loader the way it has Task and Session loaders, so a page line is applied to a real Page and a bad key or unknown part type is refused before it is written.
   - The probe [node-page-probe/](../node-page-probe/) shows the real `Page.class.js` replays in node with a small DOM stub. Make the few import-time DOM touches safe in node instead (for example `View.js:468`, and the stylesheets `View.stylesheet()` loads on import), so no stub is needed.
   - Load one list of part types for the tool, the tests and the browser.
   - Add `public/framework/core/Page/Page.test.mjs`: replay a page.jsonl through the real Page in node; typed parts become their classes; an unknown type is reported. The item tool on a page refuses a bad line.
   - Also fix the hole that makes `Servex/agents/page_tools.test.mjs` fail: a `page.js` parent gets its child noted. The helper already exists in `Subpages.js:107-114` and is never called.

## How

- Work in a worktree (`take_worktree`), never in the main tree. Commit after each subtask, with a smoke run (`node Server/smoke.mjs <path>`) and the tests you touched passing (`node public/framework/core/Test/TestRunner.mjs <file>`).
- After subtasks 1–3, the branch is a merge on its own. Log "ready to merge: 1-3" with the branch name and the commit on this task, and send `mastermind-page` one line. Then go on to subtask 4 on the same branch.
- Mark each subtask complete with evidence (test names and pass counts) through the item tool on this task.
- Update the item tool's doc in the same branch (`public/framework/core/Page/doc/ai-api.md`, and the Servex readme where it lists the item tool): what a query is, and one example of each.
- Do not restart Servex. `mastermind-page` merges and restarts after reviewing the diff.
- Never: a new npm dependency, `git stash`/`checkout --`/`reset` in the main tree, the owner's browser tabs, the owner's name.

## Done

All four subtasks complete with evidence. `item_tool.test.mjs`, `page_tools.test.mjs` and the new `Page.test.mjs` pass. The branch is ready to merge. Report on one screen: what one call on a session now answers (paste the real answer for session-e00f55c9), and what is left.
