# Minion brief: the task-folder move script (`Server/TaskMove.mjs`)

Budget: $15. Parent: `mastermind-task-folders`. Decision you implement: [`ai/doc/task-folders.md`](../../../../../../doc/task-folders.md) — read it first.

## What to build

`Server/TaskMove.mjs`, one class `TaskMove` (static methods; CLI at the bottom like `Server/TaskDirs.mjs`, whose style and snapshot/verify/undo code you should reuse by importing `TaskDirs`, not copying). It moves every flat day folder `public/framework/ai/YYYY-MM-DD/` into the sessions store. **Write and test the script only; do NOT run `--apply` on the real tree.** The mastermind runs it.

### 1. `TaskMove.sessions()` — id → session folder
Scan `public/framework/ai/sessions/YYYY/MM/DD/*/`. A folder belongs to session `<uuid>` when: its name is the uuid, or `session-<id8>`, or its `index.json` `.id` (or `cache.jsonl` first line `.summary.id`) is the uuid. Return `Map(uuid → abs dir)` plus `Map(id8 → abs dir)`. Must be fast (≈8,000 folders): read `index.json` only for folders whose name is not id-shaped.

### 2. `TaskMove.plan()` — pure reading, the manifest
For each day folder `ai/YYYY-MM-DD/` (49 of them):
- **Task folder** `<slug>/` holding `task.jsonl` (or any folder): session id = the first `"session_id":"…"` in its `task.jsonl` (a regex is fine). Target:
  - session folder found → `<session folder>/<slug>/`
  - else → `sessions/YYYY/MM/DD/<slug>/`
  - target taken → append `-2`, `-3`… Record the reason.
- **Stub folder** holding only `moved.json` (+ maybe `files.jsonl`) — left by the 10-10 pass (`ai/sessions/task-manifest.json`). Its task already sits at `<session>/task/` or `task-N/`: plan a **rename** of that `task*/` folder to `<session>/<slug>/`, and move the stub folder to `public/framework/ai/archive/task-stubs/YYYY-MM-DD/<slug>/` (never delete).
- **Loose day files** (`day.jsonl`, `files.jsonl`, `page.jsonl`, `page.js`, anything else) → `sessions/YYYY/MM/DD/<name>`; if taken, `day-<name>`.
- Output: an array of `{kind:"task"|"rename"|"stub"|"dayfile", from, to, session, why}` (repo-relative, forward slashes), plus counts.

### 3. `--dry` (default): print counts + write the plan to `public/framework/ai/sessions/task-moves.plan.json`. Changes nothing else.

### 4. `--apply [--only YYYY-MM-DD,...] [--skip slug,...]`
- Snapshot each folder first (size + sha1, `TaskDirs.files`), append the manifest line BEFORE moving (so an interrupted run can undo): `public/framework/ai/sessions/task-moves.jsonl`, one JSON line per move `{at, kind, from, to, session, files:[…]}`.
- Move with `fs.renameSync` (it carries untracked and ignored files; git sees the rename on the next `git add -A <old> <new>`). Never overwrite: a taken target throws.
- Remove a day folder only once it is empty (`rmdirSync`, never recursive).
- `--only` and `--skip` let the mastermind leave live tasks for later.

### 5. `--verify` and `--undo` — same contract as `TaskDirs`: every snapshot file at its new path with the same sha1; undo moves everything back in reverse order and renames the manifest aside.

### 6. `TaskMove.relink(files)` and `--relink [--dry]` — rewrite links from the manifest
- In `.md`, `.js`, `.mjs`, `.json` and `.html` files under `public/`, `Server/`, `Servex/`, `.claude/` and the root (`readme.md`, `CLAUDE.md` is OFF LIMITS — list its hits, don't edit), excluding `node_modules`, `.claude/worktrees`, and **every `*.jsonl`** (logs are history; old paths in them resolve by redirect): replace each moved old path with the new one. Match all three spellings: `public/framework/ai/YYYY-MM-DD/<slug>`, `/framework/ai/YYYY-MM-DD/<slug>`, `ai/YYYY-MM-DD/<slug>`, and relative ones (`../2026-10-12/<slug>/`, `../../2026-09-30/x`) by resolving them against the file's own folder.
- **Moved files' own relative links**: a `.md` inside a moved task (e.g. `[x](../../../../../../doc/y.md)`) breaks because the folder is deeper now. For each relative link in a moved file, resolve it against the OLD location; if the target lies outside the moved folder, rewrite it relative to the NEW location (and map the target through the manifest if it moved too).
- `--dry` prints a count per file and 20 sample before/after pairs; without `--dry` it writes. Bare day links (`/framework/ai/2026-10-12/`) map to `/framework/ai/sessions/2026/10/12/`.

### 7. `TaskMove.redirects()` — write `public/_redirects` lines (Cloudflare format, `/framework/ai/2026-10-12/slug/* /framework/ai/sessions/…/slug/:splat 301`) into `public/framework/ai/sessions/task-redirects.txt` (the mastermind wires it into `_redirects`). Check whether `public/_redirects` exists and say so.

## Test (required)
`Server/TaskMove.test.mjs` (plain node, no deps): builds a fake repo in the OS temp dir with 3 day folders (a task with a session folder, a task without, a stub + `task/` from the 10-10 pass, a collision, loose day files, an md with relative links), runs plan → apply → verify → relink → undo → apply, and checks hashes and links. Run it. Also run `node Server/TaskMove.mjs` (dry) on the real repo and paste the counts into your report.

## Where and how
- Work in a worktree (`take_worktree()` or `git worktree add`); commit there with the attribution line; tell the parent the branch name. Don't touch other files.
- Log progress lines to `public/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/task.jsonl` with `node .claude/hooks/append.mjs <file> <lines.json>` (`{"log":{"at":"NOW","msg":"…"}}`) every few minutes.
- Final reply: branch, test result, dry-run counts, anything surprising. Five lines.
