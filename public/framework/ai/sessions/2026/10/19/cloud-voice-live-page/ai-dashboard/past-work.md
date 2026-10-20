<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "New  framework ai  page  sessions by origin  nested by parent  compact  mobile first   plan first" (words: framework, session, origin, nested, parent, compact, mobile, first, plan)

## Tasks (8, best first)
- 2026-10-19 [New /framework/ai/ page: sessions by origin, nested by parent, compac…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/ai-dashboard/) — (no outcome logged)
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [Sessions page: compact header, scope filters, left rail](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sessions-page-layout/) — Sessions page layout landed. first row higher: y 464 → 270–370 at 1200, shot shots/sessions/1200.png footer a status line: ~125 px → ~50 px, same shot left padding + inbox link: gutter matched, link gone year/month/day scope, month default, newest first: ?sco…
- 2026-10-13 [voice sessions: first reply in about 2 s](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/first-reply/) — Committed a0d113505 on michael/dev: the 8 s fast-reply hold is now 1.5 s and the fast agent pre-warms when the drawer opens. First reply 8.1 s to 1.6-2.8 s (4.7 s once cold); floor ~1.2 s. Takes effect at the next Servex restart. Whisper and browser draw not …
- 2026-10-13 [Repo size: measured, screenshots ignored, a three-phase plan](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/repo-size-plan/) — Screenshots are 84% of git history (397 of 474 MB); the session logs are not the problem. [The plan](/framework/ai/doc/repo-size.md) measure by script: node Server/repo-size.mjs. .git 762 MB, GitHub 305 MB, next push ~160 MB, deploy 19,619 of 20,000 files wha…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 9 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Page.class.js split plan (COMPLETE 2026-10-12: 2270 → 849 l…](/framework/core/Page/doc/split-plan.md) — Answer to "is 2,000 lines a mistake?" Half of it is comments. Page.class.js is 2,270 lines: 1,027 code, 926 comment (40%), 317 blank, 150 m…
- [Nested tasks — subtasks, in parallel or in series](/framework/ai/AITask/doc/nested.md) — A task can have subtasks, to any depth. Some run at the same time (parallel), and some wait for others to finish first (series). The [task …
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [Sessions vs docs — what goes where (the owner, 2026-10-19)](/framework/ai/doc/sessions-vs-docs.md) — Two places, two jobs. Putting a thing in the wrong one is how work gets lost. ## The session folder — log level, may be purged public/frame…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Card plan — how 75 kinds of box shrink to 36](/framework/ux/Content/plan/readme.md) — The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popo…
- [Session accounting: what was decided, and where each ask st…](/framework/ai/AISession/doc/accounting-decision.md) — Decision (2026-10-16 18:53, voice-app, owner delegated): the one-folder shape.md is not built as its own project. The task system (Task ext…

## Sessions tagged with these words
- 2026/10/19 [Ultracode](/framework/ai/sessions/2026/10/19/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/15 [Past-work audits](/framework/ai/sessions/2026/10/15/session-c19535e4/) — kind/owner model/haiku mod/ai/sessions task/past-work-audits framework/ai · $0.26
- 2026/10/15 [Voice component refine and audit](/framework/ai/sessions/2026/10/15/session-9afd8738/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.88

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- c0faf8b1c Dictate playground: real classes + live Structure panel + full-bleed

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,127 tokens of reading, under the 100k limit).

Question: New /framework/ai/ page: sessions by origin, nested by parent, compact, mobile first — plan first

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "New /framework/ai/ page: sessions by origin, nested by parent, compact, mobile first — plan first"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
