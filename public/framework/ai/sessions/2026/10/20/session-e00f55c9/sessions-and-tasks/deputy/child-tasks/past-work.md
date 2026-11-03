<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "A child session is a task in its parent s record  recompute only what changed  one read gives completion" (words: child, session, task, parent, record, recompute, only, changed, one, read, giv, completion)

## Tasks (8, best first)
- 2026-10-20 [A child session is a task in its parent's record; recompute only what…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/requirements.md
- 2026-10-24 [Day page: Approve a session, and Ready to merge](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/day-approve/) — The [day page](/framework/ai/2026-10-24/) now has an Approve button on each session and, on today's page, the Ready to merge list (51a321c39, 6978be3ea). approve a whole session with one press: session-e00f55c9 shows Approve on today's page ([shot](shots/2026…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [AISessionIndex: record-only sessions get a title from session.summary…](/framework/ai/sessions/2026/10/20/voice-20261020/index-record-sessions/) — Record-only (cloud voice) snapshots already landed in 6a86a5de4; this adds the title lookup (e04f922fd). Needs a dev server restart to index the cloud voice folder.
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [core/Task](/framework/core/Task/) — used by 774 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [AISession — one Claude session as a class family](/framework/ai/AISession/readme.md) — AISession reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The …
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [core/new — one sketch kept for the record; two deleted 2026…](/framework/core/new/readme.md) — ## Index [1](./1/) — the sketch where the shipping design (Router, lazy children, regions) was proved; read it, never import it Don't impor…

## Sessions tagged with these words
- 2026/10/15 [Standing rules for domain masterminds](/framework/ai/sessions/2026/10/15/session-7e1f2802/) — kind/owner model/sonnet work/read-only task/standing-rules framework/sessions · $0.57
- 2026/10/15 [Spawn policy mastermind role](/framework/ai/sessions/2026/10/15/session-35ca9f31/) — kind/owner model/sonnet work/read-only task/spawn-policy framework/sessions · $0.90
- 2026/10/14 [Screenshots never committed](/framework/ai/sessions/2026/10/14/session-d60d1ad7/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/sessions · $1.12
- 2026/10/14 [Reading page design](/framework/ai/sessions/2026/10/14/session-09b6c5ca/) — kind/agent model/sonnet work/read-only task/figma-claude-designs framework/sessions · $0.17
- 2026/10/13 [Clarity session index](/framework/ai/sessions/2026/10/13/session-ef78db5d/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/sessions · $0.15
- 2026/10/13 [Sessions page layout](/framework/ai/sessions/2026/10/13/session-7156fb15/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim page/ai-sessions · $3.81

## Owner asks
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, routed)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, landed)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)

## Commits
- 3ccb9c905 deputy: briefs for items 24-26 (child session is a task in its parent's record; recompute only what changed; …
- 44fc79f2c ai: briefs, session-is-a-task part 6 (child session as a task at spawn, recompute only what changed, completi…
- 2aceb793f session-is-a-task review fixes: Total counts a record task that points at a listed folder once; the feed head…
- dd6091200 ai: session-is-a-task brief part 4 (retire show: lines, session log = states + pointers, follow children, che…
- e2e2d5415 session-is-a-task: slow-write.md (each step of a write timed: a full read was 21.7 s with 2,652 cost lookups …
- 00b85204d docs: Session is a Task - how work gets into a session (an AI adds a task; an AI spawns a child), references …
- 0d71f5701 core/Session: session-task.test.mjs (Test class, 9 checks): a Session is a Task, tasks.add string or object, …
- 9c35435b0 session page: Overview is one list of every task and child session, newest first, with own and total counts; …

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: A child session is a task in its parent's record; recompute only what changed; one read gives completion

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "A child session is a task in its parent's record; recompute only what changed; one read gives completion"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
