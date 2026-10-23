# A session folder's one record: `session.jsonl`

A session folder (`ai/sessions/YYYY/MM/DD/<session or agent id>/`) keeps **one** record file, `session.jsonl`. A task folder keeps `task.jsonl`. This page is the rule, how a reader tells them apart, and how the move was done and can be undone.

## The rule

- `session.jsonl` holds two kinds of line in one file, told apart by their verb (one verb is shared: `note` is also a task verb, so a log `{"note":…}` line is counted as a record note by `AISession.record()`; harmless, listed so nobody is surprised):
  - the session's own log, what `task.jsonl` held there: `assign`, `log`, `agent`, `chat` and the other task verbs;
  - the digest lines, what `session.jsonl` held before: `tag`, `summary`, `note`, `alert`, `weight`, `closed`, `question`, `links`.
- A task folder (a child of a session folder, or any folder whose `task.jsonl` line 1 has no `session_id` of its own) **keeps `task.jsonl`**, and the move never touches it.
- A file is one record, so appends are still append-only. Nothing is rewritten: a move is a rename, or an append plus a rename.

## Telling a session folder from a task folder

| Question | Session folder | Task folder |
|---|---|---|
| Where is it? | directly under a day: `YYYY/MM/DD/<name>/` | deeper, inside a session folder |
| Line 1 | `{"assign":{"session_id":"…"}}` (its own id) | `{"assign":{"title":…}}`, no own `session_id` |
| Record file | `session.jsonl` (`task.jsonl` until moved) | `task.jsonl` |

A folder that holds only digest lines in `session.jsonl` (588 of them, no log) is a session folder with no log yet; `SessionRecord.log_file(dir)` returns `null` for it, so it never shows up as a phantom task.

## The script: `Server/SessionRecord.mjs`

```
class SessionRecord
  static file(dir)            the record to open: session.jsonl, else task.jsonl
  static log_file(dir)        the log (not a tag-only file), by either name, or null
  static is_log_entry(dir, n) for a directory walker: is this entry the folder's log?
  plan() / apply() / undo(manifest)
```

```
node Server/SessionRecord.mjs --plan                  counts, skips and why (writes nothing)
node Server/SessionRecord.mjs --apply                 does it, stages (never commits) old + new paths
node Server/SessionRecord.mjs --undo <manifest>       reverses the last run (or --run <id>)
```

- **rename:** `task.jsonl` becomes `session.jsonl` (`git` sees a rename).
- **merge** (both files, `session.jsonl` is tags only): the tag lines are appended to the end of `task.jsonl`, byte for byte and in order, then it is renamed over; the line count and the bytes are checked before the old tag file goes. None existed on the day of the move.
- **fold** (`session.jsonl` already holds the log and a writer recreated `task.jsonl`): the new lines go on the end of `session.jsonl`. This is what a later run does for a writer that still uses the old name.
- **skip** (listed with the reason): task folders, and any folder whose `task.jsonl` changed in the last `--quiet` minutes (default 60), so a running agent's log is never renamed under it. A later run takes those.
- **Manifest:** `ai/sessions/session-record-moves.jsonl`, one header line per run plus one line per move: old path, new path, lines and bytes before and after, sha before and after. `--undo` reads it; it renames back, and splits a merge by the recorded line counts. It refuses to overwrite a `task.jsonl` that is back.
- Tests: `node Server/SessionRecord.test.mjs` (throwaway git repo: plan, rename, merge, fold, skip, manifest, undo, and `append.mjs` following the move).

## The counts (2026-10-17, main tree, before the move)

| | Folders |
|---|---|
| rename only | 699 |
| merge then rename (both files) | 0 |
| fold | 0 |
| skipped: task folders (line 1 has no own `session_id`) | 57 |
| skipped: active (changed within 60 min) | 1 |
| already hold only `session.jsonl` (digest tags) | 588 |
| child task logs below a session folder, never touched | 929 |

The brief expected 588 folders holding both files; there are none. The 588 digest-only folders have no `task.jsonl` at all, so the move is a pure rename and the rename "collision" does not occur.

## Writers: a new session folder starts as `session.jsonl`

`SessionRecord.start_file(dir, first)` answers "which file does this line go to?" so no writer types the name:

- the log that already exists, by either name; else
- `session.jsonl`, when the first line is a spawn line `{"assign":{"session_id","agent"}}` (any depth, a sub-session) or `{"session":…}` (cloud voice), or a `session_id` line directly under a day; else
- `task.jsonl` (any task folder, deeper in a session).

Two writers ask it: `Servex/agents/Agents.js` (`open_task`, the launch line of `spawn_agent`) and `.claude/hooks/append.mjs` (every agent's `new-task` launch line, which still names `<dir>/task.jsonl`; the hook redirects it). `node Server/TaskDirs.mjs --new` makes the folder, never its record. Both it and `open_task` add one `{"task":"<url>"}` reference to the parent's log (`SessionRecord.link_parent`), so a folder under a session counts as one of its tasks:

- **Which parent:** an explicit parent wins (`--parent`, or `open_task`'s `parent_task`, the task that handed work to a child session); else the nearest folder above with a log, up to the session folder.
- **A tab session with no log yet** (`session-<id8>/` holding only its transcript cache): the reference starts its `session.jsonl` with `{"session":{id, kind:"vscode-tab"}}`. The id comes from the caller and must start with the folder's 8 characters, so an id is never invented.
- **Not linked:** `spawned/<agent>/` and `cards/` are day-level containers, not sessions; an agent spawned by a caller Servex does not know lands there with no parent.
- **Backfill and census:** the daily tick (`Servex/TaskLoop.js` `follow_up_daily()`, beside StaleClose) calls `SessionRecord#apply_links()`, so every folder below a session gets its reference with no hand step, and one row per folder lands in the links ledger (`SessionRecord.LINKS`). By hand: `node Server/SessionRecord.mjs --links` counts every folder below a session and whether its parent references it (writes nothing; `--list` names them), and `--links --apply` runs the same backfill. On 2026-10-22, 1101 folders were checked: 1 was referenced, 801 were missing a reference, and 299 had no parent log and no session id. Tests: `Server/SessionRecord.test.mjs`, `Server/stale-close.test.mjs`, `Servex/agents/open-task.test.mjs`.

## Session → task → child session

- **A session** is made by Servex on `spawn_agent` (`open_task`, before the first turn), by a VS Code tab (its `session-<id8>/` folder), or by a voice call. Its folder sits under the day, or under the caller's session folder.
- **A task** is made by the `new-task` skill or the item tool (`tasks.add`). Its folder goes inside the session (or task) that made it: `<session folder>/<slug>/task.jsonl`; a task with a module home goes to `<module>/tasks/<slug>/`.
- **A child session** is a session spawned from inside another one, so its folder is `<parent session folder>/<agent id>/`. If the caller is a task, `parent_task` names that task as the parent.
- **The reference:** whichever way a folder is made, `SessionRecord.link_parent` appends one `{"task":"<url>"}` line to the parent's log (the nearest folder above with a log, or the explicit parent), never twice. The daily tick backfills any that were missed.
- **Completion rolls up** by replaying the logs: a session's completion is its referenced tasks done over total (`Session.progress()`), and a child session counts as one of them through its reference. Nobody writes a percentage.
- **A task moves to a child session** with `spawn_agent` and `task: {from, id}`: the subtask leaves the spawner's log and its history is moved into the child's folder (`move_item` in `Servex/agents/page_tools.js`). A refusal is written into the child's log as a `handoff` line.
  A handoff leaves exactly one reference on the parent (move_item's `{"task","as":id}` line); `open_task` links the child itself only when there is no handoff or it is refused. **Proved by** `node Servex/agents/handover.test.mjs` (temp store: history moved, one reference however often `link_parent` or `--links` runs, completion rolls up).
- **A simple process** (two steps, build → review) runs through `ProcessRunner`: each step starts, completes with `{outcome, evidence}` (no evidence is refused), the task completes with the last step. **Proved by** `node Servex/ProcessRunner.test.mjs`.

## Readers: every one accepts both names

A reader opens `SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")` and a directory walker asks `SessionRecord.is_log_entry(dir, name)`. `task.jsonl` stays accepted (a folder not yet moved, an old branch).

- **Node:** `Server/TaskState.mjs`, `Transcripts.mjs`, `SessionIndex.mjs`, `TaskDirs.mjs`, `AskIndex.mjs` (replay), `merge.mjs`, `DaySpend.mjs`, `health.mjs`, `task-closeout.mjs`, `PastWork.mjs`, `FollowUp.mjs`, `Steps.mjs`, `task-cost.mjs`, `spend-tree.mjs`, `landing-audit.mjs`; `Servex/TaskLoop.js`, `Heartbeat.js`, `Lifecycle.js`, `Worktrees.js`, `asks/tasks.js`, `agents/tools.js`, `agents/Agents.js`, `agents/page_tools.js`, `cards/Cards.js`.
- **Hooks:** `.claude/hooks/append.mjs` (a line meant for a moved `task.jsonl` lands in the `session.jsonl`; the old name is never recreated), `ledger.mjs`, `jsonl-schema.mjs` (`session.jsonl` has the task schema plus the `tag` verb).
- **Browser:** `core/Item/Store.js` (`Store.record_url`: when `<folder>/task.jsonl` is missing and `session.jsonl` is there, read that), `ext/JSONL/JSONL.js` (`live()` uses the same), `ai/AITask/AITask.js`, `ai/AISession/StoreFolder.js`, `ai/AISession/AISessionDetail.js`. The Task, TaskPage, TasksPage and AITask readers go through those two.

- **Also patched in the second pass** (a reader of a session log, now `SessionRecord.log_or_old(dir)`, which gives the log by either name, or `task.jsonl` for a brand-new folder): `Server/on-landing.mjs`, `LandingCheck.mjs`, `review.mjs`, `Ai2Overview.mjs`, `Asked.mjs`, `Audit.mjs`, `Compact.mjs`, `clarity.mjs`, `doc-check.mjs`, `owner-check.mjs`, `page-ai-cost.mjs`, `text-check.mjs`, `worktree-sweep.mjs`, `worktree-up.mjs`, `RefineQueue.mjs`, `plugins/CardAnswer.js`; walkers `ArchitectureCensus.mjs`, `ModuleLog.mjs`, `AskTally.mjs`, `SkillCensus.mjs`, `refine-days.mjs`.
- **Checked and left alone, on purpose:** `TaskHomes.mjs`, `TaskMigrate.mjs`, `TaskMove.mjs` (task homes and task folders, which keep `task.jsonl`); `Start.js` and `plugins/Ask.js` (they create a new thread/task, never a moved session record); `Council.mjs` (its own output dir); `session-migrate.mjs` and `session-patterns.mjs` (they read the old `ai/<date>/` layout, not the sessions store), `session-dup.mjs` (a duplicate-line census by file name; follow-up to count `session.jsonl` too), `RepoSize.mjs` (only reports file kinds); every `*.test.mjs`.

## What is not done yet

- `ai/AISession/AISessionIndex.mjs` (the category join) still reads `ai/<id>/task.jsonl` of the old audit folder, a path that no longer holds sessions.
- `ai/AISession/StoreFolder.js` routes any folder holding the record to a task page; a folder with digest tags only (no log yet) opens as an empty task-style page.
- Spelled-out `log_file(dir) ?? path.join(dir, "task.jsonl")` expressions are still in many readers; they work, and swapping them for `SessionRecord.log_or_old(dir)` is a tidy-up with no change in behaviour ([the follow-up](../2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/follow-up.md)).
- **`Servex/LogSweeper.js`** already allows `session.jsonl` under a session folder, so the log sweeper keeps committing moved records.
- **A running Servex needs a restart** to read the new Servex readers (logged as `needs_restart`).
- The per-day `index.json` files mention `task.jsonl` only inside titles, and the `files.jsonl` listings are written by the dev server itself, so no index needed rebuilding by hand.

Back: [Sessions readme](../readme.md) · [AISession readme](../../AISession/readme.md)
