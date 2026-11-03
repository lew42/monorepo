# Check 21 asks against the repo: ai

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/17-ai-2/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ai`, folder `public/framework/ai` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ai/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ai/readme.md`)

# AI

**What goes in `ai/` (the rule, 2026-10-13):** a module that exists only to run, show or feed an AI agent or model (`AITask`, `AISession`, `cards`, `rail`), and the AI system's records (the sessions store). A module that AI uses but any page could use too lives next door: `ext/` (JSONL, Chat, Mention, Query), `ux/` or `core/`. Which module is which, and what moves next: [doc/module-homes.md](doc/module-homes.md).

Where the agents' work is recorded, in one tree ([doc/task-folders.md](doc/task-folders.md)):

- **A task** (its log, brief, review): `ai/sessions/YYYY/MM/DD/<session>/<task>/`, made by `node Server/TaskDirs.mjs --new <slug>`; the day's log is `ai/sessions/YYYY/MM/DD/day.jsonl`. A script that writes a record of its own (a crawl, a council) asks `TaskDirs.dir({slug})` for the folder, never joins a date itself.
- **An Inbox card**: its folder is `ai/sessions/YYYY/MM/DD/cards/<card>/` (one tree since 2026-10-13); its id and its page stay `2026/10/13/<card>` and `/framework/ai/2026/10/13/<card>/`. Make one with `create_card`; turn an id into its folder with [`cards/CardDir.js`](cards/CardDir.js) (`Cards.dir(id)` in Servex), never by joining a path ([doc/task-folders.md](doc/task-folders.md#2026-10-13-one-tree-applied)).
- **Nothing else** is created under `ai/`: no `ai/<YYYY-MM-DD>/` day folder (refused since 2026-10-13), and a file about a module lives in that module's folder (its `readme.md`, or a `doc/<topic>.md` beside it).

The AI system: Servex runs the agents, the readme chain is their memory, each task is a folder with a JSONL log, and node (not memory) drives the steps. Components shown, one card each: [System tab](/framework/ai/system/). **Why it is shaped this way: [doc/architecture.md](doc/architecture.md).**

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): the page tabs, in full.

## Every system, one line each

Accounting first. Each link is that system's own short readme; follow it to go one level deeper.

- **Tasks** (in flight, queued, landed today, live): [tasks/readme.md](tasks/readme.md) · [/framework/ai/tasks/](/framework/ai/tasks/)
- **Accounting**: [token accounting](doc/tokens/tokens.md) · [spend per session](sessions/readme.md) · [budgets](/framework/servex/doc/budget.md) · agent logs: `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`, one per Servex agent, with a `turn_cost` line per turn since 2026-10-13 ([what is in them](sessions/2026/10/16/voice-20261016/accounting/answers.md))
- **Cloudflare** (what we would use, what it costs, the token you give us, the runaway guard): [doc/cloudflare.md](doc/cloudflare.md)
- **Skills proposals** (what to add or retire, 2026-10-13): [doc/skills-proposals-2026-10-13.md](doc/skills-proposals-2026-10-13.md)
- **Repo size** (what git holds, what should be committed, the plan to slim it): [doc/repo-size.md](doc/repo-size.md) · `node Server/RepoSize.mjs`
- **Servex** (runs the agents): [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [decisions](/framework/servex/doc/architecture.md)
- **Dev server**: [Server/readme.md](/framework/dev/)
- **MCP tools**: [doc/agents/mcp.md](doc/agents/mcp.md)
- **Models**: [system/models](system/models/) · [OpenRouter](/framework/servex/) · local
- **Usage pace** (how fast the week's limits are being spent against the clock, three meter variants beside today's): [usage/](usage/readme.md) · `node Server/usage-now.mjs`
- **Undone asks** (every ask with no landed task or card, by module, computed daily): [asks/undone](/framework/ai/asks/undone/) · [verdict](doc/undone-asks-2026-10-17.md) · `node Server/UndoneAsks.mjs`
- **Asks tally** (every ask you typed since 09-15, counted by feature, with what landed and what never did): [doc/asks-outcomes.md](doc/asks-outcomes.md) · `node Server/AskTally.mjs page`
- **Follow-up** (what fell through the cracks, computed; plus unused-file census): [doc/follow-up.md](doc/follow-up.md) · [doc/unreferenced.md](doc/unreferenced.md) · `node Server/FollowUp.mjs --write`
- **Sessions** (VS Code tabs, browser voice agents): [sessions/](sessions/readme.md) · [conversations](doc/logs/conversations.md)
- **Audits** (every audit we ran, with a verdict and whether it was followed up): [audits/readme.md](audits/readme.md)
- **Transcription**: [ux/Dictate](/framework/ux/Dictate/)
- **Class cards, live** ([classes](/framework/ai/classes/)): a class, its API, and a debug tree of a live instance beside its rendered view. First: Session.
- **Prompt refinement** (Echo, running now): [Servex/doc/echo.md](/framework/servex/doc/echo.md) · [ext/Refine live demo + Prompt class](/framework/ext/Refine/) · [vision](/framework/ext/Refine/doc/vision-2026-10-08.md) · [dictation connection map](/framework/ai/doc/design/dictation-refine-connection-map.md) · **new 2026-10-16, owner notes:** [card types + the plan → proposal → task lifecycle](/framework/ext/Refine/doc/card-types.md)
- **Page system**: [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/)
- **Handover as a query** (plan: handover computed at read time from the task logs, not hand-written): [doc/handover-query.md](doc/handover-query.md)
- **Past work** (look before you build): [past-work-index.md](past-work-index.md), generated from every landed task; search a topic with `node Server/PastWork.mjs <topic>` (the `past-work` skill)
- **Finding past work** (owner asks 1 to 3, 2026-10-17: where the query stands, "does it exist" before a build, how readme indexing works): [doc/owner-2026-10-17-finding-past-work.md](doc/owner-2026-10-17-finding-past-work.md) · [salvage branches decided](doc/salvage-2026-10-17.md)
- **Skills and CLAUDE.md**: [skills](../../../.claude/skills/)
- **Dashboard, Log, Inbox**: the tabs above · [AI 2 (merged into this folder, old address kept)](/framework/ai2/readme.md)
- **AITask** (one task's log, a day, the board; moved here from `ext/`, 2026-10-13): [AITask/readme.md](AITask/readme.md)
- **Classes that draw it** (moved here from `ai2/`, 2026-10-09): [cards/](cards/) — `Card` and what a card shows (chat, compose, outline, activity, tasks, faces…) · [rail/](rail/) — `AIRail`, `CardList`, `Groups`, the Live card, Needs, Log, Overview, Processes · [archive/ai2](archive/ai2/readme.md) — old AI 2 page logs, kept
- Sizes and freshness of all of them: [systems-map.md](systems-map.md) · **Organization** (what goes where; System class, hourly check): [doc/organization.md](doc/organization.md) · [Systems](/framework/ai/systems/)

- **Page parts** — a page body as a streamed list of parts: [`core/Page/parts/readme.md`](../core/Page/parts/readme.md)
- **Page tool** — agents change any page by path + delta: [`core/Page/doc/page-tool-2026-10-09.md`](../core/Page/doc/page-tool-2026-10-09.md)
- **New 2026-10-12:** [core/Property](../core/Property/readme.md) · [core/Page/Template](../core/Page/Template/readme.md) · [ext/Shots](../ext/Shots/readme.md) · [ext/Query](../ext/Query/readme.md) · [ext/DataGrid](../ext/DataGrid/readme.md) · [code/performance](../code/performance/readme.md)
- **Inbox timeline** (everything built and everything waiting on you, ranked): [the timeline](/framework/core/Page/ext/Inbox/timeline/) · [where its data lives](../core/Page/ext/Inbox/doc/inbox-data.md)
- **PageInbox** (a note left on a page reaches its owner): [PageInbox.js](../core/Page/PageInbox.js) · [inbox tab](../core/Page/doc/inbox-tab.md)
- **Module inbox** (an ask's essence goes to the module's `inbox.jsonl`, a fresh mastermind reads it later): [Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md)
- **UI library** (every ui and Figma item): [library](../library/readme.md) · **Layout catalog**: [layouts](../../layouts/readme.md)
- **Step runner** (a task as ordered steps): [Servex/doc/steps.md](../../../Servex/doc/steps.md)

## Start here

- [systems-map.md](systems-map.md): where every major system lives, how long its readme is, and when it last changed.
- **[doc/readme.md](doc/readme.md): the index of every AI-system doc**, by subsystem (design, agents, tokens, logs, tasks, ai2, meta). Sessions docs: [sessions/doc/readme.md](sessions/doc/readme.md).
- [doc/architecture.md](doc/architecture.md): the decisions behind this folder, and where they came from.
- [doc/tool-collapse.md](doc/tool-collapse.md): recommended next, fewer tools with a generic `call` as step one (plan only).
- [doc/cleanup.md](doc/cleanup.md): cleanup items the owner noticed (duplicate task folders, session names that are not links).
- Servex SDK: how an agent is started ([`Servex/doc/sdk.md`](/framework/servex/doc/sdk.md)) and Servex's own decisions ([`Servex/doc/architecture.md`](/framework/servex/doc/architecture.md)).
- [doc/design/systems-overview.md](doc/design/systems-overview.md): full AI architecture, persistence, triggers, and MCP tool/session logging audit.
- [todo.md](todo.md): what's waiting, in priority order, and what only you can do.
- [handover.md](handover.md): the state of the world for a fresh tab or mastermind.
- [doc/agents/autonomy.md](doc/agents/autonomy.md): dynamic heartbeat, unstuck protocol, node-based steps, truthful token accounting.
- [Asks](asks/): every ask you made today onward, who owns it, and whether it landed or stalled.
- [The ask loop](council/): everything you asked, whether it was built, and what the council found. Open asks come first.
- [AI 2, now part of this folder](/framework/ai2/readme.md): the old dashboard address. Talk to the assistants, see tasks by group, and see

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/17-ai-2/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 21 asks

1. `18c45a2ed5` (3 days old): Run the fast and smart assistants as separate SDK instances, each with its own context.
2. `91f041222c` (3 days old): Keep the fast assistant on Haiku, under 100K tokens, auto-compacting or resetting after about half an hour.
3. `a715741e88` (3 days old): Let code, not AI memory, close worktrees and move to the next task; the node system replies with the next task and updates the data structures.
4. `4923a051e2` (3 days old): Build a pre-programmed node loop that starts after mastermind approval and logs each step with timestamps.
5. `27c5f21da2` (3 days old): Only the smart assistant replies in chat; the fast assistant stays a quiet trigger that cleans chunks, removes filler and turns references like framework/AI into path links, rather than being removed.
6. `b6beca8793` (3 days old): The fast assistant speaks only when called by name, replying with a short presence check.
7. `18697ca79b` (3 days old): The smart assistant coordinates the handoff, refines prompts, checks sense, asks clarifying questions, and routes to masterminds.
8. `e1c18c69b5` (3 days old): Clarifying questions time out, then proceed with the top-ranked decisions from a decision overview, not a council vote.
9. `71564a8295` (3 days old): Masterminds take tool-heavy work through a queue, keeping the smart assistant's hands free.
10. `b1122ab68c` (3 days old): Report the status of the AI model testing system.
11. `e616ab8128` (3 days old): Fast assistant cleans each chunk: punctuation, filler removal, and path links for references such as framework/AI.
12. `823b97abd3` (3 days old): Fast assistant does not reply in chat; it answers only when addressed by name.
13. `731509b3c7` (3 days old): Smart assistant replies in chat and coordinates the handoff of refined prompts.
14. `3eed4511dc` (3 days old): Smart assistant does prompt refinement, checks sense, and asks clarifying questions.
15. `c39737e074` (3 days old): If the owner does not answer a question, time out and proceed with the top-ranked decision, with no council vote.
16. `f335443cb4` (3 days old): Maybe the smart assistant ranks options, possibly with a mastermind.
17. `5b6717d028` (3 days old): Queue prompts to masterminds, who may use tools.
18. `db74429be4` (3 days old): Keep the smart assistant quick and light, relaying with minimal work.
19. `490ad6b98f` (3 days old): Smart assistant turns raw transcripts into structured content, places it, and passes it to masterminds.
20. `a14ee666c4` (3 days old): Write placement rules into the skill system: when to create a new file, its name, and what it contains.
21. `097ebd10d4` (3 days old): Fix the inbox items so each links to its correct, consistent location.
