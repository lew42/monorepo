<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Workflow  fix the four snags every agent hit today  you are a mastermind  on Sonnet  high effort " (words: workflow, fix, four, snag, every, agent, hit, today, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- 2026-10-09 [Agent rules: contradictions fixed, CLAUDE.md cut proposed](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/) — Agents carried rules that contradicted each other; 8 skills are fixed, and the owner's follow-ups are in the skills. load measured, contradictions found and fixed: [the page](/framework/ai/2026-10-09/system-architect/), [doc/findings.md](/framework/ai/2026-10…
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist
- 2026-09-24 [Every dashboard ask on one page, two layout breaks fixed](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-dashboard/) — Every dashboard ask you made this week is on one page, and the two layout breaks it found are fixed on AI 2. - The record: [What you asked of the AI dashboards](/framework/ai2/doc/owner-asks.md). It holds 92 asks from 17–24 Sep, word for word, grouped by topi… · paths 3/4 exist, gone: framework/ai2/overview/
- 2026-10-09 [core/Page: agents add tabs to any page live; docs cleaned](/framework/ai/sessions/2026/10/09/session-060cdfff/page-mastermind/) — Agents can now reshape any page live: add a tab, change its layout, all without a reload. a delta adds a tab and changes layout: [the tool page](/framework/core/Page/tool/) a session's page.jsonl renders live on its template: [demo shot](/framework/ai/2026-10… · paths 1/1 exist
- 2026-10-03 [Prompt hook: only your words get refined](/framework/ai/sessions/2026/10/04/prompt-relay-skip-agents/prompt-relay-skip-agents/) — A subagent's report is no longer logged as your prompt. The hook skipped nothing before, so four hand-backs in this tab were saved as your Prompts and refined at about $0.35 each, and your real prompt waited behind them. skip hand-backs and background notices… · paths 1/1 exist
- 2026-09-30 [Page audit: every layout in use, sorted by use](/framework/ai/sessions/2026/09/30/page-audit/page-audit/) — [Page layouts in use](/framework/core/Page/audit/): 1500 pages, 11 layouts, most-used first audit of every layout, with counts and where each lives: [table + pictures](/framework/core/Page/audit/) page priority: [main pages + layout](/framework/core/Page/audi… · paths 4/4 exist
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [controls.js — the four widgets everything draws](/framework/ext/layout/doc/controls.md) — words.js and body.js are both built from four functions in controls.js: pick (a segmented set, one pressed), menu (a <select> once a set is…
- [Layouts architecture — every layout is a class string on on…](/framework/styles/layouts/doc/architecture.md) — A layout is one whole-page arrangement, built from the utility words in framework.css. Each one is a Page made by demo.layout() ([ext/demo/…
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — > Old way (deprecated 2026-10-28): this page teaches or uses page.children; the replacement is page.pages (a List). Guide: [migration-child…
- [Style library — every token, ground, class and layout the C…](/framework/styles/readme.md) — What goes here: the vocabulary (tokens, the four grounds, .card, utilities, layouts, sections). Next door: how and where to write a rule → …
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [Layout architecture — a layout is a shape, never content](/framework/core/Layout/doc/architecture.md) — core/Layout is the catalogue of thirty page arrangements, each proven at seven widths. A Layout is a Page subclass (in [Layout.js](../Layou…
- [List architecture — every list announces its own changes, b…](/framework/core/List/doc/architecture.md) — List is the ordered collection behind an Item's children, for example item.items or page.pages. It is one class, [List.js](../List.js), tha…

## Sessions tagged with these words
- 2026/10/13 [ui/words module](/framework/ai/sessions/2026/10/13/session-f13e15f3/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/13 [am2-ui-card architecture](/framework/ai/sessions/2026/10/13/session-eb5f238c/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/architecture · $0.30
- 2026/10/13 [Architecture md 2](/framework/ai/sessions/2026/10/13/session-ddcc3e42/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/architecture · $0.27
- 2026/10/13 [ui/stats architecture](/framework/ai/sessions/2026/10/13/session-d1a02d27/) — kind/agent model/sonnet mod/ui/stats task/mastermind-repo-slim docs/architecture · $0.25
- 2026/10/13 [Architecture MD refinement](/framework/ai/sessions/2026/10/13/session-bf79c0c4/) — kind/agent model/sonnet mod/ext/research task/mastermind-repo-slim docs/architecture · $0.34
- 2026/10/13 [Layout architecture documentation](/framework/ai/sessions/2026/10/13/session-abc4b9cc/) — kind/agent model/haiku mod/core/layout task/mastermind-repo-slim docs/architecture · $0.19

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, landed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Workflow: fix the four snags every agent hit today (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Workflow: fix the four snags every agent hit today (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
