# Next steps — prioritised (nothing built yet)

1. **Wire `core/Task` to `task.jsonl`**: replay lines into a Task; add `blocked` and `abandoned` to its states; tests beside `Task.test.mjs`. Smallest useful step; proves state-by-replay.
2. **Derived `tasks-index.json`** (script, rebuildable): title, state, progress, owner, origin, home, cost. Retire the four disagreeing open/closed flags as *views* of it.
3. **In-process tools** `task_create`, `task_set`, `task_read`, `task_list` in `Servex/agents/tools.js`, writing through `append.mjs`.
4. **Origin + move**: `origin` on line 1, `task_move`; Sessions page lists a session's tasks by index query.
5. **Task card in Inbox/Sessions**: state chip, aggregate progress, sub-task rows (reuse AIRail rows).
6. **`task_plan`** (tree) for planning agents; `parent` field.
7. **Cost roll-up** from the session ledger once `session-class` lands.
8. **Page CRUD/move** in `core/Page` (see composition.md) — also unblocks tasks living anywhere.
9. Fold `servex-queue.json`, `todo.md` strikethroughs into the index (the `mastermind-task-audit` queue is the first customer).
