<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Marked lines  make every reader understand both spellings  then switch the writers  you are a mastermind  on Sonnet  medium effort " (words: marked, lin, every, reader, understand, both, spelling, then, switch, writer, you, mastermind, sonnet, medium, effort)

## Tasks (8, best first)
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-03 [AI cost on every page: a script, a reader, a header line](/framework/ai/sessions/2026/10/03/list-events/page-ai-cost/) — Server/page-ai-cost.mjs landed — splits each task's cost evenly across the pages it touched, writes it onto each page's own log (law 7: never recomputed). walks every task log, reuses cost_usd: [page-ai-cost.mjs](/framework/Server/page-ai-cost.mjs) a reader: … · paths 3/4 exist, gone: framework/Server/page-ai-cost.mjs
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-02 [inspect(): class cards for every object, then the Dictate playground …](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/) — Both parts landed. every class gets an icon + a debug inspect() card: [Inspect.js](/framework/ux/Content/Object/Inspect.js), live on [ux/Content/Object](/framework/ux/Content/Object/) Dictate's data becomes real classes: [objects.js](/framework/ux/Dictate/pla… · paths 4/4 exist
- 2026-09-30 [Layout map: every page-layout API, its DOM marker, and the AI 2 right…](/framework/ai/sessions/2026/09/30/page-audit/page-audit/layout-map/) — Mapped every page layout to its code in [layouts.md](./layouts.md) ([layouts.json](./layouts.json) has the raw data). Doc top-tabs: ext/Doc/Doc.js, 74 pages, tabs sit beside the title Columns: page.columns(), 42 pages Switcher (left nav): ext/tabs/switcher.js… · paths 1/1 exist
- 2026-09-30 [Page audit: every layout in use, sorted by use](/framework/ai/sessions/2026/09/30/page-audit/page-audit/) — [Page layouts in use](/framework/core/Page/audit/): 1500 pages, 11 layouts, most-used first audit of every layout, with counts and where each lives: [table + pictures](/framework/core/Page/audit/) page priority: [main pages + layout](/framework/core/Page/audi… · paths 4/4 exist
- 2026-09-29 [Layout explorer: three columns, every layout in one tree](/framework/ai/sessions/2026/09/29/c983f112-1358-4516-843d-4fc1f9814d6c/layout-explorer/) — [/layouts/explorer/](/layouts/explorer/) is live: siblings left, the chosen layout large in the centre, its variants right. [Walkthrough →](/framework/ai/2026-09-29/layout-explorer/walkthrough/) ![](/framework/ai/2026-09-29/layout-explorer/live-1920.png) left…
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files
- [ux/Understand](/framework/ux/Understand/) — used by 2 files

## Docs and readmes
- [One writer: every record line goes through one entry point](/framework/core/Item/doc/one-writer.md) — What it is. Every line written to a record file (session.jsonl, task.jsonl, page.jsonl, improvements.jsonl) goes through one function, reco…
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…
- [The open-work line: every page says what is being worked on](/framework/core/Page/ai/doc/page-work-line.md) — What you see: under a page, one line, 2 open tasks on this page · 1 below. Click it for the task links. A page with no open work shows noth…
- [Audit — every page layout in use, most-used first](/framework/core/Page/audit/readme.md) — Live: [/framework/core/Page/audit/](/framework/core/Page/audit/). Every page the site links to, crawled headless and given one layout by it…
- [When a line lands, and when you see it](/framework/core/Page/jsonl/doc/timing.md) — Two different clocks matter here: when a line is WRITTEN, and when a reader's browser actually SHOWS it. ## When a line is written - A file…
- [Who writes a line](/framework/core/Page/jsonl/doc/writers.md) — Seven things can add a line to a page.jsonl. None of them ever rewrite the file — every one of them only appends. | writer | what it append…
- [Decisions](/framework/core/Page/layout/switcher/doc/decisions.md) — ## Open - CSS namespace reservation, not yet written to css-scopes.txt. That file is outside this task's fence (core/Page/layout/switcher/ …
- [Layout — the hub for every layout question and every layout…](/framework/core/Page/layout/v2/readme.md) — The five shapes and the whole layout system are the icon sections above, each one a link. This file is what those widgets don't show: how t…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, landed)

## Commits
- e3a2b7b34 Recite: answer two more reviews on 649d1b4f7 — stuck-reply fix, a second owner line while paused, wait_at no …
- 2cd55cd0c line-format.md: every reader reads both spellings, how to switch Store.marked_lines on; line-readers.test run…
- 771c48495 line-readers.test: failing test, every reader of a saved line must understand the marked spelling (D13)
- 424ca8b32 Item.as_call: every argument list is saved so it replays to the same arguments ($args wrapper); bare and mark…
- 7217da3b5 chat round 3: two moving cursors replace the per-prompt stamp; fix the paragraph-gap renderer bug
- 8e20aacec Fix review findings: silence check without an agent, no reload churn
- 9d5d3c98e AI 2 Inbox: read/unread, archive, auto-resolve, search, Needs-you chip, Now wording
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Marked lines: make every reader understand both spellings, then switch the writers (you are a mastermind, on Sonnet, medium effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Marked lines: make every reader understand both spellings, then switch the writers (you are a mastermind, on Sonnet, medium effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
