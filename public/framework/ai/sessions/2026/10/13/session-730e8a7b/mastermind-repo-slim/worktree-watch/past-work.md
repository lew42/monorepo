<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "A page watcher per worktree  when a page an agent is editing breaks  its mastermind hears within a minute  with the four width shots" (words: watcher, per, worktree, when, agent, edit, break, mastermind, hear, within, minute, four, width, shot)

## Tasks (8, best first)
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-09-29 [Module experts: a ready Page expert, measured four ways](/framework/ai/sessions/2026/09/29/dd9065c6-974a-48d3-92e4-4706532c807f/module-experts/) — A Page expert is live: ask_expert core/Page answers in about 3 s for 3 cents, scored 2.6 of 3. It is a saved session that has read the Page module, and each question gets a copy of it. | way | first answer | per question | score /3 | |---|---|---|---| | copy … · paths 3/3 exist
- 2026-09-23 [mastermind-servex](/framework/ai/sessions/2026/09/22/e2b82220-72fd-4fec-b8a6-5f985c9cbefa/mastermind-servex/) — Servex Mastermind — port Servex into the monorepo as the always-on agent host (Agent SDK sessions, single-writer JSONL, /mcp over HTTP), plus an Opus review of the last three days to clean up and make presentable. Full brief in requirements.md. · paths 1/1 exist
- 2026-10-09 [core/Page: agents add tabs to any page live; docs cleaned](/framework/ai/sessions/2026/10/09/session-060cdfff/page-mastermind/) — Agents can now reshape any page live: add a tab, change its layout, all without a reload. a delta adds a tab and changes layout: [the tool page](/framework/core/Page/tool/) a session's page.jsonl renders live on its template: [demo shot](/framework/ai/2026-10… · paths 1/1 exist
- 2026-10-01 [Process monitor: free RAM when it runs low](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/process-monitor/) — RAM squeeze merged (43ca0e5b); needs a Servex restart ![](idle/live-1920-processes.png) idle worktrees' server, watcher and Chromium stopped: 30 tests dormant in 30 s under 6 GB free: 78 tests dormant_after per agent and request; voice pair warm; resume 0.15 … · paths 1/1 exist
- 2026-09-29 [Screenshots: AI 2 cards at phone width](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/card-mobile/) — Two phone-width screenshots ([card](/framework/ai/2026-09-29/card-mobile/card-experiment-400.png), [inbox](/framework/ai/2026-09-29/card-mobile/inbox-400.png)): Folder twice, the title under Actions, and a card chat competing with the ✦ AI. The fixes were bui…
- 2026-09-28 [servex-mastermind](/framework/ai/sessions/2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/) — The Servex mastermind oversaw the system for a day and fixed the rules behind the failures it saw. - layout-check now runs on every landing and caught a real 84%-empty page. - The layout skill was skipped in 40 tasks; its two key rules moved into the minion s…
- 2026-09-25 [servex-mastermind-2](/framework/ai/sessions/2026/09/24/servex-mastermind-2/) — The Servex Mastermind's first day (2026-09-24) is closed. Stopped; a message wakes it. [Six problems it found](/framework/ai/2026-09-24/servex-mastermind/) and the [permissions alert](/framework/ai/2026-09-24/servex-mastermind/ALERT-resume-permissions.md) are…

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [ext/editor](/framework/ext/editor/) — used by 5 files
- [ext/Shots](/framework/ext/Shots/) — used by 2 files

## Docs and readmes
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [Manager / mastermind, per page](/framework/core/Page/ai/doc/manager.md) — [Servex](/framework/servex/doc/roles/) keeps a second, bigger agent on every card: the manager (an Opus session, Servex/agents/Layers.js, r…
- [editor architecture — one document, whole-snapshot undo, an…](/framework/ext/editor/doc/architecture.md) — The editor is a page you visit, not a module you import. Its main class is History ([History.js](../History.js)) for undo; the widget and i…
- [Measured — eight layouts, four widths](/framework/styles/layouts/wire/doc/measured.md) — Headless Chromium, one page per layout at its bare /full/ url — no stage, no zoom, a real viewport. 400 / 1280 / 1920 / 3440. The owner's q…
- [AI v2 — one dense, full-width board, written to live; a sec…](/framework/ai/v/2/readme.md) — ## Use page.js (about 300 lines) + v2.css — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE…
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [When a line lands, and when you see it](/framework/core/Page/jsonl/doc/timing.md) — Two different clocks matter here: when a line is WRITTEN, and when a reader's browser actually SHOWS it. ## When a line is written - A file…
- [Navigation: one model — four questions about the site's nav…](/framework/core/Page/navigation/model/readme.md) — [Live page](/framework/core/Page/navigation/model/). The owner asked four questions on 2026-10-14 ([the dictation](/framework/ai/sessions/2…

## Sessions tagged with these words
- 2026/10/13 [Architecture.md editor module](/framework/ai/sessions/2026/10/13/session-826a7569/) — kind/agent model/haiku mod/ext/editor task/mastermind-repo-slim docs/architecture · $0.24
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [Voice-connector review](/framework/ai/sessions/2026/10/14/session-e5bbf063/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.62
- 2026/10/14 [Tasks dashboard review](/framework/ai/sessions/2026/10/14/session-e1115e59/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/tasks · $0.76

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (mastermind-servex (10 PM, first in the task), queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)

## Commits
- 4dfc07189 process-monitor: stop idle worktree servers, per-role/per-request dormancy (asks 1, 2, 2b)
- 4500ebe8a lifecycle: creation log + reaper + keep list + pool salvage

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: A page watcher per worktree: when a page an agent is editing breaks, its mastermind hears within a minute, with the four-width shots

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "A page watcher per worktree: when a page an agent is editing breaks, its mastermind hears within a minute, with the four-width shots"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
