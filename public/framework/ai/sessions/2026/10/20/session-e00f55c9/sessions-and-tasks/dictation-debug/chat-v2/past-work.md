<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat v2  a session s chat drawn from its  tasks  list" (words: chat, session, drawn, task, list)

## Tasks (8, best first)
- 2026-10-24 [Session report: real cost, child sessions, year and month lists](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-report/) — The Report tab of a session's dated folder shows its real cost, its child sessions and its counts; the year and month pages list sessions (0fe5bc9b6). report tab wired to the item tool: the cost is the item tool's total, the same number the session page's sta…
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-20 [Sessions page: local days via Day.js](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind-2/) — Cherry-picked qf-7 commit 98ff1436e into michael/dev as 8f3d541dc (only AISessionsPage.js). Sessions page at scope=2026-10-20 checked at 1200: rows show, show-30-more-days present. Today button not clicked; merge.mjs not run (no dev server for qf-7).
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 22 files
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Task](/framework/core/Task/) — used by 795 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Proposal: notes on tasks, and a session log that replays as…](/framework/ai/doc/task-notes-proposal.md) — Status: proposal, not built (the owner asked to see it first, 2026-10-24, item 17 of [the brief](../sessions/2026/10/20/session-e00f55c9/se…
- [Session identity: which session owns each line, each dollar…](/framework/core/Session/doc/identity.md) — A session id is the uuid Claude gives one conversation. Everything this repo records about a session (its folder, its cost, its tasks, its …
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)

## Commits
- c0faf8b1c Dictate playground: real classes + live Structure panel + full-bleed

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat v2: a session's chat drawn from its `tasks` list

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat v2: a session's chat drawn from its `tasks` list"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
