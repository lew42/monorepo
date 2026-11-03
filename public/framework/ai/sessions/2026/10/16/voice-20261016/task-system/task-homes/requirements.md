# Task homes, node side: step 14a of the task system plan

Budget: $3

Read these parts of the [plan](../plan.md) first: **Amendments 2**, item 6 ("One home, references elsewhere"), the Names table, and the Clarifications at the end. The plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`.

**Build only step 14a,** which covers three things:
- where `tasks.add` puts a new task;
- the reference line the parent gets;
- resolving those references in node.

The browser side is step 14b, a later brief: the Store resolving references, and a module page that lists its tasks.

## The rule

### Creating is the parent's add

A task is created by `item({path: <parent>, delta: {"tasks": {"add": {"type": "Task", title, module?, …}}}})`. That call lands in `run_item` in `Servex/agents/page_tools.js`, around line 428. There is no separate create.

### The home

- **With a module:** if the new task has a `module` and `public/framework/<module>/` already exists as a directory, the home is `public/framework/<module>/tasks/<slug>/`.
- **Otherwise,** the home is the parent's folder: `<parent dir>/<slug>/`. That covers a task with no module, and a task whose module folder doesn't exist.
- **Never create a module folder.** This also keeps `Server/AskIndex-tasks.test.mjs` inside its temp dir, because its modules are `test/no-such-module-*`.
- **`slug`:** kebab-case from the title, at most 40 characters. If that folder exists, add `-2`, `-3` and so on.

### The child's `task.jsonl`, line 1

Line 1 holds the task's own data, plus its app path and its parent's app path. For example:

`{"id": "<slug>", "path": "/framework/core/Task/tasks/<slug>/", "parent": "<parent app path>", "title": …, "module": …, "expected": …, "by", "ts"}`

- Pick the exact keys to fit `Task.replay_new` and `replay_line`. They read `assign.slug`; if needed, add a branch for a plain `id` on line 1.
- Add `path` and `parent` to Task's `FIELDS` and to page_tools' `TASK_KEYS`.
- Write files through the same `write_line` the tool already uses. Never hand-write JSON.

### The parent gets one reference line

The parent gets `{"task": "<child app path>", "by", "ts"}`, with no copied data. Don't write the `tasks.add` delta itself into the parent any more.

### Resolving references in node

- When the item tool, or anything else in node, replays a parent, each `{"task": "<path>"}` line becomes a live child in `tasks`, replayed from the child's own file.
- Put this in **one** place, used by both `run_item` and the `Session`/`Task` replay in node. Two ways to do it: pass an optional `resolve(path) → lines` to `replay`, or add a resolver step in page_tools after replay.
- A missing child file gives a stub child, with `state: "missing"` or similar, and doesn't throw.
- `completion` and `progress()` count the resolved children.

### What must keep working

- **Old inline children:** a parent whose log still has `{"tasks":{"add":{…}}}` lines replays them inline, as today.
- **Step 8:** `make_tasks` in `Server/AskIndex.mjs` already calls `tasks.add` through `run_item`.
  - Its dedupe by `source_key` must now look at the resolved children.
  - Run `node Server/AskIndex-tasks.test.mjs`, and adjust only what the new layout changes.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-homes`, on branch `worktree/task-homes`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:**
  - `Servex/agents/page_tools.js` and `Servex/agents/item_tool.test.mjs`
  - `public/framework/core/Task/Task.js` (only the replay hooks and `FIELDS`)
  - `core/Session/Session.js` (only if its replay needs the resolver)
  - `Server/AskIndex.mjs` and its test (only the dedupe)
  - a few lines each in `core/Task/readme.md` and `Servex/doc/item-tool.md`

## Check before the commit

Write node tests on fixture folders in a temp dir under `public/`, copying the setup from `item_tool.test.mjs`. Never touch real module folders, and delete what the test made. The tests must show:

- **A module task:** `tasks.add` with an existing module folder creates `<module>/tasks/<slug>/task.jsonl` with `path` on line 1. The parent gains exactly one `{"task": …}` line. For the module folder, make a fixture module dir in the temp tree, or point the module root at the temp dir through an option.
- **No module:** `tasks.add` creates `<parent>/<slug>/`.
- **A repeated title:** a second add with the same title gets `<slug>-2`.
- **Reading the parent:** reading it through `item` with no delta lists the child, with the state from the child's file.
- **Starting the child:** start it through its own path; the parent's `completion` shows the change on the next read.
- **A missing file:** a reference to a file that doesn't exist doesn't throw.

These must also pass:
- `node public/framework/core/Task/Task.test.mjs` (47/47)
- `node public/framework/core/Session/Session.test.mjs`
- `node Servex/agents/item_tool.test.mjs`
- `node Server/AskIndex-tasks.test.mjs`

`page_tools.test.mjs` already fails "children gets the new name" before your change. Ignore only that one failure.

Don't restart Servex, and never call `restart_servex`.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
