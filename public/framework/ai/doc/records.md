# AI records — what is on disk, who writes it, who reads it; who makes sessions and tasks

Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md)). Links are re-based to this folder.

## On disk: the records, each with its writer and reader

| Path | What | Written by | Read by |
|---|---|---|---|
| `sessions/YYYY/MM/DD/…` | every session and every task folder | see [sessions/](../sessions/readme.md) | `AISession/`, `Server/AIIndex.mjs` |
| `index.json`, `index.jsonl` | every task in one bucket; the picture, one line per change (generated, gitignored) | `Server/AIIndex.mjs`, run by `Servex/TaskLoop.js` | `rail/DashState.js` → the Inbox, [tasks/](../tasks/readme.md) |
| `sessions/YYYY/MM/DD/index.jsonl` | the day stream: one `{task\|session: {id, path, url, title, state, at}}` line per creation or state change that day (generated, gitignored) | `Server/AIIndexStream.mjs`, called by `Server/AIIndex.mjs` (tasks) and `AISession/AISessionIndex.mjs` (sessions) | `rail/DayIndexLog.js` → `DashState.patch()` |
| `cards.jsonl` | one summary row per Inbox card | `Servex/cards/Cards.js` (whole-file rewrite) | `core/Page/ext/Inbox/Timeline.js`, `rail/inbox.js` |
| `sessions/YYYY/MM/DD/cards/<card>/page.jsonl` | a card's own page: chat, owner notes | `create_card`, `card_set`, `owner_note` (Servex) | the card page (`cards/`) |
| `asks.jsonl` | the owner's routed asks and their owners | `Servex/asks/Asks.js` (ticks), `Servex/ext/refine/CardAsk.js`, `Server/StaleClose.mjs` | `core/Page/ext/Inbox/WaitingOnYou.js`, `Server/AskTally.mjs`, `FollowUp.mjs` |
| `tasks.json` | derived task rows for the asks loop | `Servex/asks/tasks.js` every minute (never hand-edit) | `Servex/asks/Asks.js` |
| `verdicts.jsonl` | Approve / Improve presses on cards | `Server/plugins/CardAnswer.js` | `rail/inbox.js` |
| `usage.json` | the current usage snapshot (gitignored) | `Server/usage-now.mjs`, `AntigravityUsage.mjs`, `openrouter-reconcile.mjs` | masterminds at start; [usage/](../usage/readme.md) |
| `usage.jsonl` | append log of usage, one line per sample | `Servex/Usage.js`, `.claude/hooks/ledger.mjs` | `usage/`, `Server/RepoSize.mjs` |
| `log.jsonl` | presence index of AI work in a folder | the `dir_log` tool (`Servex/agents/Sessions.js`) | `ai/log/` |
| `day.jsonl` (per day, in the session store) | the day's blind-append log | `append.mjs` | the day page (`AIDay/`, log fold) |
| `past-work-index.md` | every landed task, searchable | `node Server/PastWork.mjs` | the `past-work` skill |
| `handover.md` | state of the world, one screen | `Server/HandoverNow.mjs` (computed) | a fresh session ([handover.md](../handover.md)) |
| `skills.json`, `CLAUDE.copy.md` | skills list, copy of the root CLAUDE.md | `node skills.mjs` | `review/` |
| `weight.jsonl` | page weights | `Server/page-ai-cost.mjs` | `Server/page-refs.mjs` |
| `prompts.jsonl`, `stale-closes.jsonl` | owner prompts; stalled-ask closes | `Server/AskTally.mjs extract`, `Server/StaleClose.mjs` | those scripts and `FollowUp.mjs` |

**Retired or without a live writer found (2026-10-19):** `board.jsonl` (the v/3 board; `cards.jsonl` replaces it), `handoff2.md` (a static 2026-09-24 archive; `handover.md` is the live one), `heartbeat.jsonl` (2026-10-06 entries), `inbox.jsonl`, `servex-queue.json`, `cand.txt`, `v-*.json[l]` and `2026-10-13/`. Nothing here is deleted; they are listed so nobody searches for their writer. Two overlaps: `usage.json` is the snapshot and `usage.jsonl` the log; `sessions/` holds the records and `tasks/` the board that reads them.


## Sessions and tasks: who makes which, and when (verified against the code, 2026-10-20)

A **session** is one run of Claude (a VS Code tab, a Servex agent, a cloud voice call). A **task** is a thing to finish, and it lives *inside* a session. A spawned minion is a session, never a task (the owner, 2026-10-19: [doc/sessions-and-tasks.md](sessions-and-tasks.md)). Every record is one append-only JSONL log whose state is computed by replay, never stored.

```
Item                              core/Item        one log; state = Item.replay(lines)
├─ Session extends Item           core/Session     a dated folder ai/sessions/YYYY/MM/DD/<name>/; has tasks: List
│  └─ AISession extends Session   ai/AISession     one Claude run: cost and totals, apply_line() per transcript line
└─ Task extends Item              core/Task        idle → running → paused | waiting → stopped | complete; has tasks: List
   └─ Project extends Task        core/Task        stages + completed 0..1 (a play class, wired nowhere)

Agents.spawn(spec)                Servex/agents/Agents.js   makes a SESSION: default_task() picks the folder,
  → open_task(task, {session_id, agent, model})             open_task() writes line 1 {assign:{session_id, agent, …}}
                                                            before the agent's first turn; past-work.md beside it
TaskDirs.dir({slug, session_id, parent})   Server/TaskDirs.mjs   the one path builder; `--new <slug>` makes a TASK folder
item({path, delta:{tasks:{add:{title}}}})  Servex/agents/page_tools.js   a TASK in <module>/tasks/<slug>/ + a pointer line
State.mjs → ai/index.json                  Server/AIIndex.mjs   the one reader of both; the Inbox draws it
```

| Who | Makes | Where | How |
|---|---|---|---|
| Servex, on every `spawn_agent` | a **session** (the agent's own folder) | `<caller's session folder>/<agent id>/`, else `<day>/spawned/<agent id>/` | `open_task` line 1, by node, before the first turn; the parent's log gets a `{"task":"<url>"}` reference (`SessionRecord.link_parent`) |
| A VS Code tab (you, the `new-task` skill) | a **task** of your session | `<day>/session-<id8>/<slug>/task.jsonl` | `node Server/TaskDirs.mjs --new <slug>` + `append.mjs`; `--new` also adds a `{"task":"<url>"}` reference to the session's (or parent task's) log, so the folder counts as one of its tasks |
| Any agent, the item tool | a **task** in a module home | `<module>/tasks/<slug>/task.jsonl` | `tasks.add`; the caller's log gets `{"task": path}` |
| A cloud voice call | a **session** | `<day>/cloud-voice-<name>/session.jsonl` | `RemoteMCP.voice_session()` |
| A tab's transcript | a session **cache** (totals, no log) | `<day>/session-<id8>/cache.jsonl`, `index.json` | `AISessionIndex.mjs` tails `~/.claude/projects` |
| Scripts | idle **tasks** from undone asks; one-off moves | `<module>/tasks/` | `Server/UndoneToTasks.mjs`, `Server/TaskMigrate.mjs` |

**Status.** ✅ Top-level session folders hold `session.jsonl` (10-17). ✅ Readers ask `SessionRecord.log_file` for either name (10-19). ✅ A spawned agent's folder starts as `session.jsonl` at any depth (2026-10-20): `SessionRecord.start_file` calls a folder a session when line 1 is a spawn line, `assign.session_id` **and** `assign.agent`, which only Servex's `open_task` writes; a tab's task keeps `task.jsonl` ([the task](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md)). Folders spawned before that day still hold `task.jsonl`; every reader accepts both names. ⬜ Old nested folders renamed by script, a task as one line in its session's log, `TaskDirs` → `SessionDirs`: slices 4 to 6 of the plan. ✅ A folder made under a session is referenced on its parent's log by whichever tool made it, and older folders are backfilled by `node Server/SessionRecord.mjs --links --apply` ([session-record.md](../sessions/doc/session-record.md)). Known gap: a session gets two folders today (its own record under its caller, and the transcript cache `session-<id8>/`); the link between them is `assign.session_id` on line 1.
