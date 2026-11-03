# One folder per session, and the one function that finds it

A session is kept in exactly **one folder** in the sessions store. A second folder for the same session (a "twin") splits its record, its cost and its tasks across two pages. This page says what the store looks like, which single function answers "where is session X", and how a twin is caught the day it appears. Verified against the code on 2026-11-01 ([the task](/framework/ai/sessions/2026/10/20/session-e00f55c9/session-twins-fix/)).

## The store's one shape

```
public/framework/ai/sessions/
  YYYY/MM/DD/                  the day the session BEGAN (local day)
    <folder>/                  ONE SESSION, directly under its day
      session.jsonl            its record (line 1 says whose it is)
      index.json, cache.jsonl  its numbers (gitignored; rebuilt from the transcript)
      <task>/                  its task folders, nested inside it
```

- **The folder name** is `session-<first 8 hex of the id>` for a new session, the full uuid when another session already holds that name on that day (two ids can share 8 hex), or a slug: a folder renamed on 2026-10-09 (`ux-screens`), a named record (`voice-20261016`), a page-tool folder (`<agent>-<id8>`).
- **Not a second folder:** a spawned agent's record lives in a task folder nested under its parent's session; its own `session-<id8>` folder holds only its transcript numbers. That is one session folder plus one task. Neither is a tab-era task filed straight under a day with a line 1 `{"assign"}` that has no `agent`: that line names the session that *ran* the task, not the folder's own session.

## How a folder says whose it is

`SessionFolders.owner(dir)` reads, in order, and the first answer wins:

| Source | Written by |
|---|---|
| the folder's name, when it is a uuid | `Session.locate` (a clash), old folders |
| `index.json` `id` | `AISessionIndex` (only ever into a session's own folder) |
| `cache.jsonl` `{"summary":{"id"}}` | `AISession.save()` |
| line 1 of `session.jsonl` / `task.jsonl`: `{"session":{"id"}}` | the SessionStart hook, `TaskDirs`, `SessionRecord.link_parent` |
| line 1: `{"assign":{"session_id","agent"}}` (with an agent) | `Agents.open_task` (a Servex record) |
| line 1 of `page.jsonl`: `{"session":"<id>"}` | the page tool |

A `session-<id8>` folder that names no id is taken to be the asker's (very old folders).

## The one finder

```
session id ──▶ SessionFolders.at(<store>).of(id) ──▶ its one folder (or null)
                    │                 .home(id, day) ──▶ of(id), else where a new one goes (not made)
                    ├─ DatedFiles.session_dir   ← TaskDirs --new, Agents.open_task, the SessionStart hook, prompt-relay
                    ├─ Session.locate / scan    ← AISession.save, the page tool, PromptLog, TaskMove
                    ├─ AISessionIndex.dir_of    ← every index.json write
                    ├─ ChildLinks.sessions      ← a child's link on its parent's record
                    ├─ AskIndex.session_dir     ← asks.jsonl
                    ├─ SessionIdentity.folders_of ← TrackingCheck
                    └─ SessionConsolidate       ← the fold and the twin check
```

Code: [`core/Session/SessionFolders.mjs`](/framework/core/Session/SessionFolders.mjs) (node only). **When two folders hold one id**, the home is the oldest day (the day it began), then the folder holding the most (a task subfolder, then a record, then `index.json`, then `cache.jsonl`), then the name. Every writer gets the same answer, so a twin never grows while it waits to be folded.

**Why a cached path can no longer come back.** The finder checks its answer on disk on every call: a folder that moved or was removed is never returned, so no writer `mkdir`s it back (what happened on 2026-10-09, when a running Servex kept writing into renamed folders). Its memory, `sessions/session-folders.json` (gitignored), is only a starting point: every day folder is listed again on each lookup that misses, and a day whose mtime moved is read again in full. An old flat `sessions/<uuid>/` folder (none are left today) is still moved into its day by `Session.locate`, which `AISession.save()` calls before it writes the cache; `AISessionIndex` no longer does that move itself. Speed on the live store (13,547 folders): a hit under 2 ms, a miss about 40 ms, a cold start 4 to 17 s depending on load, then 62 ms from the saved map.

## The twin check, and the fold

- **Check:** `node Server/SessionConsolidate.mjs --check` exits 1 and lists any session held by two folders. Servex runs it once a day (`TaskLoop.twins_daily`, `--write` keeps the list in `sessions/session-twins.json`) and posts one risk note when an id is new since the last run: a new twin means a writer went around the finder. The first run has no list to compare with, so it counts none as new and posts one "twin check started" note with the count. `DatedFiles.sessions.check()` reports `twins` too.
- **Fold:** `node Server/SessionConsolidate.mjs --all` (dry run), then `--all --apply --manifest <file.json>`. Task folders move into the home; `index.json` and `cache.jsonl` keep the fresher copy; other logs are appended without duplicates; every original is copied to `%LOCALAPPDATA%/lew42/servex/moved-aside/<run>/` first; a `redirect` line in `task-moves.jsonl` keeps old URLs working.
- **Today (2026-11-01):** 1,408 sessions are held twice, nearly all left from the 2026-10-09 rename (a uuid folder holding a stale `cache.jsonl` beside the slug). All 1,408 can be folded. Proved on a copy of their folders: 0 twins after, 1,408 session ids before and after, **0 of 16,445 lines lost** (15,019 found again, 1,412 older cache summaries and 13 older index snapshots where a fresher copy stays, 1 repeated line-1 marker): [fold-proof.json](/framework/ai/sessions/2026/10/20/session-e00f55c9/session-twins-fix/fold-proof.json).
- **Run the fold only after** this code is live in Servex and the dev server (`node Servex/sustain.mjs --restart`, then the dev server's restart), so no old process still holds a folder map.
