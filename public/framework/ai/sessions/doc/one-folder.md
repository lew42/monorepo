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

## The one creator (2026-11-06)

Every writer that may be the first to touch a session makes its folder through ONE method, which asks the finder above:

```js
SessionFolders.at(store).create(id, { first })                 // its home (found, else session-<id8> today), made, line 1 if it has no record
SessionFolders.at(store).create(id, { day, name, first })      // a new one named `name` on `day` (still the existing folder if it has one)
SessionFolders.at(store).create(id, { parent, name, first })   // nested in the parent session's record folder, and claimed
await Session.create({ id, name, parent, first })              // the same, from the class (AISession inherits it)
```

Callers: the SessionStart hook (`session-page.mjs`), the prompt and reply hooks (`prompt-relay.mjs`, `reply-relay.mjs`), the page tool's own-page `session_file()`, Servex `spawn_agent` (`Agents.open_task`, with `dir`), and the cloud voice agent's record (`RemoteMCP.voice_session`, with `dir`: its `cloud-voice-<name>` id is not a uuid). Line 1 is written only when the folder has no `session.jsonl` or `task.jsonl`, so whoever comes second finds the first one's folder and writes no second line 1. The census that found the creators: [one-creator/census.md](../2026/11/06/spawned/mastermind-page-design/one-creator/census.md).

- **Found with it:** the reply hook built `ai/<day>/session-<id8>/`, outside this store, through a tmp marker whose `os` was never imported, so every Stop threw and no reply landed on a session page. It now asks the creator.
- **Not on it, on purpose:** voice sessions (`Servex/agents/Sessions.js` `session_path`). Their ids are `v-…`, not session uuids, so the finder can neither find nor twin them, and `session_path` is already their one namer, in the same dated shape. Alternative: pass them as `create(id, {dir})`; worth it only if a second voice creator appears.
- **Task folders** (`TaskDirs --new`) are tasks, not sessions: inside a session's folder they ask `DatedFiles.session_dir` (the finder); without a session they go under the day.

## The twin check, and the fold

- **Check:** `node Server/SessionConsolidate.mjs --check` exits 1 and lists any session held by two folders, and any flat `sessions/<uuid>/` folder (`SessionConsolidate.flat()`; added 2026-11-06, because the twin finder only walks day folders and missed one). Servex runs it once a day (`TaskLoop.twins_daily`, `--write` keeps the list in `sessions/session-twins.json`) and posts a risk note **every day while any twin or flat folder exists**, not only when one is new (changed 2026-11-06: 1,410 old twins had sat silent for a week). `Server/SessionConsolidate.test.mjs` fails on a flat folder in the real store. `DatedFiles.sessions.check()` reports `twins` too.
- **The flat-folder writer (found 2026-11-06):** the page tool treated an existing `sessions/<uuid>/` folder as a plain path, so once one existed (`239b0bd4…`, a minion's page lines on 2026-11-03) every later write went there. Now `resolve_file()` in `Servex/agents/page_tools.js` refuses any flat uuid folder, and a session route never counts as plain. The SessionStart hook and Servex's whoami used to say "Your own page is /framework/ai/sessions/<uuid>/", which agents read as a folder; both now print the dated folder (`Agents.folder_line`).
- **Fold:** `node Server/SessionConsolidate.mjs --all` (dry run), then `--all --apply --manifest <file.json>`. Task folders move into the home; `index.json` and `cache.jsonl` keep the fresher copy; other logs are appended without duplicates; every original is copied to `%LOCALAPPDATA%/lew42/servex/moved-aside/<run>/` first; a `redirect` line in `task-moves.jsonl` keeps old URLs working.
- **The count is on the truth page:** `Server/Truth.mjs` records `twins` and `flat` daily at [/live/truth/](/live/truth/readme.md). `--check` exits 1 while either is above 0 (tested in `SessionConsolidate.test.mjs`).
- **Folded (2026-11-06):** the 1,410 sessions then held twice were folded into one folder each by `SessionConsolidate --all --apply` (commit 6d06f90e1; 68 files relinked, originals copied to moved-aside; 0 held after; [the manifest](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/one-folder/fold-manifest.json)). Before that, on 2026-11-01, 1,408 were held twice, nearly all left from the 2026-10-09 rename (a uuid folder holding a stale `cache.jsonl` beside the slug); the copy test lost 0 of 16,445 lines ([fold-proof.json](/framework/ai/sessions/2026/10/20/session-e00f55c9/session-twins-fix/fold-proof.json)). Since then `--check` says 0, and the page [/live/truth/](/live/truth/) shows that count every day.
- **Run the fold only after** this code is live in Servex and the dev server (`node Servex/sustain.mjs --restart`, then the dev server's restart), so no old process still holds a folder map.
