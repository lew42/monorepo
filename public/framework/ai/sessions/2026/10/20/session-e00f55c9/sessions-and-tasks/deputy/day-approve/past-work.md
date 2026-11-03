<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Day page  approve a session in one press  and what is ready to merge" (words: day, approve, session, one, pres, ready, merge)

## Tasks (8, best first)
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-09-19 [day-audit](/framework/ai/sessions/2026/09/19/day-audit/) — 53 things you asked for today. 30 were done the way you said them; 23 were not. 12 partly, 5 done but different from what you said, 6 not started at all. Every verdict is judged against YOUR sentence, not against the report the task wrote about itself. ![the … · paths 1/1 exist
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Sessions page: local days via Day.js](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind-2/) — Cherry-picked qf-7 commit 98ff1436e into michael/dev as 8f3d541dc (only AISessionsPage.js). Sessions page at scope=2026-10-20 checked at 1200: rows show, show-30-more-days present. Today button not clicked; merge.mjs not run (no dev server for qf-7).
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [ai/merge — the "ready to merge" list and its Merge button](/framework/ai/merge/readme.md) — Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is …
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one dated folder: /framework/ai/…
- [Reply in place — talk to one item, where it already is](/framework/ext/Ask/doc/reply.md) — Every item on a task page is a thing you might want to say something about: an ask card, a decision row, a task card on the day board. repl…
- [One rolling voice session, or many](/framework/ux/Dictate/doc/sessions.md) — The browser voice chat is one session shared by every page (chat.js, kept in sessionStorage under lew42-voice-session). The question: shoul…
- [Cost accounting — one log, one number](/framework/ai/AISession/doc/cost-accounting.md) — The raw Claude session log is the only source of truth. Everything else (the live page, tail.json, page.jsonl, index.json, day snapshots) i…
- [AISession — one Claude session as a class family](/framework/ai/AISession/readme.md) — AISession reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The …
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)

## Commits
- 5a7b2fc29 Work tab review fixes: child sessions found across later day files (cost + Approve), Review.state() is the on…
- ac977b929 AISessionDetail: Work tab first (SessionWork: the session's work nested by task folder, own + rolled cost, du…
- c5d5a1b85 sessions/v/review: the review page as a sessions-list variant (shape for approval): nested by parent, Today p…
- 29a0f4eca templates-live-proof: land with the measurement; review of the approve fix filed under today's sessions

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,760 tokens of reading, under the 100k limit).

Question: Day page: approve a session in one press, and what is ready to merge

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Day page: approve a session in one press, and what is ready to merge"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
