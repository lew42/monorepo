# ai folder audit: what every folder in framework/ai is, who uses it, where it should go

Budget: $3. You are a Haiku minion; stay under 60k tokens of reading (let a script read, you read its summary). Parent: mastermind-system-architect, who tails your `session.jsonl`: log an overview line there as you go (what you are on, what is open), not chat.

## The owner's ask (2026-10-20, 16:15)

Audit every folder in `public/framework/ai/`: what is it, who writes it, where should it go. Port the old `ai/2026/…` session pattern into the sessions store by script. Prune only what nothing reads, by moving aside, never `rm`.

## Deliverables

1. **A census script** `census.mjs` in this task folder. For every entry directly under `public/framework/ai/` and one level down (skip everything inside `sessions/YYYY/` and inside `ai/2026/MM/DD/`, count those instead): name, file or folder, size, file count, newest change (`git log -1 --format=%cs -- <path>`), and which code reads or writes it (`git grep -l "<name>" -- "*.js" "*.mjs"`, the first 5 paths, excluding `public/framework/ai/sessions/` and dated folders). It prints JSON. You read its output in chunks under ~20k tokens.
2. **`public/framework/ai/doc/ai-folder-audit.md`**: one table, one row per entry: name · what it is (one line, from its readme or its first lines) · written by · read by · verdict: **keep** (a live system) / **store** (session data that belongs in `ai/sessions/YYYY/MM/DD/<name>/`) / **module** (belongs beside a module; name it) / **aside** (nothing reads it, nothing wrote it in 14 days: move to `public/framework/ai/archive/aside-2026-10-20/`). Most important rows first. Under the table, the counts per verdict. Link it from `public/framework/ai/doc/readme.md` with one table row.
3. **A move script, dry run only**: `move-old-sessions.mjs` in this folder. It plans moving each old-pattern session folder `public/framework/ai/2026/MM/DD/<name>/` into `public/framework/ai/sessions/2026/MM/DD/<name>/` (use `Server/TaskDirs.mjs` and `Server/SessionRecord.mjs` to compute paths and the record file name; do not edit either file), writes `move-manifest.jsonl` (one `{from, to, files}` line per folder, plus a `conflict` field when the target exists), and has `--apply` (git mv, by the manifest) and `--undo` (reverse by the manifest). **Do not run `--apply`.** The folders still being written today (`ai/2026/10/20/`, the prompt hook writes there) are listed as `skip: live` in the manifest.
4. **The aside moves**, only for rows marked aside, in your worktree with `git mv`, one commit. Nothing is deleted.

Fence: only this task folder, `ai/doc/ai-folder-audit.md`, one row in `ai/doc/readme.md`, and the `git mv` of aside entries. Commit in your worktree; your parent reviews and merges. Land with `finish-task` in your own `session.jsonl`.
