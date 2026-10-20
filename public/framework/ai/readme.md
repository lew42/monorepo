# AI — the folder where the AI system's records live and the pages that show them

`ai/` holds (1) the AI system's **records**: the session store, the asks ledger, the cards index, the usage logs, `state.json`; (2) the **classes that draw them**: `AISession/`, `AITask/`, `cards/`, `rail/`, `tasks/`; (3) docs about the AI system (`doc/`). A module that AI merely *uses* does not belong here. Servex (`Servex/`, [/framework/servex/](/framework/servex/)) runs the agents; each task is a folder with a JSONL log; node scripts, not memory, compute every number. The pages: [/framework/ai/](/framework/ai/) (the Inbox), [System tab](/framework/ai/system/).

## On disk: the records, each with its writer and reader

| Path | What | Written by | Read by |
|---|---|---|---|
| `sessions/YYYY/MM/DD/…` | every session and every task folder | see [sessions/](sessions/readme.md) | `AISession/`, `Server/State.mjs` |
| `state.json`, `tasks/state.jsonl` | every task in one bucket (generated, gitignored) | `Server/State.mjs`, run by `Servex/TaskLoop.js` | `rail/DashState.js` → the Inbox, [tasks/](tasks/readme.md) |
| `cards.jsonl` | one summary row per Inbox card | `Servex/cards/Cards.js` (whole-file rewrite) | `core/Page/ext/Inbox/Timeline.js`, `rail/inbox.js` |
| `sessions/YYYY/MM/DD/cards/<card>/page.jsonl` | a card's own page: chat, owner notes | `create_card`, `card_set`, `owner_note` (Servex) | the card page (`cards/`) |
| `asks.jsonl` | the owner's routed asks and their owners | `Servex/asks/Asks.js` (ticks), `Servex/ext/refine/CardAsk.js`, `Server/StaleClose.mjs` | `core/Page/ext/Inbox/WaitingOnYou.js`, `Server/AskTally.mjs`, `FollowUp.mjs` |
| `tasks.json` | derived task rows for the asks loop | `Servex/asks/tasks.js` every minute (never hand-edit) | `Servex/asks/Asks.js` |
| `verdicts.jsonl` | Approve / Improve presses on cards | `Server/plugins/CardAnswer.js` | `rail/inbox.js` |
| `usage.json` | the current usage snapshot (gitignored) | `Server/usage-now.mjs`, `AntigravityUsage.mjs`, `openrouter-reconcile.mjs` | masterminds at start; [usage/](usage/readme.md) |
| `usage.jsonl` | append log of usage, one line per sample | `Servex/Usage.js`, `.claude/hooks/ledger.mjs` | `usage/`, `Server/RepoSize.mjs` |
| `log.jsonl` | presence index of AI work in a folder | the `dir_log` tool (`Servex/agents/Sessions.js`) | `ai/log/` |
| `day.jsonl` (per day, in the session store) | the day's blind-append log | `append.mjs` | day pages (`AITask/dashboard.js`) |
| `past-work-index.md` | every landed task, searchable | `node Server/PastWork.mjs` | the `past-work` skill |
| `handover.md` | state of the world, one screen | `Server/HandoverNow.mjs` (computed) | a fresh session ([handover.md](handover.md)) |
| `skills.json`, `CLAUDE.copy.md` | skills list, copy of the root CLAUDE.md | `node skills.mjs` | `review/` |
| `weight.jsonl` | page weights | `Server/page-ai-cost.mjs` | `Server/page-refs.mjs` |
| `prompts.jsonl`, `stale-closes.jsonl` | owner prompts; stalled-ask closes | `Server/AskTally.mjs extract`, `Server/StaleClose.mjs` | those scripts and `FollowUp.mjs` |

**Retired or without a live writer found (2026-10-19):** `board.jsonl` (the v/3 board; `cards.jsonl` replaces it), `handoff2.md` (a static 2026-09-24 archive; `handover.md` is the live one), `heartbeat.jsonl` (2026-10-06 entries), `inbox.jsonl`, `servex-queue.json`, `cand.txt`, `v-*.json[l]` and `2026-10-13/`. Nothing here is deleted; they are listed so nobody searches for their writer. Two overlaps: `usage.json` is the snapshot and `usage.jsonl` the log; `sessions/` holds the records and `tasks/` the board that reads them.

## Classes and folders that draw them

`AISession/` (`class AISession extends Session`, [sessions](sessions/readme.md)) · `AITask/` (`class AITask extends Page`, [AITask](AITask/readme.md)) · `cards/` (`Card` and what a card shows) · `rail/` (`class AIRail extends Inbox.Rail`, `DashState`, `CardList`; the [Inbox](/framework/core/Page/ext/Inbox/)) · `tasks/` ([Tasks](tasks/readme.md)) · `classes/` (live class cards) · `systems/`, `system/` (`AISystem.js`, the System tab) · `usage/` · `audits/` · `health/` · `local/` · `quick-fix/` · `review/` · `talk/` · `tests/` · `dashboard/` · `asks/`, `council/`, `models/`, `errors/`, `collab/`, `process/`.

## Every system, one line each

- **Tasks:** [tasks/readme.md](tasks/readme.md) · [doc/tasks.md](doc/tasks.md) (what a task is, two homes, who makes one) · [core/Task](/framework/core/Task/)
- **Sessions:** [sessions/readme.md](sessions/readme.md) · cloud voice calls: [/Servex/ext/remote/doc/cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md)
- **Page system:** [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/) · parts: [core/Page/parts](../core/Page/parts/readme.md)
- **Inbox:** [core/Page/ext/Inbox](/framework/core/Page/ext/Inbox/) · timeline: [timeline](/framework/core/Page/ext/Inbox/timeline/) · note on a page: [PageInbox.js](../core/Page/PageInbox.js)
- **Servex:** [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [architecture](/framework/servex/doc/architecture.md) · **MCP tools:** [doc/agents/mcp.md](doc/agents/mcp.md) · module inbox: [Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md) · steps: [Servex/doc/steps.md](../../../Servex/doc/steps.md)
- **Dev server:** [/framework/dev/](/framework/dev/) · **Models:** [system/models](system/models/) · **Skills:** [.claude/skills](../../../.claude/skills/)
- **Accounting:** [doc/tokens/tokens.md](doc/tokens/tokens.md) · [budgets](/framework/servex/doc/budget.md) · usage pace [usage/](usage/readme.md) · `node Server/usage-now.mjs` · cloud cost: [doc/cloudflare.md](doc/cloudflare.md)
- **Transcription:** [ux/Dictate](/framework/ux/Dictate/) · **Prompt refinement:** [ext/Refine](/framework/ext/Refine/)
- **Asks and follow-up:** [asks/](asks/) · [doc/asks-outcomes.md](doc/asks-outcomes.md) · [doc/follow-up.md](doc/follow-up.md) · [undone asks](/framework/ai/asks/undone/) · `node Server/PastWork.mjs <topic>`
- **Dashboard:** [doc/one-dashboard.md](doc/one-dashboard.md) · [doc/one-state.md](doc/one-state.md) · plan: [doc/ai-dashboard-plan.md](doc/ai-dashboard-plan.md) · known problem, asked 7 times: [doc/dashboard-layout-asks.md](doc/dashboard-layout-asks.md)
- **Where things go:** [doc/organization.md](doc/organization.md) · [doc/task-folders.md](doc/task-folders.md) · [systems-map.md](systems-map.md) · [doc/repo-size.md](doc/repo-size.md)

## More

[doc/readme.md](doc/readme.md) (the index of every AI-system doc) · [doc/architecture.md](doc/architecture.md) · [todo.md](todo.md) · [handover.md](handover.md) · [doc/watch-out-2026-10-12.md](doc/watch-out-2026-10-12.md) · [doc/design/systems-overview.md](doc/design/systems-overview.md) · the readme as it stood before this rewrite (every older link and the page tabs): [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
