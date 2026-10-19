<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The Markdown Explorer   module md  shows the readme in the middle and every markdown file of the module beside it  and modules with docs get an  md  tab" (words: markdown, explorer, module, show, readme, middle, every, file, beside, modul, doc, get, tab)

## Tasks (8, best first)
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-03 [core/System: the module itself — readme, page.js, doc/system.md](/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/) — core/System/ is now a real module, not just a class file: readme.md, page.js (a Doc documenting the System class — five live Concepts tiles linking Design/Code/UI/UX/AI, then the minimal page.js example), and doc/system.md (what a System is, the two ways to a… · paths 1/2 exist, gone: framework/core/System/
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-13 [architecture.md: batch 5, 12 more modules](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/architecture-md-5/) — 12 more modules now have doc/architecture.md (54 to 66 of 113). Reviewed: light, 3 fixed, 2 noted ([review.md](review.md)). next 12 by importers, none edited in the last hour: Mention, panel, System, table, timeline, toolbar, Section, catalog, accordion, toc,…
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-09-29 [servex-docs-tab](/framework/ai/sessions/2026/09/29/6ba7761f-91ad-4c62-a59e-9f66a03a6138/servex-docs-tab/) — Servex dashboard has a Docs tab — lists every Servex/ and Server/ module with a readme.md, renders its readme + doc/*.md + demo.js (as read-only source), each module its own /docs/<path>/ URL. Two Sonnet minions (backend routes in Servex/pages.js + Servex.js,…
- 2026-09-29 [Module experts: a ready Page expert, measured four ways](/framework/ai/sessions/2026/09/29/dd9065c6-974a-48d3-92e4-4706532c807f/module-experts/) — A Page expert is live: ask_expert core/Page answers in about 3 s for 3 cents, scored 2.6 of 3. It is a saved session that has read the Page module, and each question gets a copy of it. | way | first answer | per question | score /3 | |---|---|---|---| | copy … · paths 3/3 exist
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/files](/framework/ext/files/) — used by 23 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files

## Docs and readmes
- [Doc — a module documented as a page (Overview · API · Docs …](/framework/ext/Doc/readme.md) — ## Index [overview](./overview/) — the urls the Overview tab uses ## Use js export default new Doc({ meta: import.meta, title: "View", subj…
- [Every page has an md/ — its markdown files, as pages](/framework/core/Page/doc/markdown.md) — Add md/ to any page's url and you get that folder's markdown, rendered. Nothing to write: it is built into Page, so every module has it. | …
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — Doc turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [Doc.js](../Doc.js), that …
- [about — prose beside the source](/framework/ext/files/doc/about.md) — Added 2026-08-15 so a module's docs and its code can share one screen: ext/Doc's Files tab passes about: path => md.file(this.meta, "doc/fi…
- [Markdown — md() for prose and md.file() for a whole .md, as…](/framework/ext/markdown/readme.md) — ## Index [open](./open/) — the same markdown link opened three ways, to show the page decides where a link opens ## Use js import { md } fr…
- [ai — the page tabs, in full (moved from the readme)](/framework/ai/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit --> The page has three tabs: - Inbox (the default): a rail of what n…
- [ext/files](/framework/audit/doc/ext-files.md) — files() is a small, well-scoped file browser — a tree of real, fetched files and the one you clicked — and it earns its place doubly now: i…

## Sessions tagged with these words
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15
- 2026/10/15 [Page owner docs claims](/framework/ai/sessions/2026/10/15/session-57f46c1a/) — kind/owner model/sonnet task/page-system docs/readme · $0.86
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/14 [Scripts rename](/framework/ai/sessions/2026/10/14/session-6a78c3cb/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.90
- 2026/10/14 [Unreferenced census fix](/framework/ai/sessions/2026/10/14/session-009d74f3/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/readme · $0.14
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21

## Owner asks
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- ad417e411 Add <any path>/fs/, the full-screen file view

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: The Markdown Explorer: `<module>/md/` shows the readme in the middle and every markdown file of the module beside it, and modules with docs get an `md` tab

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The Markdown Explorer: `<module>/md/` shows the readme in the middle and every markdown file of the module beside it, and modules with docs get an `md` tab"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
