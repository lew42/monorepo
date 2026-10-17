Budget: $8

# Research brief: old tasks → new Task system

You are a read-only research minion for mastermind-task-migrate. Work in the worktree C:/Code/lew42/worktrees/task-migrate (read files there; it matches michael/dev). Write ONE file: C:/Code/lew42/worktrees/task-migrate/public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/research.md. Do not edit anything else. Do not commit.

Use node scripts (in your scratchpad) to COUNT and SAMPLE; never read hundreds of files by hand (CLAUDE.md law 7). Keep the report under ~400 lines.

## Read: the NEW system
- public/framework/core/Task/: Task.js, TaskPage.js, TaskView.js, TasksPage.js, readme.md, files.jsonl, tasks/, doc/*.md (esp. owner-2026-10-16-*.md)
- the plan: public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md and its Amendments section
- the item tool in Servex/agents (grep for add_item / item; find what it writes and where)
- task homes: <module>/tasks/<slug>/task.jsonl, flat slugs, refuse on clash — find the code that creates and discovers them (files.jsonl discovery). List every existing <module>/tasks/*/task.jsonl under public/.

## Read: the OLD system
- every requirements.md and task.jsonl under public/framework/ai/sessions/** (also older dated dirs public/framework/ai/20*/ if they hold task.jsonl — count them separately)
- Server/TaskState.mjs and its state.jsonl (where it is, what lines look like)
- public/framework/ai/tasks/ (the node-rebuilt index: what builds it, what it holds)
- Server/PastWork.mjs, Server/TaskDirs.mjs

## Output research.md with these sections
1. **Counts** (from a script; include the script path): session dirs, task dirs (dirs holding task.jsonl), total task.jsonl lines, distinct line kinds (top-level keys: assign, step, log, landed_at, experiment, …) with counts, requirements.md files, tasks with landed_at vs not, TaskState state.jsonl lines/tasks, ai/tasks index entries.
2. **Old schemas**: each line kind with one real example (trimmed), and what TaskState/state.jsonl and the ai/tasks index hold.
3. **New schema**: the Task class fields and the new task.jsonl line kinds (with examples from existing <module>/tasks/*/task.jsonl), how a session reference (`sessions` field) and source refs are meant to look, slug rules and clash refusal, how discovery finds a task (files.jsonl).
4. **Field-by-field mapping** old → new, as a table.
5. **Cases that do not map cleanly**: e.g. tasks with no title, nested child tasks, malformed lines, tasks in old dated dirs, duplicated slugs across days, tasks spanning modules, requirements.md with no task.jsonl, task.jsonl with no requirements.md, TaskState entries with no dir. Count each.
6. **Which old tasks clearly belong to a module**: propose a mapping rule (e.g. card/title prefix "<module>: …", paths named in the brief, files touched by its commits) with 10 real examples, and how many tasks the rule assigns vs leaves unassigned. Say how confident each signal is.
7. **Open questions / risks** for a migration script (idempotency, concurrent writers, live files).

Post a line in your task.jsonl every ~5 minutes of work. When done, end your turn with a 3-line summary.
