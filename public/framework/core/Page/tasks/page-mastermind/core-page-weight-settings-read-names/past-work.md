<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page  weight  ai_cost and settings ask the folder s names  not the old directory json" (words: core, weight, cost, setting, ask, folder, nam, not, old, directory, json)

## Tasks (8, best first)
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-15 [core/Page: subpages are page.jsonl lines, never page.js edits](/framework/ai/sessions/2026/10/16/voice-20261016/subpages/) — core/Page: subpages are page.jsonl lines, never page.js edits — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost $1.34 (session 0c3e83dd). The log has the details.
- 2026-10-13 [framework/ai: date folders gone for good, one tree decided](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/) — No date folder left in framework/ai, and none can come back; old links still open. date directory cleaned up: 8 folders moved by script (831 files, verify 0 bad, undo tested first), 71 links relinked it can't come back: every writer goes through TaskDirs, whi… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 769 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Ask](/framework/ext/Ask/) — used by 42 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 50 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Extensions — a page.jsonl line turns a small piece of behav…](/framework/core/Page/ext/readme.md) — See it running: [this page](/framework/core/Page/ext/) — its own page.jsonl has one line, {"ext": "Inbox"}, and two {"inbox": …} messages. …
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [The owner on projects, completion and dated folders (2026-1…](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) — Notes for the next Task refactor, from a dictation to the VS Code mastermind. The whole dictation: [ai/doc/owner-2026-10-20-who-makes-tasks…
- [page.jsonl pages: how they load, how they name children, on…](/framework/core/Page/doc/jsonl-pages.md) — These are three answers, each with the verbatim source and its file:line, read on 2026-10-15. The full lookup order (md/, fs/, inbox/, bare…
- [Page — a folder with a page.js or page.jsonl is a page: a u…](/framework/core/Page/doc/readme-before-2026-10-19.md) — How a page renders (code with helper functions, page.jsonl deltas, or both; markdown; live updates): [doc/how-a-page-renders.md](doc/how-a-…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## Commits
- 4b79c09e4 console-clean: stop the weight/page.jsonl 404 storm, gate smoke.mjs on console noise
- 2fe922777 core/Page: AI cost per page (roadmap 10b)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page: weight, ai_cost and settings ask the folder's names, not the old directory.json

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page: weight, ai_cost and settings ask the folder's names, not the old directory.json"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
