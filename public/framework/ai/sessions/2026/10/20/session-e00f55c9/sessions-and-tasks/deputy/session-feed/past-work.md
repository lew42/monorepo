<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session page  every task and child session  newest first" (words: session, every, task, child, newest, first)

## Tasks (8, best first)
- x [ai-highlights](/framework/ai/sessions/2026/09/08/ai-highlights/) — The AI front page is a wall of 81 highlights, grouped by day — [/framework/ai/](/framework/ai/): what is running, the usage windows, then a card for every thing worth going back to, newest day first. Every task of every day moved to [/framework/ai/log/](/fram… · paths 3/6 exist, gone: framework/ext/AITask/doc/highlights/ framework/ext/AITask/doc/manifest/ framework/ai/effort/websites/
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-12 [Sessions grid: newest month first, live, current model, one row per s…](/framework/ai/sessions/2026/10/12/session-eecd88fa/sessions-grid/) — Round 2 of the Sessions grid is in: one list by recency, five role chips, columns that resize, cost freshness shown. Details: [grid-loading.md](/framework/ai/sessions/doc/live/grid-loading.md). one grid sorted by recency: the Now strip is gone, working rows s…
- 2026-10-24 [Session report: real cost, child sessions, year and month lists](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-report/) — The Report tab of a session's dated folder shows its real cost, its child sessions and its counts; the year and month pages list sessions (0fe5bc9b6). report tab wired to the item tool: the cost is the item tool's total, the same number the session page's sta…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-12 [Sessions grid: one scroller, routine chips, search that finds every s…](/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/) — [Sessions](/framework/ai/sessions/) at 3440: rows fill the screen under a solid sticky header; routine sessions are count chips; the search finds any session. ![live](sessions-perf/live-3440-search.png) one scroller, solid sticky header row: [before](sessions…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Task](/framework/core/Task/) — used by 772 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Follow-up: every task of the last 10 days](/framework/ai/doc/follow-up-full.md) — 1328 tasks, flagged first. Summary: [follow-up.md](follow-up.md). | task | group | session | model | started | last log | step | state buck…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [The first message forks; every later one resumes](/framework/ext/Ask/doc/fork.md) — A headless turn must never share a transcript that a human still has open in an interactive terminal — both processes would append to the s…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-10-18 Dictation: one configurable widget everywhere; widget first on the page (?, tracked)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)

## Commits
- 2ca2bc8ef core/Task: TaskPage asks for task.jsonl first in a <module>/tasks/<slug>/ folder, so a task page makes no 404
- ab055dec1 asks-to-tasks: merge smoke fixes — 5 proposals under page-less modules move to their paged parent; allow two …
- 691997e5f Sessions account for every task: explicit parent wins, a tab session with no log gets one, --links census and…
- 8d35a1123 mastermind role: standing system architect respawned daily, logs over chat, approve plans in autonomous mode;…
- 41b93b214 sessions-and-tasks: the decided shape (owner 16:30) - one session.jsonl for every origin, tasks are lines, pr…
- 9ecff3280 Servex: every spawn opens a task dir (task: false opts out); private-Servex proof
- 4b78063c5 state: class State, one structure for every task in both stores, folded through Task.js, with a self-check; T…
- 9e947fcd7 sheet step 8: page hand-off from the global chat

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,196 tokens of reading, under the 100k limit).

Question: Session page: every task and child session, newest first

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session page: every task and child session, newest first"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
