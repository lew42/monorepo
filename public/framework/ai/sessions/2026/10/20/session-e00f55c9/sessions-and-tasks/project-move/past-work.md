<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Projects  a project folder  and one tool that moves it into its module and re indexes" (words: project, folder, one, tool, mov, into, module, index)

## Tasks (8, best first)
- 2026-10-20 [Projects: a project folder, and one tool that moves it into its modul…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/project-move/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/project-move/requirements.md
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-17 [Undone asks: computed page by module](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-asks/) — Page /framework/ai/asks/undone/ and script node Server/UndoneAsks.mjs (--json writes ai/asks/undone.json) merged into michael/dev at 714d53e19. 1,150 asks counted = 65 done + 620 undone + 465 unroutable, and the two numbers agree; 620 is an upper bound (2 of … · paths 1/1 exist
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-17 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-16 [Task migration: 211 old tasks moved to module homes](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) — 211 old tasks now live in their module's tasks/ folder; nothing deleted (2c8f4b674, 78bf8eb52) lose no data: each old file only gained one home line, proven by sha256 prefix; diff shows 211 added lines, 0 removed a task that clearly belongs to a module moves:…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge

## Modules that exist now (files outside the module that import it)
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ui/toolbar](/framework/ui/toolbar/) — used by 9 files
- [ui/tooltip](/framework/ui/tooltip/) — used by 6 files

## Docs and readmes
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Refined asks: one record per ask, a topic list per module, …](/framework/ext/Refine/doc/asks.md) — Code: class AskIndex in [Server/AskIndex.mjs](/Server/AskIndex.mjs), called by RefineQueue.one() after each prompt is refined. The owner's …
- [Module homes: which modules belong in ai/, and what moves n…](/framework/ai/doc/module-homes.md) — The rule. A module that exists only to run, show or feed an AI agent or model lives in framework/ai/. A module that AI uses but any page co…
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [The page API for AIs: two tools, one model](/framework/core/Page/doc/ai-api.md) — An agent changes a page with one tool, page_set, and looks at it with one tool, page_read. Everything else is a delta: a small JSON object …
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [diff — options, masking, measures, self-test (moved from th…](/framework/ext/DesignTool/diff/doc/options-and-selftest.md) — <!-- moved verbatim from readme.md lines 53-102, 2026-10-12 readme audit --> ## The default 40 One of each *kind* of page, not a random sam…
- [JSONL architecture — one verb per line, replayed into objec…](/framework/ext/JSONL/doc/architecture.md) — JSONL is an append-only log, one JSON object per line, replayed into a plain object. TaskJSONL is its subclass for the task manifest (ai/<d…

## Sessions tagged with these words
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-81909a47/) — kind/owner model/sonnet task/remote-full-registry servex/remote-tools · $1.11
- 2026/10/15 [Clarity remote tools](/framework/ai/sessions/2026/10/15/session-6c354292/) — kind/agent model/sonnet work/read-only task/remote-tools framework/digest · $0.15
- 2026/10/15 [Remote tools requirements](/framework/ai/sessions/2026/10/15/session-3232cd48/) — kind/owner model/sonnet mod/servex task/remote-tools servex/remote-tools · $0.66

## Owner asks
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Templates: weight per use, use-template skill/tool, one library (mastermind-servex-9, routed)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, landed)
- 2026-09-30 Templates: weight per use, use-template skill/tool, one library (mastermind-servex (proposal-flow, 10 PM), queued)

## Commits
- 69579567d owner 2026-10-20: projects per module, complete()/completion, dated folders as one system, every session has …
- 59c7752b4 archive-phase-2: Aug + Sep session pictures move to E:/Projects/lew42/archive/sessions/2026/ (4,982 files, 57…
- ea4a7e6dd token-accounting: fix find_transcript() case-sensitivity (undercounted 144/145 project folders); investigate …
- b6a4012b2 Sessions doc: note AILogs.js shares the one-project cwd limitation
- 6853e14a0 one-dictation review fixes #8 and #9

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: Projects: a project folder, and one tool that moves it into its module and re-indexes

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Projects: a project folder, and one tool that moves it into its module and re-indexes"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
