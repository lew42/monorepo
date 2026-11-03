<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "AI index  a JSONL stream per day folder  written when a session  task or project is created or moved" (words: index, jsonl, stream, per, day, folder, written, when, session, task, project, created, moved)

## Tasks (8, best first)
- 2026-10-20 [AI index: a JSONL stream per day folder, written when a session, task…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-20 [Servex agents: logs over messages, round 2 (index, log tool, live tai…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 2: all seven asks landed; agents now write log lines with one log tool. prompt copy: one committed copy, everything else links it (decision in this log) [folder audit](/framework/ai/doc/ai-folder-audit.md); 4 files moved aside, old-session move script i… · paths 1/1 exist
- 2026-10-20 [sessions-and-tasks](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — Document who/how/when/where sessions and tasks are created in framework/ai/readme.md (OOP pseudo code); make sure a minion is a session, not a task; make sure Servex and its MCP are up (the cloud tunnel was down). · paths 1/1 exist
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Session](/framework/core/Session/) — used by 10 files
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 45 files

## Docs and readmes
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [The owner on projects, completion and dated folders (2026-1…](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) — Notes for the next Task refactor, from a dictation to the VS Code mastermind. The whole dictation: [ai/doc/owner-2026-10-20-who-makes-tasks…
- [TaskJSONL — the task manifest as a log](/framework/ext/JSONL/doc/task-jsonl.md) — session.json used to be written once and re-saved whole. TaskJSONL is the same fields — title, now, requested_at, landed_at, tokens, agents…
- [Would a real streaming server beat today's HTTP resend?](/framework/audio/Transcriber/doc/streaming.md) — Question (task-mastermind-audio, relaying the owner, 2026-09-29): today Transcriber.Whisper fakes "live" by re-POSTing the growing segment …
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [AITask — moved to [ai/AITask](../../ai/AITask/readme.md) on…](/framework/ext/AITask/readme.md) — It renders an agent task's log (one task, a day, the board), so it lives with the AI system now: the rule is at the top of [ai/readme.md](.…
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-18 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (?, tracked)

## Commits
- d1874fa80 system-architect round 2: ext/JSONL socket finding, next-task briefs (index-stream, project-move), minion bri…
- 41b93b214 sessions-and-tasks: the decided shape (owner 16:30) - one session.jsonl for every origin, tasks are lines, pr…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,219 tokens of reading, under the 100k limit).

Question: AI index: a JSONL stream per day folder, written when a session, task or project is created or moved

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "AI index: a JSONL stream per day folder, written when a session, task or project is created or moved"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
