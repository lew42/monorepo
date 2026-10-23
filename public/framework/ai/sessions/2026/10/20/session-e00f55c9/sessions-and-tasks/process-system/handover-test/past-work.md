<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Prove two flows end to end with tests  handover by task  and one simple process" (words: prove, two, flow, end, test, handover, task, one, simple, proces)

## Tasks (8, best first)
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-07 [Docs-vs-code audit: two stale MCP tool-count claims, one found-and-fl…](/framework/ai/sessions/2026/10/08/docs-vs-code-audit/docs-vs-code-audit/) — What landed: checked 12 concrete claims from doc/systems-overview.md, doc/autonomy.md, todo.md and asks.jsonl against the live Servex + site MCP tool catalogs and the agent lifecycle code (Agents.js, tools.js). 9 held up exactly: dormant-agent lifecycle, the …
- 2026-10-02 [core/Page/ext/Inbox: one class Inbox, two statics Rail + Compact](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1b-inbox-restructure/) — One class Inbox, two lazy views — inbox.rail and inbox.compact. Inbox.Rail = today's InboxRail (moved, unedited, into Rail.js's renamed Rail class, assigned as a static) — [Inbox.js](/framework/core/Page/ext/Inbox/Inbox.js) Inbox.Compact = new class merging D… · paths 6/6 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 516 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [core/Test](/framework/core/Test/) — used by 0 files
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Process names and structure: a proposal for you to approve](/framework/core/Task/doc/process-names.md) — You asked to be in the loop on names before they harden (2026-10-22). This page lists each name, what it means, and where it lives. Each ro…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Task resolution: what becomes a task, and how every task en…](/framework/core/Task/doc/resolution.md) — Today a task ends only if the agent remembers to end it. This page is the model that makes it end on purpose: few tasks, each linked to the…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…
- [Process — a task whose children are named phases, and node …](/framework/core/Task/doc/process.md) — The name's scope: here a process is a *way of working* (a Task subclass). Not Servex/Process.js (one supervised child program, such as a de…
- [Refine redesign: one compact page, raw then clean then refi…](/framework/ext/Refine/doc/redesign.md) — Built 2026-10-16 ([task](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/)): steps 1, 2 and 4 below, plus the per-sentence fl…

## Sessions tagged with these words
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [Handover query planning](/framework/ai/sessions/2026/10/15/session-83edac7a/) — kind/owner model/sonnet task/handover-query framework/digest · $2.11
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/13 [Store framework refactor](/framework/ai/sessions/2026/10/13/session-9248043b/) — kind/owner model/opus mod/ai/sessions mod/server mod/.claude/hooks/append task/mastermind-repo-slim · $19.39
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, landed)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)

## Commits
- 9c55a38c8 Add ux/Understand and ux/Rename: HITL clarification marks and rename-by-dropdown
- b0877e14b Rail tree skips nav:false children; Doc top bar wraps instead of clipping

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Prove two flows end to end with tests: handover by task, and one simple process

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Prove two flows end to end with tests: handover by task, and one simple process"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
