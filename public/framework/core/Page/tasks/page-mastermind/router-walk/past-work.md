<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Router  a session store task folder opens with no 404 probes up its ancestors" (words: core, router, session, store, task, folder, open, 404, prob, ancestor)

## Tasks (8, best first)
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-01 [Probe tasks: tiny open-ended jobs that score the system on any model](/framework/ai/sessions/2026/09/30/probe-tasks/) — Probe tasks are built. The design, [probes.md](probes.md): five tiny open-ended jobs, six checks a script decides (parses, loads clean, followed the prompt, right skills, opened-logged-landed a task, linked from its parent), and every failure labelled system …
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-13 [framework/ai: date folders gone for good, one tree decided](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/) — No date folder left in framework/ai, and none can come back; old links still open. date directory cleaned up: 8 folders moved by script (831 files, verify 0 bad, undo tested first), 71 links relinked it can't come back: every writer goes through TaskDirs, whi… · paths 1/1 exist
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Router](/framework/core/Router/) — used by 45 files
- [core/Session](/framework/core/Session/) — used by 13 files
- [core/Task](/framework/core/Task/) — used by 761 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as a proposed task at the top …
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [core/Session](/framework/core/Session/readme.md) — A Session is one run of an agent or a tab: an Item that lives in its own dated folder, <root>/YYYY/MM/DD/<slug>/, and owns a list of tasks.…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…

## Sessions tagged with these words
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/13 [Core Router architecture documentation](/framework/ai/sessions/2026/10/13/session-8406d195/) — kind/agent model/haiku mod/core/router task/mastermind-repo-slim docs/architecture · $0.17
- 2026/10/13 [Core-session architecture documentation](/framework/ai/sessions/2026/10/13/session-46ed371f/) — kind/owner model/haiku mod/core/session task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-03 Console: clean on /ai/live; smoke fails on console noise and 404s (task-mastermind-console-clean, building)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)

## Commits
- 17877f6ce core/Page: owner start doc, class map, Router link; readme claims verified (6 stale fixed)
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- b56663d8d one-dictation/minion-core: fix the nav-before-push ordering bug behind the duplicated-lines/wrong-page bug, r…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Router: a session-store task folder opens with no 404 probes up its ancestors

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Router: a session-store task folder opens with no 404 probes up its ancestors"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
