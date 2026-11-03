# Owner notes, 2026-10-17: routine procedures in the task system, node-driven

Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-15.md) (asks 4 to 6); this page keeps their essence and the facts checked on 2026-10-17. Recorded by the task-system checkup ([checkup.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/checkup.md)).

## 1. Routine procedures are task templates

Today the rules for a kind of work are written in English (skills, CLAUDE.md), and each agent is trusted to follow them. A code task should be committed, and it probably should have a worktree. The owner wants those rules built into the task itself, as a **template**: a code task carries "worktree, commit, review" as fields that node acts on, instead of a sentence an agent might skip.

Design: [templates.md](templates.md).

## 2. An accepted proposal starts itself

The mastermind settles a proposal, and the plan is reviewed. Once it is accepted, the task starts at once, or it is queued and starts when resources allow. Spawning the agent is automated too.

- Node writes every field it can: the time, the task id, the author, the agent id, the session id. The AI never types them.
- "As much node-driven as possible": a field node can compute is a field the AI does not write.

## 3. Tasks live by module, sessions point to them

Each module has a `tasks/` directory (`<module>/tasks/<slug>/`). Past work on a module is then found in the module, and tasks are managed by topic (the core page system, say), not only by session.

- A session references its tasks by path: the task directory's path and name. A task is recorded in two places, but the second is only a reference, never a copy.
- Built: the item tool makes the home and writes one `{"task":"<path>"}` line in the parent (step 14a); the migration gives old session tasks a module home with `sessions` references both ways ([readme](../readme.md#replay-waiting-subtasks), Migration).

## 4. Was the session folder's `task.jsonl` renamed to `session.jsonl`?

**Decided, not done.** Counted 2026-10-17:

| What | Count |
|---|---|
| Session folders (`ai/sessions/Y/M/D/<session>/`) whose log is still `task.jsonl` | 757 |
| `session.jsonl` files | 588 |
| Folders with both | 0 |

The 588 `session.jsonl` files are not the rename: they hold tags written by the digest pipeline (commit 317c8a057, "Session tags … for 588 sessions"). `Server/AskIndex.mjs`, `session-migrate.mjs`, `session-place.mjs` and `session-summary.mjs` read them. Every writer of a session log (`Server/TaskDirs.mjs`, `spawn_agent`'s task line) still writes `task.jsonl`, and the estimate for the rename is 757 files, plus 157 code files, 200 docs and 16 skills that name the file ([accounting answers, R11](../../../ai/sessions/2026/10/16/voice-20261016/accounting/answers.md#r11)).

The rename's verdict and brief belong to the sessions checkup ([checkup-sessions](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sessions/)), which owns the accounting requirements R11 and R15. A rename that size is scripted (`git mv` with a manifest), never retyped.

## 5. Which path form does the item tool use? (asked again in [requirements-17.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-17.md), ask 6)

The forms were weighed and one is live. The tool is `item({path, delta})` ([Servex/doc/item-tool.md](/Servex/doc/item-tool.md)). `path` is an **app path** (the item's url, such as `/framework/core/Task/tasks/task-system-build/`), and the tool finds that folder's log file from it. `delta` is **nested JSON applied by one recursive set**: each level of nesting is one hop, and a key that names a method calls it, a key that names a child walks into it, and anything else is assigned (`Item.set` → `set_one` in `core/Item/Item.js`, the same code the browser runs when it replays the file). A **dot path** is only shorthand: `"now.preview": x` is expanded to `{now: {preview: x}}` before anything is applied, so the file only ever holds the nested form.

The alternatives, and why they lost. A **file-system path** (`C:\…\task.jsonl`) ties every caller to one machine and one file name, which is exactly what is changing (`task.jsonl` → `session.jsonl`). **Dot paths as the stored form** cannot tell a child's id from a property name, and a dot inside an id breaks them; the owner ruled them out of the files on 2026-10-03 ("no dots: the path is the nesting"). Nested JSON wins because one line in the file is one call on the live object, the same in node and in the browser, so replaying a file always rebuilds the same state.
