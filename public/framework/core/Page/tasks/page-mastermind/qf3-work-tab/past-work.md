<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The session page s Work tab  bare task id lines count  and a TaskPage opens its step folders" (words: session, work, tab, bare, task, lin, count, taskpage, open, step, folder)

## Tasks (8, best first)
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 13 files
- [core/Task](/framework/core/Task/) — used by 764 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files

## Docs and readmes
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [asks.js — Asks Tab Design Notes](/framework/ai/AITask/doc/asks-notes.md) — ## The Asks Tab Shows everything the owner asked for in this session as preview cards, each linked back to the sentence they said it in. On…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Session accounting: what was decided, and where each ask st…](/framework/ai/AISession/doc/accounting-decision.md) — Decision (2026-10-16 18:53, voice-app, owner delegated): the one-folder shape.md is not built as its own project. The task system (Task ext…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…

## Sessions tagged with these words
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/15 [Past-work log node script](/framework/ai/sessions/2026/10/15/session-d76f0d2e/) — kind/owner model/sonnet mod/server mod/ai/sessions task/past-work-log · $1.06
- 2026/10/15 [Past-work audits](/framework/ai/sessions/2026/10/15/session-c19535e4/) — kind/owner model/haiku mod/ai/sessions task/past-work-audits framework/ai · $0.26

## Owner asks
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; siblin… (servex-mastermind-opus (spawn after the 10 PM weekly reset), queued)
- 2026-10-13 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (?, queued)
- 2026-10-18 UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; siblin… (?, tracked)

## Commits
- 39324edca priority.md: the review home is the session page's Work tab; the queue moves to the system architect; deputy …
- 2007ae0fc StaleClose: never close a live VS Code tab or a folder whose work is in its children; new task folders count …
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 9bde32ef1 Agents know their own page: Servex whoami names /framework/ai/sessions/<id>/; prompt-relay tells a VS Code ta…
- 01ef0f319 Page tool: route paths, your own page by default, ids stamped, size answered; session pages reshaped by their…
- ac28ba1e6 data-grid: land worktree/data-grid into michael/dev
- 8824068fd sessions-tab-polish: land worktree/sessions-tab-polish into michael/dev
- 3167d0186 smoke.mjs: treat files.jsonl/page.jsonl probe 404s and /ai-logs/ 404s as warns

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: The session page's Work tab: bare task-id lines count, and a TaskPage opens its step folders

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The session page's Work tab: bare task-id lines count, and a TaskPage opens its step folders"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
