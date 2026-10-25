# Sessions — one folder per Claude session, and the grid that lists them

A **session** is one run of Claude on this machine: a VS Code tab, a CLI run, a Servex agent, or a cloud voice call. This module is two things: the **folders** that hold each session's data, and the **page** (`/framework/ai/sessions/`) that lists them newest first and opens one. It is *not* the voice-session of [ext/Session](/framework/ext/Session/) (one ✦ press), and it never touches that class's `/api/sessions` route.

## On disk

Everything lives under `public/framework/ai/sessions/YYYY/MM/DD/`:

```
sessions/
  YYYY/index.json, YYYY/MM/index.json      rolled-up totals, rebuilt from the day files (AISessionIndex.roll)
  YYYY/MM/DD/index.json                    {day, closed, snapshots:[…]} — one snapshot per session that day; closed:true once the day is frozen
  YYYY/MM/DD/<folder>/                     ONE SESSION (three kinds below)
  <top level>                              generated indexes and move ledgers (last section)
```

**One `index.jsonl` per scope** (derived, gitignored, append-only; a line is never rewritten). The writer is `AIIndexStream.append` (`Server/AIIndexStream.mjs`), called by `DatedFiles.create` and `DatedFiles.move` (`Server/DatedFiles.mjs`), `AIIndex` and `AISessionIndex`; the backfill is `node Server/SessionScopes.mjs` (dry run, `--apply` writes). Nothing in the browser reads the month, year or root lists yet; the rolled `index.json` totals stay as they are.

| File | Lists | Line |
|---|---|---|
| `sessions/index.jsonl` | the years | `{"year":"2026"}` |
| `YYYY/index.jsonl` | the months | `{"month":"2026/10"}` |
| `YYYY/MM/index.jsonl` | the days | `{"day":"2026/10/24"}` |
| `YYYY/MM/DD/index.jsonl` | the sessions, tasks and projects started that day | `{"session":{id,path,url,title,state,at}}` |

When a day's `index.jsonl` gets its first row, the writer adds the day to its month's list; a month's first day adds the month to the year's list; a year's first month adds the year to the root list.

A session folder is one of three kinds:

| Kind | Folder name | Files | Written by |
|---|---|---|---|
| **Transcript session** (VS Code, CLI, Servex agent) | `session-<first 8 hex of the id>` (or the full uuid) | `cache.jsonl` (line 1 `{summary:{v:2,id,cursor,first_at,last_at,usd,tokens,…}}`: running totals plus how far the transcript was read), `index.json` (the one current snapshot), `session.jsonl` (a VS Code tab: line 1 `{session:{id,kind:"vscode-tab",cwd,at}}`, written once by the SessionStart hook `.claude/hooks/session-page.mjs`), optional `page.jsonl` | `AISessionIndex.mjs`, which follows the transcript; `session.jsonl` by the SessionStart hook |
| **Record session** (a named agent, a voice call) | a name: `voice-20261016`, `cloud-voice-<name>` | `session.jsonl`, plus the task folders below | `append.mjs`, `Agents.open_task`, `RemoteMCP.voice_session` |
| **Task folder** | any name, *inside* a session folder (`<session>/<task>/`) | `task.jsonl` (+ `requirements.md`, `past-work.md`, `report.md`) | see [ai/tasks](/framework/ai/tasks/) |

**The words themselves are not here.** The raw transcript stays where Claude writes it, `~/.claude/projects/<dir>/<session id>.jsonl` (a subagent's is `<id>/subagents/agent-*.jsonl`); a session folder stores only totals and a pointer. Details: [doc/data-sources.md](doc/data-sources.md).

**`session.jsonl`** is the folder's one record file (`task.jsonl` in folders not yet moved; both names are read by `SessionRecord.file(dir)`). Line 1 of a Servex agent's is `{"assign":{"session_id","agent","title","model","requested_at","now"}}`; a cloud voice call's is `{"session":{"id","kind":"cloud-voice-agent","caller","at"}}`. Later lines are one event each, told apart by their single top-level verb: the task log (`assign`, `log`, `chat`, `agent`, `commit`, `decision`, `finish`…) and the digest/tag lines (`tag`, `summary`, `note`, `alert`, `weight`, `closed`, `question`, `links`; list in `SessionRecord.TAG_VERBS`). Rule, move script and undo: [doc/session-record.md](doc/session-record.md).

## How data gets in

| What | Writer (called from) |
|---|---|
| `cache.jsonl`, `index.json`, day/month/year `index.json` | `ai/AISession/AISessionIndex.mjs`: a file watch on the transcripts re-reads only the new bytes. Started inside the dev server by `AISession/AISessionTailer.mjs` (main checkout only). |
| a **record-only** session (no transcript here: a cloud voice call) | the same writer: `AISessionIndex.record_snap()` builds its snapshot (id = folder name, `kind` from `session.jsonl` line 1, times and `cost` lines from the record) at start-up and when `session.jsonl` grows. Shown as the `cloud voice` kind. Needs a dev-server restart to start. |
| a Servex agent's folder and line 1 (`session.jsonl`, at any depth) | `open_task()` in `Servex/agents/Agents.js` (the folder from `TaskDirs`, an alias of `DatedFiles.sessions`: [Server/doc/dated-files.md](/Server/doc/dated-files.md)), called from `Agents.spawn()` *before* the agent's first turn (the `spawn_agent` tool) |
| any later line | `node .claude/hooks/append.mjs <file> <lines.json>`: validates against `.claude/hooks/jsonl-schema.mjs`, turns `"NOW"` into the clock, and picks `session.jsonl` vs `task.jsonl` through `SessionRecord.start_file()` |
| a cloud voice call's folder and lines | `Servex/ext/remote/RemoteMCP.js` `voice_session()` (its path from `DatedFiles.sessions.path`) / `record()` / `after()` ([voice system](/Servex/ext/remote/doc/cloud-voice-agent.md)) |
| the day-index row of any folder, however it was made | `DatedFiles.sessions.watch()` / `sync(dir)` (`Server/DatedFiles.mjs`): a folder appears or its record grows, one `session` row on its start day; the SessionStart hook's folder comes from `DatedFiles.sessions.session_dir` |
| tags, notes, alerts, closed | `AISession.log()`; digests by `AISessionDigest.mjs` |
| `prompt-audit.jsonl`, `prompt-review.jsonl` (each owner prompt sorted into items; the reviewer's verdict on each) | `Server/PromptAudit.mjs`, run by hand ([ai/doc/prompt-audit.md](../doc/prompt-audit.md)) |

## How data is read

- **The page**: `page.js` builds `AISessionsPage` (`ai/AISession/`), a table or rail of cards over [ext/DataGrid](/framework/ext/DataGrid/). Rows are `AISessionView`, order and nesting `AISessionsPage.arrange()`, built from `session-tree.json` plus the live `index.json` snapshots pushed over the page's socket.
- **A year, month or day folder** (`/framework/ai/sessions/2026/10/`): `StoreFolder.sessions` (`ai/AISession/StoreFolder.js`). A year lists its months and a month its days, each with its session count and cost from the rolled-up `index.json`; a day lists its sessions. A folder with no rolled-up `index.json` says so in words (it is asked for only when the folder listing shows one).
- **One session**: its dated folder, `/framework/ai/sessions/YYYY/MM/DD/<folder>/` → `AISessionDetail` (drawn there by `StoreFolder.child()`; `/framework/ai/sessions/<id>/` only redirects to it, and stays the page for a session with no folder yet; links use `AISession.page_url()`; [core/Session/doc/identity.md](/framework/core/Session/doc/identity.md), "One session, one folder, one URL"): a sticky stats bar, then the tabs Overview (every task and child session of the session in one list, newest first, with own and total counts: `SessionFeed`) · Board (the four cards: open, project, done, dropped) · Tasks · Chat (the Work view is the Tasks tab; `?tab=work` and `?tab=conversation` still map), then Coverage, Cost and the rest. The stats bar reads `SessionWork`'s task tree; files `SessionOverview`, `SessionStats`, `SessionTaskRow` are in [AISession](/framework/ai/AISession/readme.md). Coverage tab: [ext/Refine/doc/refine-queue.md](/framework/ext/Refine/doc/refine-queue.md).
- **The class**: `class AISession extends Session` (`AISession.js`): totals, `apply_line()` per transcript line, `AISession.of(id)`, `AISession.log()`, `AISession.record(id)`. Classes of the detail page: [doc/ui/classes.md](doc/ui/classes.md).
- **Variants**: `/framework/ai/sessions/v/<name>/` is another look at the same data, for example [v/mobile/](/framework/ai/sessions/v/mobile/) (the phone pages: day list, nested sessions, a session, a task). `AISessionsPage.route()` passes the name `v` through to that folder instead of reading it as a session id.
- **Routine sessions are hidden** behind one chip per kind (prompt cleaning, short headless runs, reviews): [doc/buckets.md](doc/buckets.md).
- **Tasks**: `Server/State.mjs` folds every task log into `ai/state.json`.
- **For an agent**: `item({path: <session url>})` answers a session's own cost, its child sessions nested with their costs, task counts and the biggest tasks, all computed on read: [core/Session/readme.md](/framework/core/Session/readme.md), "What item() answers for a session".

## Top-level files here (generated; never hand-edit)

`session-index.json`, `session-tree.json`, `sessions.json` (`Server/session-summary.mjs`) · `session-buckets.json` (`Server/session-buckets.mjs`) · `session-flags.json` (`Server/session-flags.mjs`) · `spend-tree.json` (`Server/spend-tree.mjs`) · `*-moves.jsonl`, `task-manifest.json` (move ledgers, so a move can be undone) · `settings.jsonl` (the page's saved view) · `page.js`, `system.js` (the page and its `ReadmeSystem`).

## More

**Views plan (2026-10-20, proposals, waiting on your pick):** [doc/views-plan.md](doc/views-plan.md): the day view, the URL shape, columns, and the session page with its tasks; prototype at [doc/variants/](/framework/ai/sessions/doc/variants/).

[doc/session-readme.md](doc/session-readme.md) (a generated `readme.md` per folder, `node Server/SessionReadme.mjs <folder>`; what `requirements.md` is) · [doc/ui/compact-layout.md](doc/ui/compact-layout.md) · [doc/data/data-architecture.md](doc/data/data-architecture.md) · [doc/cost/](doc/cost/spend-tree.md) · [doc/live/realtime.md](doc/live/realtime.md) · [doc/picture-archive.md](doc/picture-archive.md) · [doc/next.md](doc/next.md) · the readme as it stood before this rewrite, with its dated decisions: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).

**Next: design first.** Session and task views are designed in Figma before they are built: [doc/design-first.md](doc/design-first.md) (2026-10-20); the mobile cards page and its picks: [doc/mobile-cards.md](doc/mobile-cards.md) (2026-10-22).
