# Today's dictations as tasks: step 17 of the task system plan

Budget: $2

Read the [plan](../plan.md)'s **Amendments 3**, item 5, at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`. Then read the owner's note `public/framework/core/Task/doc/owner-2026-10-16-ui.md`, "Group, do not scatter".

**What this step is for:** the task system has been built, and now it gets real data. Today's dictations become real tasks, so that step 15 (`Task.View`) and the module Tasks tabs have something true to show.

## What already exists

- `run_item(args, ctx)` in `Servex/agents/page_tools.js` is the item tool.
  - `tasks.add` gives each new task its own folder and line 1, plus a `page.js` that routes it.
  - The parent's log gets one `{"task": path}` reference line.
  - A task homed in a module also gets a reference in `<module>/tasks/task.jsonl`, the module's list task.
  - Step 16 also files a reference in `ctx.caller_log`, and takes the module from the call's path when the add names none.
  - Its first-call instructions carry `RULES`. Follow them.
- `Task.rank` and the Doc Tasks tab show a module's list.

## What to build

### 0. Children of a task stay inside their parent

- **The problem:** step 16's `module_of` takes the module from the path. A call made on `/framework/core/Task/tasks/<goal>/` therefore resolves to `core/Task`. The goal's children then land flat in `core/Task/tasks/`, and the module list references them twice, as a goal child and as a top-level entry.
- **The fix:** a path that is already inside a `tasks/` folder keeps 14a's rule, so the child goes in the parent's folder.
- Add one check for it in `item_tool.test.mjs`.

### 1. A manifest

- Write `seed.json` in this step's folder (`task-system/proof-data/`). It is the judgment part, and you write it by hand.
- **The shape:**
  - One goal task per module, keyed by module path (`core/Task`, `Servex`, `audio/Voice`, `ai`, `ext/Refine`…).
  - Each goal has a `title` and a `children` list of tasks.
  - Each child has a `title` and a `source` field, the app path of its note plus its `#heading`. Link it; don't copy the note's text.
- **The sources:**
  - every `owner-2026-10-16-*.md` in `core/Task/doc/`
  - `Servex/doc/owner-2026-10-16-tools.md`
  - `audio/Voice/doc/owner-2026-10-16-voice-conversation.md`
  - `Servex/agents/doc/owner-2026-10-16-realtime-interrupt.md`
  - `ai/doc/owner-2026-10-16-indexing.md`
  - `ext/Refine/doc/card-types.md`
- **Only asks become tasks.** An idea, an opinion or a principle stays a note: don't make a task for it. A refinement of an ask goes into that ask, not into a new task.

### 2. The task-system goal is computed, not typed

- The `core/Task` goal includes the task-system build: one goal, "Task system build". Its steps are its children, taken from the plan's step table.
- Each step's state comes from the `{"commit": hash}` lines in `../task.jsonl`.
  - The script runs `git log -1 --format=%s <hash>` for each hash and matches `step N` (or `14a`/`14b`).
  - A matched step is `complete`. Any other step stays open.
  - Write it into the task with the item tool, the same way as every other field. Look up how Task marks a task complete; don't invent a field.
  - Steps that were folded into others are marked complete, with a `note` saying where they went: 9 went into 14b, 4 into 15, and 6 into 16.

### 3. A node script applies it

- Write `seed.mjs` in this step's folder. It reads `seed.json` and calls `run_item` for each task:
  - each goal on `/framework/<module>/tasks/`, so its only reference is the module list;
  - each child on its goal's path.
- **Every call passes `ctx`:**
  - `caller: "voice-app"`;
  - `caller_log`: the voice session's own `public/framework/ai/sessions/2026/10/16/voice-20261016/task.jsonl`, if that file exists. The session then references the tasks its dictation made.
- **Rerunning is safe.** A task whose folder already exists is skipped, never made again as `-2`.
- **Never hand-write a `task.jsonl`.** Everything goes through `run_item`.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/proof-data`, on branch `worktree/proof-data`, made from `michael/dev`. Edit only inside it.
  - Run `seed.mjs` there, so the files land in the worktree.
- **One commit.** It holds:
  - the fix and its test;
  - `seed.json` and `seed.mjs`;
  - every file the script made.
- **Do not merge.** Your mastermind (`mastermind-task-system`) reviews and merges.
- **Your files:**
  - `Servex/agents/page_tools.js` (only `module_of`/`task_home`) and `Servex/agents/item_tool.test.mjs`;
  - this step's folder;
  - whatever `seed.mjs` writes under `public/framework/*/tasks/` and the voice session's `task.jsonl`.

## Check before the commit

- **Node:**
  - `item_tool.test.mjs`, `Task.test.mjs`, `Session.test.mjs` and `Item.test.mjs` pass.
  - Running `seed.mjs` a second time writes nothing.
- **A script prints the result:** every module list task, replayed with `Task.replay_new`, plus `Task.rank`, with each goal, its child count and how many children are complete. Put that printout in your report.
- **Headless only.** Serve the worktree's `public/` on a private port, and stop it after. Load `/framework/core/Task/` and open the Tasks tab: the goals are listed, and Task system build shows its steps.

Don't restart Servex, and never call `restart_servex`.

## Landing

- **Log as you go:** use `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`.
- **When it passes, send one message to `mastermind-task-system`:** the hash, the printout, and what you left as notes rather than tasks. Then stop.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
