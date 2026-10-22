# AI — the folder where the AI system's records live and the pages that show them

`ai/` holds (1) the AI system's **records**: the session store, the asks ledger, the cards index, the usage logs, `index.json`; (2) the **classes that draw them**: `AISession/`, `AITask/`, `cards/`, `rail/`, `tasks/`; (3) docs about the AI system (`doc/`). A module that AI merely *uses* does not belong here. Servex (`Servex/`, [/framework/servex/](/framework/servex/)) runs the agents; each task is a folder with a JSONL log; node scripts, not memory, compute every number. The pages: [/framework/ai/](/framework/ai/) (the Inbox), [System tab](/framework/ai/system/).

## On disk: the records, each with its writer and reader

| Path | What | Written by | Read by |
|---|---|---|---|
| `sessions/YYYY/MM/DD/…` | every session and every task folder | see [sessions/](sessions/readme.md) | `AISession/`, `Server/AIIndex.mjs` |
| `index.json`, `index.jsonl` | every task in one bucket; the picture, one line per change (generated, gitignored) | `Server/AIIndex.mjs`, run by `Servex/TaskLoop.js` | `rail/DashState.js` → the Inbox, [tasks/](tasks/readme.md) |
| `sessions/YYYY/MM/DD/index.jsonl` | the day stream: one `{task\|session: {id, path, url, title, state, at}}` line per creation or state change that day (generated, gitignored) | `Server/AIIndexStream.mjs`, called by `Server/AIIndex.mjs` (tasks) and `AISession/AISessionIndex.mjs` (sessions) | `rail/DayIndexLog.js` → `DashState.patch()` |
| `cards.jsonl` | one summary row per Inbox card | `Servex/cards/Cards.js` (whole-file rewrite) | `core/Page/ext/Inbox/Timeline.js`, `rail/inbox.js` |
| `sessions/YYYY/MM/DD/cards/<card>/page.jsonl` | a card's own page: chat, owner notes | `create_card`, `card_set`, `owner_note` (Servex) | the card page (`cards/`) |
| `asks.jsonl` | the owner's routed asks and their owners | `Servex/asks/Asks.js` (ticks), `Servex/ext/refine/CardAsk.js`, `Server/StaleClose.mjs` | `core/Page/ext/Inbox/WaitingOnYou.js`, `Server/AskTally.mjs`, `FollowUp.mjs` |
| `tasks.json` | derived task rows for the asks loop | `Servex/asks/tasks.js` every minute (never hand-edit) | `Servex/asks/Asks.js` |
| `verdicts.jsonl` | Approve / Improve presses on cards | `Server/plugins/CardAnswer.js` | `rail/inbox.js` |
| `usage.json` | the current usage snapshot (gitignored) | `Server/usage-now.mjs`, `AntigravityUsage.mjs`, `openrouter-reconcile.mjs` | masterminds at start; [usage/](usage/readme.md) |
| `usage.jsonl` | append log of usage, one line per sample | `Servex/Usage.js`, `.claude/hooks/ledger.mjs` | `usage/`, `Server/RepoSize.mjs` |
| `log.jsonl` | presence index of AI work in a folder | the `dir_log` tool (`Servex/agents/Sessions.js`) | `ai/log/` |
| `day.jsonl` (per day, in the session store) | the day's blind-append log | `append.mjs` | the day page (`AIDay/`, log fold) |
| `past-work-index.md` | every landed task, searchable | `node Server/PastWork.mjs` | the `past-work` skill |
| `handover.md` | state of the world, one screen | `Server/HandoverNow.mjs` (computed) | a fresh session ([handover.md](handover.md)) |
| `skills.json`, `CLAUDE.copy.md` | skills list, copy of the root CLAUDE.md | `node skills.mjs` | `review/` |
| `weight.jsonl` | page weights | `Server/page-ai-cost.mjs` | `Server/page-refs.mjs` |
| `prompts.jsonl`, `stale-closes.jsonl` | owner prompts; stalled-ask closes | `Server/AskTally.mjs extract`, `Server/StaleClose.mjs` | those scripts and `FollowUp.mjs` |

**Retired or without a live writer found (2026-10-19):** `board.jsonl` (the v/3 board; `cards.jsonl` replaces it), `handoff2.md` (a static 2026-09-24 archive; `handover.md` is the live one), `heartbeat.jsonl` (2026-10-06 entries), `inbox.jsonl`, `servex-queue.json`, `cand.txt`, `v-*.json[l]` and `2026-10-13/`. Nothing here is deleted; they are listed so nobody searches for their writer. Two overlaps: `usage.json` is the snapshot and `usage.jsonl` the log; `sessions/` holds the records and `tasks/` the board that reads them.

## Classes and folders that draw them

[`AIDay/`](AIDay/readme.md) — the day page ([/framework/ai/2026-10-20/](/framework/ai/2026-10-20/)): a day's tasks as a check-mark list (✅ landed, ⬜ open), nested session → task → child, read from the `tasks` query source over the store, live.

[`now/`](now/readme.md) — the live in-flight page ([/framework/ai/now/](/framework/ai/now/)): every session active in the last hour, from the `inflight` query source.

`AISession/` (`class AISession extends Session`, [sessions](sessions/readme.md)) · `AITask/` (`class AITask extends Page`, [AITask](AITask/readme.md)) · `cards/` (`Card` and what a card shows) · `rail/` (`class AIRail extends Inbox.Rail`, `DashState`, `CardList`; the [Inbox](/framework/core/Page/ext/Inbox/)) · `tasks/` ([Tasks](tasks/readme.md)) · `classes/` (live class cards) · `systems/`, `system/` (`AISystem.js`, the System tab) · `usage/` · `audits/` · `health/` · `local/` · `quick-fix/` · `review/` · `talk/` · `tests/` · `dashboard/` · `asks/`, `council/`, `models/`, `errors/`, `collab/`, `process/`.

## Sessions and tasks: who makes which, and when (verified against the code, 2026-10-20)

A **session** is one run of Claude (a VS Code tab, a Servex agent, a cloud voice call). A **task** is a thing to finish, and it lives *inside* a session. A spawned minion is a session, never a task (the owner, 2026-10-19: [doc/sessions-and-tasks.md](doc/sessions-and-tasks.md)). Every record is one append-only JSONL log whose state is computed by replay, never stored.

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
| Servex, on every `spawn_agent` | a **session** (the agent's own folder) | `<caller's session folder>/<agent id>/`, else `<day>/spawned/<agent id>/` | `open_task` line 1, by node, before the first turn |
| A VS Code tab (you, the `new-task` skill) | a **task** of your session | `<day>/session-<id8>/<slug>/task.jsonl` | `node Server/TaskDirs.mjs --new <slug>` + `append.mjs` |
| Any agent, the item tool | a **task** in a module home | `<module>/tasks/<slug>/task.jsonl` | `tasks.add`; the caller's log gets `{"task": path}` |
| A cloud voice call | a **session** | `<day>/cloud-voice-<name>/session.jsonl` | `RemoteMCP.voice_session()` |
| A tab's transcript | a session **cache** (totals, no log) | `<day>/session-<id8>/cache.jsonl`, `index.json` | `AISessionIndex.mjs` tails `~/.claude/projects` |
| Scripts | idle **tasks** from undone asks; one-off moves | `<module>/tasks/` | `Server/UndoneToTasks.mjs`, `Server/TaskMigrate.mjs` |

**Status.** ✅ Top-level session folders hold `session.jsonl` (10-17). ✅ Readers ask `SessionRecord.log_file` for either name (10-19). ✅ A spawned agent's folder starts as `session.jsonl` at any depth (2026-10-20): `SessionRecord.start_file` calls a folder a session when line 1 is a spawn line, `assign.session_id` **and** `assign.agent`, which only Servex's `open_task` writes; a tab's task keeps `task.jsonl` ([the task](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md)). Folders spawned before that day still hold `task.jsonl`; every reader accepts both names. ⬜ Old nested folders renamed by script, a task as one line in its session's log, `TaskDirs` → `SessionDirs`: slices 4 to 6 of the plan. Known gap: a session gets two folders today (its own record under its caller, and the transcript cache `session-<id8>/`); the link between them is `assign.session_id` on line 1.

## Every system, one line each

- **Principle:** effective parallel work between sessions. A parent answers or hands off, helpers are reused, tasks are created, tracked, logged and finished. A spawned agent is a **session**, a task is something to finish inside it: [doc/sessions-and-tasks.md](doc/sessions-and-tasks.md).
- **Context loss** (a session survives only in files; what to write where; computed state instead of a handover): [doc/context-loss.md](doc/context-loss.md) · how agents talk and what each message leaves on disk: [Servex/agents/doc/messaging.md](/Servex/agents/doc/messaging.md) · **readme rule, checked by code:** `node Server/ReadmeOrphans.mjs` lists every system the readme above it never names; add the missing one-liner whenever it prints one.
- **Tasks:** [tasks/readme.md](tasks/readme.md) · [doc/tasks.md](doc/tasks.md) (what a task is, two homes, who makes one) · [core/Task](/framework/core/Task/)
- **Sessions:** [sessions/readme.md](sessions/readme.md) · cloud voice calls: [/Servex/ext/remote/doc/cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md)
- **Page system:** [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/) · parts: [core/Page/parts](../core/Page/parts/readme.md)
- **Inbox:** [core/Page/ext/Inbox](/framework/core/Page/ext/Inbox/) · timeline: [timeline](/framework/core/Page/ext/Inbox/timeline/) · note on a page: [PageInbox.js](../core/Page/PageInbox.js)
- **Servex:** [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [architecture](/framework/servex/doc/architecture.md) · **MCP tools:** [doc/agents/mcp.md](doc/agents/mcp.md) · module inbox: [Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md) · steps: [Servex/doc/steps.md](../../../Servex/doc/steps.md)
- **Dev server:** [/framework/dev/](/framework/dev/) · **Models:** [system/models](system/models/) · **Skills:** [.claude/skills](../../../.claude/skills/)
- **Accounting:** [doc/tokens/tokens.md](doc/tokens/tokens.md) · [budgets](/framework/servex/doc/budget.md) · usage pace [usage/](usage/readme.md) · `node Server/usage-now.mjs` · cloud cost: [doc/cloudflare.md](doc/cloudflare.md)
- **Transcription:** [ux/Dictate](/framework/ux/Dictate/) · raw Whisper answers, live (guess → amend → final): [audio/Whisper](/framework/audio/Whisper/) · **Prompt refinement:** [ext/Refine](/framework/ext/Refine/)
- **Prompt audit** (Haiku sorts each owner prompt, Sonnet judges each item against what the session did; results in `prompt-audit.jsonl` / `prompt-review.jsonl` beside the session, never filed as tasks): [doc/prompt-audit.md](doc/prompt-audit.md) · `node Server/PromptAudit.mjs --days 7` · every older audit system and whether it still runs: [doc/audits.md](doc/audits.md)
- **Asks and follow-up:** [asks/](asks/) · [doc/asks-outcomes.md](doc/asks-outcomes.md) · [doc/follow-up.md](doc/follow-up.md) · [undone asks](/framework/ai/asks/undone/) · `node Server/PastWork.mjs <topic>`
- **The AI dashboard** (the default page at `/framework/ai/` since 2026-10-19, merge 6feb47b6f: sessions by origin, nested by parent, cost rolled up, mobile first; old Inbox at `/framework/ai/inbox/`): structure [AIDashboard/readme.md](AIDashboard/readme.md) · plan and data audit [doc/ai-dashboard-plan.md](doc/ai-dashboard-plan.md) · shots [400](doc/ai-dashboard-plan/shots5/localhost-51718-framework-ai/400.png), [1200](doc/ai-dashboard-plan/shots5/localhost-51718-framework-ai/1200.png)
- **Dashboard:** [doc/one-dashboard.md](doc/one-dashboard.md) · [doc/one-state.md](doc/one-state.md) · plan: [doc/ai-dashboard-plan.md](doc/ai-dashboard-plan.md) · known problem, asked 7 times: [doc/dashboard-layout-asks.md](doc/dashboard-layout-asks.md)
- **Where things go:** [doc/organization.md](doc/organization.md) · [doc/task-folders.md](doc/task-folders.md) · [systems-map.md](systems-map.md) · [doc/repo-size.md](doc/repo-size.md)

## More

[doc/readme.md](doc/readme.md) (the index of every AI-system doc) · [doc/architecture.md](doc/architecture.md) · [todo.md](todo.md) · [handover.md](handover.md) · [doc/watch-out-2026-10-12.md](doc/watch-out-2026-10-12.md) · [doc/design/systems-overview.md](doc/design/systems-overview.md) · the readme as it stood before this rewrite (every older link and the page tabs): [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
