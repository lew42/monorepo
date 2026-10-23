<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Readmes page  Review" (words: readm, review)

## Tasks (8, best first)
- 2026-10-20 [Readmes page: Review](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/review/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/requirements.md
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-10-02 [Sessions tab: CSS-grid data grid, side peek, Panel2 preview levels](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-grid-v2/) — Sessions is now a real data grid. [/framework/ai/sessions/](/framework/ai/sessions/) — six columns (Start, Source, Name, Model, State, Cost), newest activity first. data grid of every session, six named columns — shot in task log no <table>, one --col-<name> … · paths 2/3 exist, gone: framework/ext/panel2/doc/preview-levels/
- 2026-10-01 [rule-readme-chain-google-gemini-3-1-pro-preview-low-1790831704432](/framework/ai/sessions/2026/10/01/openrouter-harness/openrouter-harness/rule-tests/runs/rule-readme-chain-google-gemini-3-1-pro-preview-low-1790831704432/) — (no outcome logged)
- 2026-09-30 [review-fix](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/review-fix/) — Fixed review.md items 1, 2 and 9 in the card system. (1) One shared BOXED_LEVELS=3 constant (card/depth.js) now drives both card/nesting/page.js and card/log/LogView.js, so the two nesting rules can no longer disagree; every doc that described the depth (card…
- 2026-09-30 [Review questions page fills the width as a masonry card wall](/framework/ai/sessions/2026/09/30/review/review/page-wide/) — Landed: the sections wall on [/framework/ai/review/](/framework/ai/review/) now takes the page's wide track and uses .masonry (framework.css, zero JS) instead of one narrow .flow column; each of the 9 systems is a framed card pad flow box with its h2 inside —… · paths 2/2 exist
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-28 [review-fixes](/framework/ai/sessions/2026/09/28/ce1cbe96-a28c-43d3-897e-4629ae753aeb/source-library/review-fixes/) — All 8 assigned review findings closed (1, 2, 3, 4, 6, 7, 9, 10); findings 5 and 8 left for the mastermind, as the brief said. - [/framework/sources/](/framework/sources/) — the library front page, fixed (finding 1: sources was never in page.js's children:, so… · paths 2/3 exist, gone: framework/ext/DesignTool/files/

## Docs and readmes
- [Dashboard — a grid of live previews, stalled first](/framework/ai/dashboard/readme.md) — The owner's own words: "/framework/ai's default tab could show a grid-like dashboard that includes the inbox, but also the log next to it, …
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Rules — the layout dos and don'ts, one page each, with live…](/framework/styles/rules/readme.md) — ## Use Each rule is a url — cite it in a review instead of quoting it: /framework/styles/rules/nesting/. Reading order: Cascade → Proportio…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [live](/live/) — the owner's live voice-work feed (lives at public/live/, not in this folder) - [core](./core/) — the seven clas…
- [Inbox — a rail of page previews beside the page you picked,…](/framework/ux/Inbox/readme.md) — See it: [the demo](/framework/ux/Inbox/) — click a row and its page opens on the right while the rail stays exactly where it is. The AI pag…
- [Models: which agent runs on what](/framework/ai/models/readme.md) — The table is drawn from now.json, which node Server/ModelsNow.mjs --write computes (roles.js, the live registry, the OpenRouter spend log, …

## Owner asks
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)

## Commits
- 0a7bf7b23 prompt-audit-system: land; sessions readme lists prompt-audit.jsonl and prompt-review.jsonl
- 533bbb1f1 prompt-audit-system: two-pass prompt audit (PromptAudit.mjs), pilot on 7efd07d5, audits map, Task usage lines
- b0c622d55 ai/usage: one name per limit, accurate caption, readme index entry (review notes 1,2,4)
- 2f5cf9706 live: archive page has its own empty line; comment and readme link fixes from the review
- 2e42e0f1b catalog readme: order, preview queue, NO_PREVIEW, next.md; Figma controls doc: one-open rule and in-panel scr…
- 61a0c9e02 architecture.md batch 4: leave page.js notes alone (page-change review gate); readmes link the docs
- 361d99d9d one-tree: drop 3 watcher listings that re-made ai/2026/ (review finding 1); Servex/cards/readme shows the sto…
- 277298143 skills review: proposals doc (CLAUDE.md, skills, tools), linked from ai/doc; census before/after and Haiku re…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 41,923 tokens of reading, under the 100k limit).

Question: Readmes page: Review

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Readmes page: Review"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
