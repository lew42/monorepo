<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session page  the Tasks tab as a grid  step 2d " (words: session, task, tab, grid, step)

## Tasks (8, best first)
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-02 [Sessions tab: CSS-grid data grid, side peek, Panel2 preview levels](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-grid-v2/) — Sessions is now a real data grid. [/framework/ai/sessions/](/framework/ai/sessions/) — six columns (Start, Source, Name, Model, State, Cost), newest activity first. data grid of every session, six named columns — shot in task log no <table>, one --col-<name> … · paths 2/3 exist, gone: framework/ext/panel2/doc/preview-levels/
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-16 [Session extends Item: step 7 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/session-item/) — Landed on michael/dev as 6858167bc.

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Task](/framework/core/Task/) — used by 799 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/DataGrid](/framework/ext/DataGrid/) — used by 9 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [asks.js — Asks Tab Design Notes](/framework/ai/AITask/doc/asks-notes.md) — ## The Asks Tab Shows everything the owner asked for in this session as preview cards, each linked back to the sentence they said it in. On…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Chat v2: a session's chat, drawn from its tasks list](/framework/ext/Chat/v2/readme.md) — Read-only step 1 of the new chat (the owner's decision, [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tas…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)

## Commits
- 038893e93 page tools: typo-proof session paths; scan finds a tab's hook-made folder
- edea1aeed deputy: cost-line landed (live: $287 this tab · $1070 with children on list and page), review records for chi…
- e6b174c37 ai: briefs, sessions list loads by index + live totals + detail task grid; dictation: web dictation into the …
- b2caa1815 ai: briefs, dictation debug tab + stall, and this session's task closeout (owner)
- 9c35435b0 session page: Overview is one list of every task and child session, newest first, with own and total counts; …
- e3073f74a session page: opens on every day's folder of a session (10/24 tasks joined), counts that add up, the session …
- bd3bb35cd AISessionDetail: read the session record only when its folder lists session.jsonl (the Role block and the tas…
- 7a705b520 Session page (desktop): sticky stats bar, Overview cards (open, project, done, dropped), Tasks and Chat tabs,…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Session page: the Tasks tab as a grid (step 2d)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session page: the Tasks tab as a grid (step 2d)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
