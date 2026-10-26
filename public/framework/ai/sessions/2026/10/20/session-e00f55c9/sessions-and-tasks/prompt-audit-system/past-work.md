<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The prompt audit as a system  Haiku structures each owner prompt  a Sonnet reviewer finds each session s loose ends" (words: prompt, audit, system, haiku, structur, each, owner, sonnet, reviewer, find, session, loose, end)

## Tasks (8, best first)
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-08 [Task audit: every task categorised, every loose end has a fix and a v…](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/) — Audit landed: 1,303 tasks categorised, 244 open loose ends each with a suggested fix and a verdict. Loose ends listed with a fix per row: [by-system.md](/framework/ai/2026-10-08/task-audit/by-system.md), 54 now, 145 later, 43 superseded, 2 in-flight Prioritis…
- 2026-09-29 [Loose-ends audit: 6 dispatch rows never launched, 12 system tasks unl…](/framework/ai/sessions/2026/09/29/servex-mastermind/audit/loose-ends/) — Landed — read-only audit of every task.jsonl from 2026-09-22 to 09-29 (138 tasks). table of unlanded/never-launched system work, sorted by value lost: [report.md](/framework/ai/2026-09-29/servex-mastermind/audit/loose-ends/report.md) dispatch.md rows checked …
- 2026-09-21 [mastermind-sonnet-run](/framework/ai/sessions/2026/09/19/mastermind-sonnet-run/) — Stood down by the owner after they committed the repo (3e9536d4, working tree clean). That was item 1 on their list for two days and it unblocks the worktree workflow they asked for this morning. Eight tasks landed today: ai-front (stopped mid-flight, its wor… · paths 2/2 exist
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-10 [Refine: prompts stored in the session log](/framework/ai/sessions/2026/10/09/session-48083d9d/refine-session-log/) — Each Refine prompt is now kept in its session's own log, in stages. [Session log doc](/framework/ext/Refine/md/doc/session-log-2026-10-10/) raw (immutable), then clean (final, numbered), then refined (cards citing indexes): proven with real model calls, 4 lin… · paths 1/2 exist, gone: framework/ext/Refine/md/doc/session-log-2026-10-10/

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 12 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/Session](/framework/ext/Session/) — used by 9 files
- [ext/System](/framework/ext/System/) — used by 8 files

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Page system: the owner's asks, merged (2026-10-12)](/framework/core/Page/doc/asks.md) — The owner's own prompts that touch the page system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Ope…
- [AI system: the owner's asks, merged (2026-10-12)](/framework/ai/doc/asks.md) — The owner's own prompts that touch the ai system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Open …
- [Session accounting: what was decided, and where each ask st…](/framework/ai/AISession/doc/accounting-decision.md) — Decision (2026-10-16 18:53, voice-app, owner delegated): the one-folder shape.md is not built as its own project. The task system (Task ext…
- [Finding past work before building (owner asks 1 to 3, 2026-…](/framework/ai/doc/owner-2026-10-17-finding-past-work.md) — What the owner asked, in plain words: work already done must be findable; the old prompts hold many asks that were never done; and before a…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [Tag notes: a tagged prompt reaches its module's page](/framework/ext/Refine/doc/tag-notes-2026-10-12.md) — The owner's ask (2026-10-12): when a refined prompt card is tagged with a module (ext/Refine, core/Page, ext/Figma), the item reaches that …
- [AI folder audit: what each entry in ai/ is](/framework/ai/doc/ai-folder-audit.md) — Every entry directly under public/framework/ai/, most important first. Each row says what it is, who writes it, who reads it, and what to d…

## Sessions tagged with these words
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/15 [Past-work audits](/framework/ai/sessions/2026/10/15/session-c19535e4/) — kind/owner model/haiku mod/ai/sessions task/past-work-audits framework/ai · $0.26
- 2026/10/15 [Debug views requirements](/framework/ai/sessions/2026/10/15/session-baaf8f25/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.26
- 2026/10/15 [Requirements trace](/framework/ai/sessions/2026/10/15/session-a9d9dc53/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.31
- 2026/10/15 [Voice minion skill execution](/framework/ai/sessions/2026/10/15/session-493b3602/) — kind/owner model/sonnet mod/ai/sessions task/page-system · $0.46

## Owner asks
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-10-13 Prompts: each owner prompt becomes a refined Inbox card (?, dropped)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-18 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (?, tracked)

## Commits
- aeffb6a18 prompt-audit-system brief: Haiku structure pass per owner prompt, Sonnet session reviewer, separate audit fil…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,626 tokens of reading, under the 100k limit).

Question: The prompt audit as a system: Haiku structures each owner prompt, a Sonnet reviewer finds each session's loose ends

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The prompt audit as a system: Haiku structures each owner prompt, a Sonnet reviewer finds each session's loose ends"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
