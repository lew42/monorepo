<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session page  a session shows its tasks  live" (words: session, show, task, live)

## Tasks (8, best first)
- 2026-10-20 [Session page: a session shows its tasks, live](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session-page-tasks/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session-page-tasks/requirements.md
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-12 [Sessions grid: newest month first, live, current model, one row per s…](/framework/ai/sessions/2026/10/12/session-eecd88fa/sessions-grid/) — Round 2 of the Sessions grid is in: one list by recency, five role chips, columns that resize, cost freshness shown. Details: [grid-loading.md](/framework/ai/sessions/doc/live/grid-loading.md). one grid sorted by recency: the Now strip is gone, working rows s…
- 2026-09-24 [Every task shows what it cost](/framework/ai/sessions/2026/09/24/ai2-cost-fill/task-cost/) — Every task now shows what it cost in dollars, including its minions, and the day and each effort show their totals. - See it: the [day page](/framework/ai/2026-09-24/) reads "$202.87+ today", with one total per effort (ai log $115, servex $29, pages $22 …). E…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-16 [Task migration: 211 old tasks moved to module homes](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) — 211 old tasks now live in their module's tasks/ folder; nothing deleted (2c8f4b674, 78bf8eb52) lose no data: each old file only gained one home line, proven by sha256 prefix; diff shows 211 added lines, 0 removed a task that clearly belongs to a module moves:…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 13 files
- [core/Task](/framework/core/Task/) — used by 516 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [AI — the folder where the AI system's records live and the …](/framework/ai/readme.md) — Priorities now: [priority.md](priority.md) — the ranked list every mastermind reads before it spawns. Who does what: [doc/readme-system.md]…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as a proposed task at the top …
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [AI](/framework/ai/doc/readme-before-2026-10-19.md) — What goes in ai/ (the rule, 2026-10-13): a module that exists only to run, show or feed an AI agent or model (AITask, AISession, cards, rai…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…

## Sessions tagged with these words
- 2026/10/15 [Live post review](/framework/ai/sessions/2026/10/15/session-4a77ddf9/) — kind/agent model/sonnet mod/ai/sessions task/live-post page/live-cards · $0.23
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14

## Owner asks
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)

## Commits
- d1a2fa636 prompt tasks: the session page shows the session's tasks live, Approve / Not now on a proposal (core/Session/…
- 9e947fcd7 sheet step 8: page hand-off from the global chat
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 565c900ce AI pages review: Models draws inside its page, Inbox footer band gone, Sessions header compact, session page …
- 8fe10c3e4 archive-phase-2: pictures a page shows stay on C: (734, 96 MB); final: 4,248 pictures (483 MB) on E:, Aug+Sep…
- 14f7153c7 sessions: fix OpenRouter env clobber, add fallback proof + a tracked gap
- 8e20aacec Fix review findings: silence check without an agent, no reload churn
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Session page: a session shows its tasks, live

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session page: a session shows its tasks, live"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
