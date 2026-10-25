<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Every spawn is a Session entry in its parent s record  under the task that caused it" (words: every, spawn, session, entry, parent, record, under, task, caused)

## Tasks (8, best first)
- 2026-10-25 [A child session is a task in its parent's record; recompute only what…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/requirements.md
- 2026-10-24 [Closed worktrees: no code lost; 6 task records restored](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/) — The 20 closed worktrees with unmerged commits lost no code every branch sorted: 20 by the script = 20 table rows ([report](report.md)) 6 records restored to michael/dev (3 reviews, 2 docs-checks, a lines.json); 37 files left on their branches, each with its r…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [A spawned agent's folder starts as session.jsonl (slice 3)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [Git status: the log sweeper now covers every record kind; a Servex re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tidy-git-status/) — The sweeper's allowlist is widened and today's dirty records are committed; it runs only after a Servex restart. Landed by the mastermind from the agent's own answer (the agent ended without a landing line). LogSweeper ALLOW widened (sessions day index.json, …

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [core/Task](/framework/core/Task/) — used by 795 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [AITask — decisions and record](/framework/ai/AITask/doc/decisions.md) — *moved from readme.md 2026-08-17; conclusive, not current guidance.* The AI working log, rendered. Three tiers, named: a session (one Claud…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [Prompt records: every owner prompt broken down, tracked and…](/framework/ext/Refine/doc/prompt-records.md) — The owner's long prompts hide sentences nobody acted on. A prompt record splits a prompt into parts, says what came of each part, and compu…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …

## Sessions tagged with these words
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-50064889/) — kind/agent model/opus mod/ai/sessions task/spawn-policy · $0.82
- 2026/10/15 [Spawn policy mastermind role](/framework/ai/sessions/2026/10/15/session-35ca9f31/) — kind/owner model/sonnet work/read-only task/spawn-policy framework/sessions · $0.90
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, routed)

## Commits
- 8f5818518 deputy: session-entries brief and plan (items 31-33: every spawn a Session entry under its cause, children as…
- 2aceb793f session-is-a-task review fixes: Total counts a record task that points at a listed folder once; the feed head…
- 00b85204d docs: Session is a Task - how work gets into a session (an AI adds a task; an AI spawns a child), references …
- 4a3f49090 Servex: a session's children include every agent it spawned since it began, wherever the task lives, and thei…
- 8d35a1123 mastermind role: standing system architect respawned daily, logs over chat, approve plans in autonomous mode;…
- 9ecff3280 Servex: every spawn opens a task dir (task: false opts out); private-Servex proof
- 9e947fcd7 sheet step 8: page hand-off from the global chat
- d13bdc643 Servex: spawn_agent defaults parent to the caller (ctx.caller), per the owner's parent/child requirement

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: Every spawn is a Session entry in its parent's record, under the task that caused it

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Every spawn is a Session entry in its parent's record, under the task that caused it"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
