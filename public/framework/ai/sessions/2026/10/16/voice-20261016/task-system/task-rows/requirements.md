# See the tasks: step 15 of the task system plan

Budget: $3

**Read first:**
- The [plan](../plan.md) at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`. Read **Amendments 3** item 2 and **Amendments 4** item 5.
- The owner's note `public/framework/core/Task/doc/owner-2026-10-16-ui.md`.

**What this step is for:** the owner wants to *see* the tasks tonight: what was asked, what is done, and what is still open. Step 17 seeded real data, so draw it.

## What exists

- `core/Task/TaskView.js` draws a task at three sizes (`chip`, `row`, `card`). The card lists facts but **not the children**. So `/framework/core/Task/tasks/task-system-build/` shows "73%" and none of its 22 steps.
- `Task.rank(list)` orders a list. `Task.progress_of`, `task.completion`, `task.state` and `task.tasks` exist. References (`{"task": path}` lines) resolve through `Task.from_ref` / `open_ref`.
- **The real data:** module lists at `core/Task/tasks/`, `servex/tasks/`, `audio/Voice/tasks/`, `ai/tasks/` and `ext/Refine/tasks/`, each with one goal and its children.
- **The module Tasks tab** (step 14b) lists a module's tasks. Find it with `grep -rn "Task.rank" public/framework`.
- **The /live/ feed:** `public/live/Live.js`. A card `{type:"part-live", live:"today"}` is drawn by a class (`LiveCard.live = { today: LiveToday }`). Use the same seam for the Tasks card.

## What to build

### 1. `Task.View` row: one look everywhere (`TaskView.js`)

- **The row:**
  - a checkbox (checked when complete, display only);
  - **one stage icon per state:** idle, waiting, running, paused, stopped and complete, next to the checkbox. Pick Material icon names, and keep them in one static map on TaskView;
  - the title;
  - a segmented progress bar: one small segment per child, lit when that child is complete. A task without children gets no bar.
- **A parent with children renders bigger**, as a larger title, and previews its first few open children as rows beneath it.
- **It expands in place:** a click on the row toggles its children (all of them, each a row, recursively). The title link opens the task's own page.
- **The card size** (`TaskPage`, a task's own page) shows the children as rows too. Then Task system build shows its 22 steps, complete ones checked.
- A task that is not complete stays unchecked and in view.
- CSS goes in a `TaskView.css` (or the existing Task css, if there is one), inside a layer, using the framework tokens. Run the `css` skill first.

### 2. The module Tasks tab uses the row

- It lists the module's tasks in `Task.rank` order, as `Task.View` rows.

### 3. The /live/ Tasks card

- A `LiveTasks` class beside `LiveToday`, registered as `live: "tasks"`.
- It lists the open goal tasks of every module list above, in `Task.rank` order, biggest first.
- **Each goal is wrapped in its module context:** the module's icon and title as a mention link, then the task row.
- Find the module lists by walking the known module `tasks/` lists. A small static array in LiveTasks is fine for now; step 3c replaces it with the node-built index.
- **Do not post the card yourself.** Your mastermind adds `{type:"part-live", live:"tasks", id:"tasks", title:"Tasks", preview:"Tasks"}` to `/live/` after the merge.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-rows` (branch `worktree/task-rows`, made from `michael/dev`). Edit only there.
- **Your files:**
  - `core/Task/TaskView.js` and its css;
  - the Doc Tasks tab file that step 14b made;
  - `public/live/Live.js` (registration only) and a new `public/live/LiveTasks.js`;
  - `core/Task/readme.md`: one line on the row.
- **One commit.** Don't merge.

## Check before the commit

- **Node:** `node public/framework/core/Task/Task.test.mjs` passes.
- **Headless only:** serve the worktree's `public/` on a private port, and never drive the owner's tabs. Take shots at 400 and 1200 of:
  - `/framework/core/Task/tasks/task-system-build/` (22 rows, 16 checked);
  - `/framework/core/Task/` → Tasks tab;
  - a scratch page or test harness that mounts the LiveTasks card.
- Put the shot paths in your report.

Don't restart Servex, and never call `restart_servex`.

## Landing

- Log as you go with `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`.
- When it passes, send one message to `mastermind-task-system`: the hash, the shot paths, and what you left. Then stop.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
