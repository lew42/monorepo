<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The one AI dashboard  the Inbox list reads the one state and gets the filter chips" (words: one, dashboard, inbox, list, read, state, get, filter, chip)

## Tasks (8, best first)
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-14 [Refined asks: records, module lists, inboxes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-topic-index/) — Refined asks are now records. 1080 recorded, 19 crossed off, 612 sent to their module's inbox, 449 stay open (site-wide or no module folder). - One record per ask, in the session's own asks.jsonl: [how it works](/framework/ext/Refine/doc/asks.md) - Topic list…
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [Inbox: one record per thing, and the inbox as a timeline of big things](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-data/) — [The inbox timeline](/framework/core/Page/ext/Inbox/timeline/) is live: 1,096 things built and 70 for you, newest and most urgent first, each opening beside the rail with its card's chat. ![detail with chat](shots/localhost-61253-framework-core-Page-ext-Inbox… · paths 1/1 exist
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [Inbox: blocking/review/fyi chips](/framework/ai/sessions/2026/10/12/session-0eaa4f07/inbox-asks/) — Built the plain blocking / review / fyi chips in the Inbox. three chips beside "Needs you": Rail.category_chips() in core/Page/ext/Inbox/Rail.js, url ?cat= bands by score: blocking 97+, review 90-96, fyi under 90 (fyi bypasses the floor) shot at 1200, 1920, 3…

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [ux/Filter](/framework/ux/Filter/) — used by 3 files
- [ux/Inbox](/framework/ux/Inbox/) — used by 13 files

## Docs and readmes
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/readme.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [lists — six ways to show one group → member → detail list, …](/framework/styles/system/studies/lists/readme.md) — The study page is [/framework/styles/system/studies/lists/](/framework/styles/system/studies/lists/): six 24rem columns — Rows, Title bar, …
- [Hotkeys — one flat list of every hotkey in the app, filtera…](/framework/ux/Hotkeys/readme.md) — [See it live](/framework/ux/Hotkeys/) — the rows below are the real settings UI, not a picture of it. A hotkey is either a keyboard key or …
- [AI v2 — one dense, full-width board, written to live; a sec…](/framework/ai/v/2/readme.md) — ## Use page.js (about 300 lines) + v2.css — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE…
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Switcher — one list-switches-content pattern, three skins](/framework/core/Page/layout/switcher/readme.md) — Vertical tabs, a file tree beside its code, and a plain left nav all do the same job: a list on the left, or above on a phone, routes the c…
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — ## Index - [App](./App/) — boot and the one container pages mount into; you construct it once in /app.js - [Item](./Item/) — one node of a …

## Sessions tagged with these words
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-c56372f0/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.15
- 2026/10/14 [Clarity inbox browse](/framework/ai/sessions/2026/10/14/session-34bdec7a/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.14
- 2026/10/13 [Inbox ranking clarity](/framework/ai/sessions/2026/10/13/session-2095a243/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.14
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)

## Commits
- f5103369f panel2-sessions Part 2: AI dashboard Sessions + Dashboard tabs
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- 410077363 panel2-sessions Part 1: ext/panel2 (new standard UI chrome) + Inbox restructure

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,827 tokens of reading, under the 100k limit).

Question: The one AI dashboard: the Inbox list reads the one state and gets the filter chips

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The one AI dashboard: the Inbox list reads the one state and gets the filter chips"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
