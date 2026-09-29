# Nested tasks — subtasks, in parallel or in series

A task can have subtasks, to any depth. Some run at the same time (**parallel**), and some wait for others to finish first (**series**). The [task tree](/framework/ext/AITask/tree/) draws a day of them: which ran together, which waited, what is running now, and how far along each one is.

- **See it:** [today's tree](/framework/ext/AITask/tree/) · [a made-up two-phase plan](/framework/ext/AITask/tree/demo/)
- **The data:** `tree.js` (pure functions, no DOM; `node public/framework/ext/AITask/tree.test.mjs` runs its tests)
- **The picture:** `nested.js` + `nested.css`

## Two fields on a task's first line

Nothing new is stored anywhere else. A task's `task.jsonl` line 1 carries two more facts:

```json ai/<date>/<parent>/<child>/task.jsonl
{"assign": {"agent": "minion-docs", "parent_task": "2026-09-29/nested-tasks",
            "after": ["2026-09-29/nested-tasks/minion-data"], "steps": ["…"], "step": 1}}
```

- `parent_task` — the parent task's dir. Servex's `spawn_agent` writes it from its `task: {dir, parent_task, after}` option; when it is left out, the live parent agent's own task dir is used.
- `after` — the sibling tasks this one waits for: the series edge. Always full task dirs (`<parent dir>/<sibling>`), never bare slugs; Servex stores them repo-relative like `parent_task`, and the tree matches them exactly, so a slug waits on nothing.

A minion always gets its own task dir, inside its parent's. A parent never shares its log (one minion's steps once showed up in its parent's ledger as "step 2 of 7").

A subtask's page is at its folder's url, inside its parent's (`/framework/ai/<date>/<parent>/<child>/`). `AITask.route()` opens it with the same task template, but only for a folder that holds a `task.jsonl` and no `page.js`; it reads the folder list from `directory.json` (`listing.js`), so off the dev server nothing nested is claimed.

## Older logs, which have neither field

`tree.js` finds the parent another way, strongest first:

1. `parent_task` on line 1.
2. The folder: a task dir inside another task dir is its subtask.
3. The inbox: a dir whose line-1 `agent` (or `tab`) sent a row to another dir's `inbox.jsonl` is that dir's child. An inbox sender with no dir of its own becomes a leaf: landed if its last row is `done`, **stopped** if it is `stopped` or `error` (grey, not counted as running), running otherwise.

## The title

A task's own `title`, else its brief's first heading, else the first sentence of line 1's `request`, else its card's slug, and only then its folder's slug.

## The %

- A task with no subtasks: `(step - 1) / steps` — the steps already finished. No `steps` reads 0% while running.
- A task with subtasks: the mean of its subtasks, each weighted by its number of steps (1 when it has none).
- A landed task is 100%, whatever its steps said.

## Phases: which ran together

A task's subtasks are grouped into **phases**. Everything in one phase ran at the same time; each phase waits for the one before it.

- With `after`: a layering — a task sits one phase after the latest task it waits for.
- Without `after`: by time — a subtask that started after every task in the current phase had landed opens a new phase; one that overlapped joins it.

## Waiting

A task is **waiting** when something in its `after` has not landed yet. Its row says "waits for …" and names those tasks. Otherwise it is **running** until its log has `landed_at`. Logs written before 2026-09-29 carry no `after`, so on those days nothing waits and every group reads as parallel; [the demo](/framework/ext/AITask/tree/demo/) shows both.

## The three designs

The owner was not sure how this should look, so three were built on the same tree. The tree page shows what is in flight first and folds the landed tasks under "N landed". Each is a class in `nested.js`, extending `TaskTree` (the shared marks: a check for done, a pulsing dot and % for running, a clock for waiting).

| Design | How it reads | Page |
|---|---|---|
| **Lanes** (the default) | phases as columns, left to right, a bold "then" between; subtasks nest inside a card | [lanes](/framework/ext/AITask/tree/lanes/) (also at `/tree/demo/`) |
| Outline | an indented tree, each group badged "together" or "then" | [outline](/framework/ext/AITask/tree/outline/) |
| Flow | a graph: an arrow for every "waits for" | [flow](/framework/ext/AITask/tree/flow/) |

Lanes won because parallel and series are where a card sits, not a word you read, and it shows every level. The decision, with the alternatives, is the `tree-design` line in `ai/2026-09-29/nested-tasks/minion-view/task.jsonl`. To try a fourth, add a subclass and a page beside the others; `Winner` in `nested.js` picks the default.
