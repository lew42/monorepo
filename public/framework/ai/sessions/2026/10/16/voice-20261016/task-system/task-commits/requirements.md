# Task commits: step 6 of the task system plan

Budget: $2

Every task records its own commits: one `{"commit":"<12-char hash>"}` line per commit in its `task.jsonl` (the plan's `commits` field; [plan](../plan.md), at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`, step 6). Today the mastermind writes these by hand, which breaks rule 7 (compute, don't recall). **Build only step 6.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-commits`, branch `worktree/task-commits`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge; `mastermind-task-system` reviews and merges.
- **Your files:** `Servex/agents/Agents.js` (only where `door()` builds `env`), a new `Server/git-hooks/post-commit.mjs`, a new `Server/git-hooks/install.mjs`, a test `Server/git-hooks/post-commit.test.mjs`, and a few lines in `Server/readme.md` (or `Server/doc/`) and `public/framework/core/Task/readme.md`.

## What to build

1. **`SERVEX_TASK` on spawn.** In `Agents.js` `door()`, both branches, put the agent's task file in its env as an **absolute path** to the main tree's `task.jsonl` (the task dir comes from `spec.task.dir` / `agent.task_dir`; find which is set). No task, no variable. A helper in a worktree must still write to the main tree's file, so resolve the path against the main repo, not `cwd`.
2. **`Server/git-hooks/post-commit.mjs`:** when `SERVEX_TASK` is set and the file exists, read `git rev-parse --short=12 HEAD` and append `{"commit":"<hash>"}` through `node .claude/hooks/append.mjs` (the single writer; never write the file directly). Skip it if that hash is already a `commit` line. Never fail the commit: any error prints one line to stderr and exits 0.
3. **The git hook itself:** `.git/hooks/` is not versioned and is shared by all worktrees. `Server/git-hooks/install.mjs` writes `.git/hooks/post-commit` (resolve with `git rev-parse --git-common-dir`) as a two-line sh script that runs `node Server/git-hooks/post-commit.mjs` if that file exists, else exits 0. It refuses to overwrite a `post-commit` that isn't its own (look for a marker comment), and prints what it did. **Run it once** at the end so the hook is live (there is no `post-commit` today; `post-merge` exists and is not touched).

## Check before the commit

- The test makes a temp git repo and a temp `task.jsonl` under `public/` (or calls the script with an env and a fake hash), and asserts: one `commit` line after a commit, none when `SERVEX_TASK` is unset, no duplicate on a second run, exit 0 when the file is missing.
- A `door()` check: an agent stub with a task dir gets `env.SERVEX_TASK` as an absolute path ending in `task.jsonl`; without one it has none.
- `node Servex/agents/item-local.test.mjs` and `node public/framework/core/Task/Task.test.mjs` still pass.
- Don't start Servex or restart it; never call `restart_servex`.

## Landing

- Log as you go: `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>` (a JSON array).
- When the commit passes, send one message to `mastermind-task-system`: the hash, what you checked, what you left undone, and whether the install ran. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
