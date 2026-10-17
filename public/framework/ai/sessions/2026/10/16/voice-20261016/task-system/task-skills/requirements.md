# Skills and readmes use the item tool: step 10 of the task system plan

Budget: $1 (Haiku)

Read first: the [plan](../plan.md), the **Names** table, **Clarifications**, and **Amendments 2–4**. The plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`.

**Build only step 10:** a text pass. No code changes.

## What to do

1. Find every skill and readme that tells an agent how to make or update a task:
   `grep -rln "task.jsonl\|new-task\|finish-task\|append.mjs" .claude/skills public/framework/ai/readme.md public/framework/core/Task/readme.md Servex/readme.md public/framework/ai/sessions/readme.md`
2. In each, make the instruction match the plan as built:
   - A task is made and changed through the **item tool** (`item(path, delta)`; `tasks.add` homes a new task at `<module>/tasks/<slug>/`), not by hand-writing JSON.
   - Use the plan's names exactly (Task, task home, the module's task list, `sessions`, `source`, `checked_by`, `expected`).
   - The **grouping rule**: subtasks live in the parent's `task.jsonl`; a child gets its own folder only on demand.
3. Change only the sentences that are wrong or missing. One or two lines each; link `/framework/core/Task/` for the detail instead of explaining it.
4. List anything you are unsure of in your report instead of guessing.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-skills`, branch `worktree/task-skills`, from `michael/dev`. Edit only inside it, and only `.md` files.
- **One commit,** attributed `Co-Authored-By: Claude Haiku 5 <noreply@anthropic.com>`. Do not merge.
- Report the hash and the list of files changed to `mastermind-task-system` with `send_to_agent`.
