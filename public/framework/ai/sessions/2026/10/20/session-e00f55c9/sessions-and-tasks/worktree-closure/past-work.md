<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Worktrees close with their task  nothing piles up on the disk" (words: worktre, close, their, task, noth, pil, disk)

## Tasks (8, best first)
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-19 [Owner's asks (from voice session v-g6wux1j, page /framework/ai/sessio…](/framework/ai/sessions/2026/10/19/spawned/task-mastermind-session-detail-page/) — (no outcome logged)
- 2026-10-17 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-16 [Task migration: 211 old tasks moved to module homes](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) — 211 old tasks now live in their module's tasks/ folder; nothing deleted (2c8f4b674, 78bf8eb52) lose no data: each old file only gained one home line, proven by sha256 prefix; diff shows 211 added lines, 0 removed a task that clearly belongs to a module moves:…
- 2026-10-16 [Servex checkup: nudge verified, skill tool and task.home built, dorma…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-servex/) — Compaction nudge verified on dev and logged needs_restart; helper-cost-fix stopped; expensive dormant agents left dormant with a read-don't-wake rule; skill tool and spawn task.home built; per-prompt door answered (ask_mastermind); coordination rule added to …
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-02 [Task-audit pilot: 4 judges catch the rm-rf failure by full agreement](/framework/ai/sessions/2026/10/03/task-audit/task-audit/) — 4 judges graded 5 landed tasks; consensus caught the known failure — GO. 5 tasks incl. ai2-inbox-read: #ai2-inbox-read #line-filter #local-ai #inspect #token-efficiency 3 cheap OpenRouter models + Sonnet reference scored each on complete/obedience/utility con…
- 2026-09-29 [Lifecycle: a reaper closes what finished tasks leave running](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/) — A reaper now closes what finished tasks leave running. Before → after: servers 20 → 7, run.js 13 → 6, node 45 → 26, idle agents 14 → 4. a creation log: lifecycle.jsonl, [doc](/Servex/doc/lifecycle.md) the study: [page](/framework/servex/lifecycle/): 29 tasks … · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Card types and the task lifecycle — the owner's vocabulary,…](/framework/ext/Refine/doc/card-types.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping thro…
- [Asks — what the owner asked for, and whether it happened](/framework/ai/AITask/doc/asks.md) — An ask is one thing the owner asked for, written down in their own words. It is a line in the running session's task.jsonl, using [ext/JSON…
- [What a task cost — cost_usd](/framework/ai/AITask/doc/cost.md) — Every task card shows what the task cost, in dollars. Dollars and not tokens, because each model charges a different price per token, so a …
- [The manifest](/framework/ai/AITask/doc/manifest.md) — task.jsonl ([ext/JSONL](/framework/ext/JSONL/)) is the current format; session.json still renders read-only, for tasks opened before the lo…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [Owner notes, 2026-10-17: routine procedures in the task sys…](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) — Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/re…
- [The owner on projects, completion and dated folders (2026-1…](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) — Notes for the next Task refactor, from a dictation to the VS Code mastermind. The whole dictation: [ai/doc/owner-2026-10-20-who-makes-tasks…
- [Task templates: the routine procedure is a field, and node …](/framework/core/Task/doc/templates.md) — What this is: a task says what kind of work it is (template: "code"), and node does the routine steps that kind of work always needs: the w…

## Sessions tagged with these words
- 2026/10/15 [Task closeout](/framework/ai/sessions/2026/10/15/session-65eaa74e/) — kind/owner model/sonnet mod/server task/task-closeout framework/inbox · $1.30
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26

## Owner asks
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; siblin… (servex-mastermind-opus (spawn after the 10 PM weekly reset), queued)
- 2026-09-30 Task pages: grey checkboxes, full-width bars, reports as free content (ui-system brief (after the System class), queued)

## Commits
- 1682a7a17 worktree-closure brief: worktrees close with their task, clear the 21 stuck, pool health
- 4dfc07189 process-monitor: stop idle worktree servers, per-role/per-request dormancy (asks 1, 2, 2b)
- 4500ebe8a lifecycle: creation log + reaper + keep list + pool salvage

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,996 tokens of reading, under the 100k limit).

Question: Worktrees close with their task: nothing piles up on the disk

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Worktrees close with their task: nothing piles up on the disk"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
