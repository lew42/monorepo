<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Readmes page  Improve the plan" (words: readm, improve, plan)

## Tasks (8, best first)
- 2026-10-20 [Readmes page: Improve the plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/improve-plan/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/requirements.md
- 2026-08-31 [improve-feeds-vary](/framework/ai/sessions/2026/08/31/improve-feeds-vary/) — Two builds, both proven headless; the verdict audit came back clean. ![](shot.png) ### 1. feeds/live is actually live now It was a one-shot fetch() on a page named "Live." The rpc:append write-path candidate from the brief does not transplant here — this page…
- 2026-10-22 [readme-roles](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/) — Ready to merge, not merged: branch task/readme-roles (3 commits). - ✅ CLAUDE.md 3,763 → 1,319 words; framework rules are one line each in [the framework readme](/framework/readme.md), long form in [doc/rules.md](/framework/doc/rules.md) - ✅ Six role readmes: …
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-12 [core/Page: Page.class.js split plan](/framework/ai/sessions/2026/10/12/session-38388428/page-split-plan/) — Split plan written, no code moved. The file is 2,270 lines but only 1,027 are code: 926 (40%) are comments, and about 260 lines are four helper classes already living in it. measured by script: core/Page/doc/split-measure.mjs one-screen plan with class tree, … · paths 1/1 exist
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-06 [docs-after-size](/framework/ai/sessions/2026/09/06/docs-after-size/) — The docs now say what's true. Ten files rewritten to the landed size-standard names (--size 0.75/1/1.5, --pad/--gap/--flow from :where(*)): the six flagged by size-apply's landing (styles/readme.md, core/Layout/doc/rules.md, core/Page/readme.md, ext/tabs/doc/… · paths 2/2 exist

## Docs and readmes
- [Card plan — how 75 kinds of box shrink to 36](/framework/ux/Content/plan/readme.md) — The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popo…
- [The AI dashboard: plan, approved page, and what slice 1 shi…](/framework/ai/doc/ai-dashboard-plan.md) — Built (slice 1, 2026-10-19): /framework/ai/ is now the dashboard; its structure is in [AIDashboard/readme.md](../AIDashboard/readme.md). Th…
- [AIDashboard ai/AIDashboard/](/framework/ai/AIDashboard/readme.md) — The default page at /framework/ai/: one day's agent sessions, grouped by where they came from, nested by who spawned whom, each cost added …
- [AITask — the API (moved from the readme)](/framework/ai/AITask/doc/api.md) — <!-- moved verbatim from readme.md lines 4-72, 2026-10-12 readme audit --> js framework/ai/<date>/<slug>/page.js import { AITask, md } from…
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [ai — the page tabs, in full (moved from the readme)](/framework/ai/doc/readme-full-2026-10-12.md) — <!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit --> The page has three tabs: - Inbox (the default): a rail of what n…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [AI system docs: the index](/framework/ai/doc/readme.md) — One folder per subsystem, one current doc per topic. Load the folder you need; the rest costs nothing. Superseded files sit in [archive/](a…

## Owner asks
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 41,859 tokens of reading, under the 100k limit).

Question: Readmes page: Improve the plan

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Readmes page: Improve the plan"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
