# AI — the folder where the AI system's records live and the pages that show them

**Priorities now: [priority.md](priority.md)** — the ranked list every mastermind reads before it spawns. Who does what: [doc/readme-system.md](doc/readme-system.md) (roles, what each agent reads).

`ai/` holds (1) the AI system's **records**: the session store, the asks ledger, the cards index, the usage logs, `index.json`; (2) the **classes that draw them**: `AISession/`, `AITask/`, `cards/`, `rail/`, `tasks/`; (3) docs about the AI system (`doc/`). A module that AI merely *uses* does not belong here. Servex (`Servex/`, [/framework/servex/](/framework/servex/)) runs the agents; each task is a folder with a JSONL log; node scripts, not memory, compute every number. The pages: [/framework/ai/](/framework/ai/) (the Inbox), [System tab](/framework/ai/system/).

## Every system, one line each

- **Maps** (what each role reads, every tool, every item writer, processes; read one before you dig): [doc/readme.md#maps-read-one-before-you-dig](doc/readme.md#maps-read-one-before-you-dig)
- **Records** (every file in `ai/`, its writer and its reader; who makes sessions and tasks, and where): [doc/records.md](doc/records.md)
- **Roles and rules:** one readme per role, [Servex/agents/roles/readme.md](../../../Servex/agents/roles/readme.md) · safety and cost rules, long form: [doc/agent-rules.md](doc/agent-rules.md) · what each agent reads: [doc/readme-system.md](doc/readme-system.md)
- **Principle:** effective parallel work between sessions. A parent answers or hands off, helpers are reused, tasks are created, tracked, logged and finished. A spawned agent is a **session**, a task is something to finish inside it: [doc/sessions-and-tasks.md](doc/sessions-and-tasks.md).
- **The task queue** (a mastermind's queue is its tasks plus a priority; TaskLoop starts the top ones through Servex's 5-agent cap; handoff is a task at a path): [doc/task-queue.md](doc/task-queue.md)
- **The AI system mastermind** owns sessions, tasks, roles, skills and spawning: there is one, always the id `ai-system-mastermind`. Send it any question or configuration of those, and log problems for it with `module_inbox` (module `ai`, with a `fix`; the third repeat wakes it). Its role: [Servex/agents/roles/ai-system-mastermind.md](/Servex/agents/roles/ai-system-mastermind.md); its spend: `node Server/role-spend.mjs ai-system-mastermind`.
- **Compaction and context drift** (when an agent's context is summarized and what it costs; why a long session forgets its role, and the role text in the system prompt that keeps it): [doc/compaction.md](doc/compaction.md) · [doc/context-drift.md](doc/context-drift.md)
- **Context loss** (a session survives only in files; what to write where; computed state instead of a handover): [doc/context-loss.md](doc/context-loss.md) · how agents talk and what each message leaves on disk: [Servex/agents/doc/messaging.md](/Servex/agents/doc/messaging.md) · **readme rule, checked by code:** `node Server/ReadmeOrphans.mjs` lists every system the readme above it never names; add the missing one-liner whenever it prints one.
- **Tasks:** [tasks/readme.md](tasks/readme.md) · [doc/tasks.md](doc/tasks.md) (what a task is, two homes, who makes one) · [core/Task](/framework/core/Task/) · **processes** (a task whose phases node runs in order, completion automatic): [core/Task/doc/process.md](/framework/core/Task/doc/process.md)
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
- **Ready to merge** (branches agents marked `ready:`, one Merge button each): [merge/readme.md](merge/readme.md) · [/framework/ai/merge/](/framework/ai/merge/)
- **Where things go:** [doc/organization.md](doc/organization.md) · [doc/task-folders.md](doc/task-folders.md) · [systems-map.md](systems-map.md) · [doc/repo-size.md](doc/repo-size.md)

## Classes and folders that draw them

[`AIDay/`](AIDay/readme.md) — the day page ([/framework/ai/2026-10-20/](/framework/ai/2026-10-20/)): the tasks started or landed that day as a check-mark list (✅ landed, ⬜ open), nested session → task → child, read from the `tasks` query source over the store, live; each session has Approve, and today's page shows the ready-to-merge list.

[`now/`](now/readme.md) — the live in-flight page ([/framework/ai/now/](/framework/ai/now/)): every session active in the last hour, from the `inflight` query source.

[`readmes/`](readmes/readme.md) — what an agent in each folder is given to read: every folder with a readme, its readme chain in tokens, filterable ([/framework/ai/readmes/](/framework/ai/readmes/); data from `node Server/ReadmeChains.mjs`).

`AISession/` (`class AISession extends Session`, [sessions](sessions/readme.md)) · `AITask/` (`class AITask extends Page`, [AITask](AITask/readme.md)) · `cards/` (`Card` and what a card shows) · `rail/` (`class AIRail extends Inbox.Rail`, `DashState`, `CardList`; the [Inbox](/framework/core/Page/ext/Inbox/)) · `tasks/` ([Tasks](tasks/readme.md)) · `classes/` (live class cards) · `systems/`, `system/` (`AISystem.js`, the System tab) · `usage/` · `audits/` · `health/` · `local/` · `quick-fix/` · `review/` · `talk/` · `tests/` · `dashboard/` · `asks/`, `council/`, `models/`, `errors/`, `collab/`, `process/`.

## More

[doc/readme.md](doc/readme.md) (the index of every AI-system doc) · [doc/architecture.md](doc/architecture.md) · [todo.md](todo.md) · [handover.md](handover.md) · [doc/watch-out-2026-10-12.md](doc/watch-out-2026-10-12.md) · [doc/design/systems-overview.md](doc/design/systems-overview.md) · the readme as it stood before this rewrite (every older link and the page tabs): [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).

## Notes from your asks

- Rules, preferences and ideas you said about this module: [doc/notes-from-asks.md](doc/notes-from-asks.md)
