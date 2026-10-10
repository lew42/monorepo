# Session shapes the loader must handle (for minion-session-class)

Found while building `core-links.mjs` (script, no model).

- **Many project folders, not one.** Raw sessions live in `~/.claude/projects/<cwd-with-dashes>/<id>.jsonl`. There are 167 such folders: the main repo, one per worktree (`C--Code-lew42-worktrees-<name>`), and one per agent working directory (`...-public-framework-servex`, `...-core-Page`). A loader that reads only the monorepo folder misses most Servex-spawned work.
- **File paths differ by worktree.** An edit in a worktree is recorded as `C:/Code/lew42/worktrees/<name>/...`; strip that prefix to get the repo path. Main-repo edits start `C:/Code/lew42/monorepo/`. Tool calls use backslashes on Windows.
- **Edits are `tool_use` blocks** named `Edit`, `Write` or `NotebookEdit` with `input.file_path`; the line's `timestamp` is the edit time, so a session spanning days must be filtered per day.
- **Session id is the filename**; resumed or forked sessions share content with their parent (do not count both).
- **Legacy:** `session.json` is read-only legacy; `task.jsonl` carries `landed_at` inside the `assign` line, not top level.

Result for 2026-10-07 and later: `sessions-core.json` (8 sessions, each with its 2-3 most-edited core files as `/path` links, ready for session cards). Re-run: `node core-links.mjs <date> <out.json>`.
Not done: the "already built, not indexed" list and the surface pass over overview files.

## Missing in old sessions (for the loader and the record spec)
Checked by script on what the audit already read; not exhaustive.
- **Name:** raw session files carry no title; the name must come from the first owner prompt, the task title in `task.jsonl`, or a log line.
- **Tags and core links:** none exist; `core-links.mjs` can compute the core links, tags need the log tool.
- **Model and effort:** present on assistant lines (model) but effort is not recorded in the raw file; spawned agents record it in `task.jsonl` only when the launcher wrote it.
- **Parent link:** worktree and spawned sessions have no pointer to the session that spawned them unless `task.jsonl` line 1 recorded it.
- **Closed state:** only `task.jsonl` `assign.landed_at` says closed; a raw session has no end marker, so "closed" cannot be read from the session alone.
- **Cost:** must be summed from the usage fields by a script, never by resuming a session.

## Status
`public/framework/ai/sessions/doc/data/record-spec.md` did not exist when checked, so no Haiku minion was briefed and nothing was tagged or logged. Next step once it lands: brief minions with its line shapes, run `node Server/usage-now.mjs` first.
