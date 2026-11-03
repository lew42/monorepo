<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build  move_item  a task moves home with its id  history and a reference" (words: build, move, item, task, mov, home, history, reference)

## Tasks (8, best first)
- 2026-10-16 [Task migration: 211 old tasks moved to module homes](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) — 211 old tasks now live in their module's tasks/ folder; nothing deleted (2c8f4b674, 78bf8eb52) lose no data: each old file only gained one home line, proven by sha256 prefix; diff shows 211 added lines, 0 removed a task that clearly belongs to a module moves:…
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-16 [The item tool files the references: step 16 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/tool-files-refs/) — Landed on michael/dev as ee4c71f37 and 75cbc267e.
- 2026-10-16 [live-pointers: /live cards become pointers; their data moves to the l…](/framework/ai/sessions/2026/10/16/voice-20261016/live-pointers/) — The work landed as b9cf153f8 (its own log line says so; the landing line was never written because the agent was stopped): refine-build and overnight data in their task logs, ai/audits/index.jsonl + readme linked from ai/readme.md, transcripts line in past-wo…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 40 files
- [core/Task](/framework/core/Task/) — used by 516 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [Items hold items: references, moves, storage targets (the o…](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md) — Words: the VS Code tab's prompt log (ai/2026/10/20/session-e00f55c9/page.jsonl, 2026-10-21 just after midnight). Essence, with the owner's …
- [AITask — the API (moved from the readme)](/framework/ai/AITask/doc/api.md) — <!-- moved verbatim from readme.md lines 4-72, 2026-10-12 readme audit --> js framework/ai/<date>/<slug>/page.js import { AITask, md } from…
- [Module homes: which modules belong in ai/, and what moves n…](/framework/ai/doc/module-homes.md) — The rule. A module that exists only to run, show or feed an AI agent or model lives in framework/ai/. A module that AI uses but any page co…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [AITask — moved to [ai/AITask](../../ai/AITask/readme.md) on…](/framework/ext/AITask/readme.md) — It renders an agent task's log (one task, a day, the board), so it lives with the AI system now: the rule is at the top of [ai/readme.md](.…
- [AITask — design notes and removed comments](/framework/ai/AITask/doc/AITask-notes.md) — ## Class overview A task's record: its task.jsonl (or a legacy session.json) rendered as three tabs — Report (the answer first: outcome, li…
- [ai — the page tabs, in full (moved from the readme)](/framework/ai/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit --> The page has three tabs: - Inbox (the default): a rail of what n…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/13 [ui/item architecture](/framework/ai/sessions/2026/10/13/session-22769fe8/) — kind/owner model/haiku mod/ui/item task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)

## Commits
- 682df633c item-move: map + design (one move_item, history carried, as-id reference) and builder brief
- f250ef84c ext/files: strip ext/Panel, real expand/collapse tree, plain grip columns

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Build: move_item, a task moves home with its id, history and a reference

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build: move_item, a task moves home with its id, history and a reference"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
