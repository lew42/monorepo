# One creator for session folders: the census

Budget: $3. Read-only: change no file except this task's `task.jsonl` and `census.md` beside this brief.

Load the `minion` skill first. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`.

## Why

A session must have exactly one folder, `public/framework/ai/sessions/YYYY/MM/DD/<folder>/` ([sessions/doc/one-folder.md](../../../../../sessions/doc/one-folder.md)). Many writers each make that folder their own way. One names it `<agent>-<uuid8>`, another names it `session-<uuid8>`, and that mismatch made 1,410 sessions with two folders. Next we will make one creator (for example `Session.create({id, name, parent, day})`) that asks `SessionFolders.at(store).home(id, day, name)` ([core/Session/SessionFolders.mjs](../../../../../../core/Session/SessionFolders.mjs):170), makes the folder, and is the only code that makes one. First we need the exact list of who makes one today.

## The job

Find every place in code that can CREATE a session's folder: a `mkdirSync` (or a write with `recursive`) whose target is a folder directly under a day of `public/framework/ai/sessions/`, or a nested record folder for a spawned agent. Search `Servex/`, `Server/`, `.claude/hooks/`, `public/framework/core/Session/`, `public/framework/ai/` (js and mjs, skip `*.test.mjs` and `Server/Undone*`). Use `git grep`, never `find /`.

Check at least these, named by another agent. Confirm or deny each:
1. Servex `spawn_agent` making its task dir (`Servex/agents/Agents.js`, `open_task`).
2. `Servex/agents/page_tools.js` `session_file()` (about lines 162–186): an agent writing to its own page with no `path` makes `<agent>-<uuid8>` and writes `{session: uuid}`.
3. `Servex/agents/Sessions.js` (several mkdirs, the voice sessions).
4. `.claude/hooks/session-page.mjs` and `.claude/hooks/prompt-relay.mjs` (`session-<uuid8>`).
5. `Server/ArchiveSessions.mjs`, `Server/DatedFiles.mjs` (`session_dir`), `move-voice-sessions` (find it).
6. `.claude/hooks/reply-relay.mjs:91` builds `<slug>-<uuid8>` paths under `ai/<date>/`.

## Deliverable

`census.md` beside this brief, one screen: a table with one row per creator.

| file:line | what calls it | folder name it makes | asks SessionFolders? (`of`/`home`/`record_of`, or builds the path itself) | writes a first line? (which) |

Below the table: how many rows ask SessionFolders and how many build the path themselves. Those two numbers must add up to the row count. Also list any creator you suspected and ruled out, with one line on why. Prove each "builds it itself" with the line of code (`path:line`). Log one `log` line in `task.jsonl` when done.

## The build (the ask, relayed by voice-app, 2026-11-06)

"Collapse them into ONE object-oriented creator, e.g. `Session.create({uuid, name, parent})`, which asks SessionFolders, and make every other writer call it." Built on branch `worktree/qf-1` (7097d66e1):

- `SessionFolders#create(id, {day, name, dir, parent, first, file})` (core/Session/SessionFolders.mjs) and `Session.create({id, ...})` (core/Session/Session.js).
- Moved onto it: `.claude/hooks/session-page.mjs`, `prompt-relay.mjs`, `reply-relay.mjs` (also fixed: it wrote outside the store and threw on a missing `os` import), `Servex/agents/page_tools.js` `session_file()`, `Servex/agents/Agents.js` `open_task()`.
- Left on purpose: voice sessions (`Sessions.session_path`, non-uuid ids), task folders (`TaskDirs`). Reasons in sessions/doc/one-folder.md, "The one creator".
- Tests: SessionFolders.test.mjs (33 checks, 8 new), page_tools.test.mjs (44), item_tool.test.mjs (143). Spawn tests need the SDK package, which a worktree does not have.
