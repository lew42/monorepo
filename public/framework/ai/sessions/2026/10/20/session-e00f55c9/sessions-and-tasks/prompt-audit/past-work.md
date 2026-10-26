<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Prompt audit  can Haiku turn each owner prompt into questions  tasks and statements without losing anything " (words: prompt, audit, can, haiku, turn, each, owner, into, question, task, statement, without, los, anyth)

## Tasks (8, best first)
- 2026-09-29 [Dictation to brief: refine.mjs, coverage audit, and an honest check o…](/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/) — Server/refine.mjs turns a dictation into clean, structured and brief rungs, traces every sentence you said, and repairs what it drops. It is on the card beside an audit of the VS Code tab. Over budget: $47 against $10. ![run C, ask 1 clicked: its source light… · paths 1/2 exist, gone: framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-08 [Task audit: every task categorised, every loose end has a fix and a v…](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/) — Audit landed: 1,303 tasks categorised, 244 open loose ends each with a suggested fix and a verdict. Loose ends listed with a fix per row: [by-system.md](/framework/ai/2026-10-08/task-audit/by-system.md), 54 now, 145 later, 43 superseded, 2 in-flight Prioritis…
- 2026-09-29 [ask-each: ask a model one question at a time](/framework/ai/sessions/2026/09/29/6ceb521e-fbb9-4e19-bff6-24009fe1cade/ask-each/) — Built Server/ask-each.mjs — the owner's idea from harness-research (ask a model one question at a time, in the same session, instead of dumping a whole list into one prompt). one agent session, context sent once, each question its own turn — Server/ask-each.m…
- 2026-09-24 [task-audit](/framework/ai/sessions/2026/09/24/loose-ends/task-audit/) — 176 of 184 tasks (09-17 to 09-24) audited, one Sonnet minion each: 134 done, 34 half-done, 8 superseded. [The ranked page and top-ten briefs](/framework/ai/2026-09-24/task-audit/) · [rows.json](/framework/ai/2026-09-24/task-audit/rows.json) Not covered (stood…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Refine audit, 2026-10-15: the owner's rules, the lost sente…](/framework/ext/Refine/doc/audit-2026-10-15.md) — Asked by the owner's voice session 6e9eb755 (brief: ai/sessions/2026/10/15/voice-20261015/refine-audit/requirements.md). Every claim was re…
- [Tag notes: a tagged prompt reaches its module's page](/framework/ext/Refine/doc/tag-notes-2026-10-12.md) — The owner's ask (2026-10-12): when a refined prompt card is tagged with a module (ext/Refine, core/Page, ext/Figma), the item reaches that …
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…
- [Content — cards that remember: Question, Decision, Quotatio…](/framework/ux/Content/readme.md) — Each one is a ux/ class that reads one .jsonl log and appends to it. The data shapes come first; the look is a template on top. ## Index [D…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…

## Sessions tagged with these words
- 2026/10/15 [Past-work audits](/framework/ai/sessions/2026/10/15/session-c19535e4/) — kind/owner model/haiku mod/ai/sessions task/past-work-audits framework/ai · $0.26
- 2026/10/15 [Past-work audit](/framework/ai/sessions/2026/10/15/session-403faf1c/) — kind/owner model/haiku mod/ai/sessions task/past-work-audit framework/ai · $0.32
- 2026/10/16 [Past-work pilot classifier](/framework/ai/sessions/2026/10/16/session-289010e0/) — kind/owner model/haiku work/read-only task/past-work · $1.86
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [Debug views requirements](/framework/ai/sessions/2026/10/15/session-baaf8f25/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.26
- 2026/10/15 [Sessions data investigation](/framework/ai/sessions/2026/10/15/session-b19f18df/) — kind/owner model/haiku mod/ai/sessions task/sessions-data · $0.31

## Owner asks
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-13 Prompts: each owner prompt becomes a refined Inbox card (?, dropped)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)

## Commits
- c8d9c59aa mastermind-cheap-models: spawn-decision log, 5-question Haiku proving ground, pace calibration, ask-audit ext…
- a2bb2fa72 token-accounting: post-analysis over real history + cheap-first-opinion tradeoff, measured

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,626 tokens of reading, under the 100k limit).

Question: Prompt audit: can Haiku turn each owner prompt into questions, tasks and statements without losing anything?

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Prompt audit: can Haiku turn each owner prompt into questions, tasks and statements without losing anything?"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
