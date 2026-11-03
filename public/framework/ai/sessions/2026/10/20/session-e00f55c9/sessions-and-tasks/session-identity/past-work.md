<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session identity  every line  cost and task attributed to the right session  never twice  never lost" (words: session, identity, every, line, cost, task, attributed, right, never, twice, lost)

## Tasks (8, best first)
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-24 [Closed worktrees: no code lost; 6 task records restored](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/) — The 20 closed worktrees with unmerged commits lost no code every branch sorted: 20 by the script = 20 table rows ([report](report.md)) 6 records restored to michael/dev (3 reviews, 2 docs-checks, a lines.json); 37 files left on their branches, each with its r…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-15 [core/Page: subpages are page.jsonl lines, never page.js edits](/framework/ai/sessions/2026/10/16/voice-20261016/subpages/) — core/Page: subpages are page.jsonl lines, never page.js edits — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost $1.34 (session 0c3e83dd). The log has the details.
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-03 [AI cost on every page: a script, a reader, a header line](/framework/ai/sessions/2026/10/03/list-events/page-ai-cost/) — Server/page-ai-cost.mjs landed — splits each task's cost evenly across the pages it touched, writes it onto each page's own log (law 7: never recomputed). walks every task log, reuses cost_usd: [page-ai-cost.mjs](/framework/Server/page-ai-cost.mjs) a reader: … · paths 3/4 exist, gone: framework/Server/page-ai-cost.mjs
- 2026-10-12 [Page: open-work line on every page, weight on any object](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/) — Every page now shows its open tasks, and any object can carry a weight. #6 open tasks per page: a "N open tasks on this page" line on every Page and Doc page, from computed ai/page-work.json — [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md)… · paths 1/1 exist
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [core/Task](/framework/core/Task/) — used by 774 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Cost accounting — one log, one number](/framework/ai/AISession/doc/cost-accounting.md) — The raw Claude session log is the only source of truth. Everything else (the live page, tail.json, page.jsonl, index.json, day snapshots) i…
- [Proposal: notes on tasks, and a session log that replays as…](/framework/ai/doc/task-notes-proposal.md) — Status: proposal, not built (the owner asked to see it first, 2026-10-24, item 17 of [the brief](../sessions/2026/10/20/session-e00f55c9/se…
- [The open-work line: every page says what is being worked on](/framework/core/Page/ai/doc/page-work-line.md) — What you see: under a page, one line, 2 open tasks on this page · 1 below. Click it for the task links. A page with no open work shows noth…
- [What a task cost — cost_usd](/framework/ai/AITask/doc/cost.md) — Every task card shows what the task cost, in dollars. Dollars and not tokens, because each model charges a different price per token, so a …
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Context: what an agent knows right now, what it costs, and …](/framework/ai/doc/context.md) — An agent only knows what is in its context window: the system prompt, every message so far, every file it read, every tool result. Nothing …
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…

## Sessions tagged with these words
- 2026/10/13 [Agent cost per-turn accumulation](/framework/ai/sessions/2026/10/13/session-e4cadfaa/) — kind/owner model/sonnet mod/ai/sessions task/mastermind-repo-slim cost/compact · $1.07
- 2026/10/13 [Worktree cleanup](/framework/ai/sessions/2026/10/13/session-5dd9cad2/) — kind/owner model/opus mod/server mod/ai/sessions mod/servex task/mastermind-repo-slim · $8.50
- 2026/10/13 [Repo size plan](/framework/ai/sessions/2026/10/13/session-3e95aafb/) — kind/owner model/opus mod/ai/doc mod/server mod/ai/sessions task/mastermind-repo-slim · $5.87
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- a7b6e0c0b Servex layers: a spawn held at the gate is queued, spawned once, and its words delivered on admitted

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: Session identity: every line, cost and task attributed to the right session, never twice, never lost

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session identity: every line, cost and task attributed to the right session, never twice, never lost"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
