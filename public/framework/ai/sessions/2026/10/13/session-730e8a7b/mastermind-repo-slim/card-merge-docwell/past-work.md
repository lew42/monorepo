<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Card merge 11  the doc well  the first shared module merge  every page it reaches shot before and after" (words: card, merge, doc, well, first, shared, module, every, reach, shot, before, after)

## Tasks (8, best first)
- 2026-10-13 [card-merge-docwell](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/card-merge-docwell/) — public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/card-merge-docwell/requirements.md
- 2026-10-12 [Sidebar search: ui/card was missing, now ranked first](/framework/ai/sessions/2026/10/12/session-65e9c7eb/sidebar-index/) — Sidebar search now finds every page, and "card" lists /framework/ui/card/ first. Root cause fixed: ux/Tree draws leaf: true pages flat, so 304 children of ui/, audit/, sandbox/ were never indexed. Proof: node Server/sidebar-index-check.mjs, 10+ missing before… · paths 1/1 exist
- 2026-10-02 [inspect(): class cards for every object, then the Dictate playground …](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/) — Both parts landed. every class gets an icon + a debug inspect() card: [Inspect.js](/framework/ux/Content/Object/Inspect.js), live on [ux/Content/Object](/framework/ux/Content/Object/) Dictate's data becomes real classes: [objects.js](/framework/ux/Dictate/pla… · paths 4/4 exist
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-10-01 [Card body shows the refined dictation (merge 5); ai2.css census for m…](/framework/ai/sessions/2026/09/30/inbox-ext/card-body/) — Merge 5 is built and proven: a card shows its own refined dictation, points first. Card.chat(line) draws summary/edit lines as the card's own points, clean folds underneath closed — 03db3de0 proof: a fixture card shot at 400/1920 on /framework/ai/ and /framew… · paths 3/3 exist
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-09-29 [Card-page phone load: before/after the page.jsonl fix](/framework/ai/sessions/2026/09/29/page-files-log/page-files-log/measure/) — Measured before/after; found a regression worth a look. [result.md](/framework/ai/2026-09-29/page-files-log/measure/result.md) has the full table. Probe built (pfl-measure.mjs, Playwright + CDP throttling) BEFORE on http://monorepo.localhost: Fast 3G never sh…

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/Shots](/framework/ext/Shots/) — used by 2 files
- [ui/card](/framework/ui/card/) — used by 23 files
- [ui/doc](/framework/ui/doc/) — used by 5 files, no readme

## Docs and readmes
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Tag notes: a tagged prompt reaches its module's page](/framework/ext/Refine/doc/tag-notes-2026-10-12.md) — The owner's ask (2026-10-12): when a refined prompt card is tagged with a module (ext/Refine, core/Page, ext/Figma), the item reaches that …
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [A class page is one card: core API first, own members, then…](/framework/ext/Doc/doc/class-card.md) — The API tab of a Doc whose subject is a class opens on a ClassCard (ClassCard.js, class ClassCard extends View, built by Doc.api_section). …
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Asks about cards: 2 open, 0 done](/framework/ai/cards/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [Server-side query: before and after (2026-10-12)](/framework/code/performance/doc/server-query.md) — The Sessions page can load from node, the default on the dev socket ([?source=files](/framework/ai/sessions/?source=files) forces the files…
- [Card inventory — what the site already had](/framework/core/Page/card/doc/inventory.md) — Eleven kinds of card-shaped thing, found before this system was built (nine from the original three surveys, plus two the 2026-09-29 audit …

## Sessions tagged with these words
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98

## Owner asks
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex-9, routed)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex (proposal-flow, 10 PM), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 13cf2b13d mastermind: 15:23 check-in; card-merge-docwell brief; crash at 15:12 noted
- 26144d4f4 records: three ui/*/doc/architecture.md that reached dev untracked after a merge by diff; the owner note card
- 2d87ec9cc mastermind repo-slim: four briefs from the reviews' next docs and the batches (inbox pinned card, flat Covera…
- e4c231ae2 records: live card writes in the old tree before the one-tree merge; one-store-apply task records (manifests,…
- 3485d0085 ai: merge AI 2 into AI (code to ai/cards + ai/rail, docs to ai/doc/ai2, shims at old paths)
- 4d2860a7a Servex/agents/Agents.js: checkpoint the uncommitted spend-gate draft, unblock merges
- a4ec765c0 ai2/needs-rule.js: add the missing reason_of() export — unblocks every merge
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Card merge 11, the doc well: the first shared-module merge, every page it reaches shot before and after

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Card merge 11, the doc well: the first shared-module merge, every page it reaches shot before and after"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
