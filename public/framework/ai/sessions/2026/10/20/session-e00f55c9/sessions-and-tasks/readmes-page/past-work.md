<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Readmes page  fix its route  give a chosen folder a URL  re review" (words: readm, fix, route, give, chosen, folder, url, review)

## Tasks (8, best first)
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-13 [Skills: 19% fewer words, 5 conflicts fixed](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/) — Skills review: 34,140 → 27,522 words (−19%), 5 conflicts fixed, the rest proposed. [Proposals](/framework/ai/doc/skills-proposals-2026-10-13.md) · [census before](census-before.md) · [census after](census-after.md) measure by script: Server/SkillCensus.mjs, 3…
- 2026-10-12 [Today's UI: shot, read, two narrow-screen fixes](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/) — Shot 10 of today's pages at 400/1200/1920/3440 and fixed two defects. [Report](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/report.md) DataGrid demo overlap at 400: fixed (916492fc2), re-shot Refine 'Said' label squeeze at 400: fixed …
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-03 [AI inbox: page_set data corruption, the your-prompts 404, Activity-ta…](/framework/ai/sessions/2026/10/03/71eead80-a869-421f-83bb-eba7ff83510e/inbox-cards-work/) — Ten fixes landed on michael/dev. The data-corrupting page_set(id) bug, the your-prompts 404, the Activity tab breaking rail navigation, noisy card previews, jargon titles, a Mention path-link bug, and double-spaced code blocks. Three more caught live: card rh… · paths 0/1 exist, gone: framework/ai/your-prompts/
- 2026-10-03 [Router: fixed the flash — awaited styles before the chain's own impor…](/framework/ai/sessions/2026/10/03/list-events/flash-fix/) — Found and fixed the flash of unstyled content on AI page reloads. Cause: the card-class dynamic import — Router.load() awaited styles before the chain's own imports registered them. [Full chase and what was ruled out](cause.md). Fix: one await swap in Router.… · paths 2/2 exist
- 2026-09-30 [review-fix](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/review-fix/) — Fixed review.md items 1, 2 and 9 in the card system. (1) One shared BOXED_LEVELS=3 constant (card/depth.js) now drives both card/nesting/page.js and card/log/LogView.js, so the two nesting rules can no longer disagree; every doc that described the depth (card…

## Modules that exist now (files outside the module that import it)
- [core/Router](/framework/core/Router/) — used by 45 files

## Docs and readmes
- [Page — a folder with a page.js or a page.jsonl is a page: a…](/framework/core/Page/readme.md) — One system with Item: Page extends Item, so saving, replaying a log, set(delta) and live() tailing are the [Item readme](/framework/core/It…
- [Router — everything between "a url changed" and "the DOM re…](/framework/core/Router/readme.md) — ## Use html <a href="/docs/intro/">Intro</a> That is the whole API. Each url segment is one page.child(name), a miss is an import, and a ur…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [Page — a folder with a page.js or page.jsonl is a page: a u…](/framework/core/Page/doc/readme-before-2026-10-19.md) — How a page renders (code with helper functions, page.jsonl deltas, or both; markdown; live updates): [doc/how-a-page-renders.md](doc/how-a-…
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…
- [new/1 — new/0 plus a Router, lazy children, and regions](/framework/core/new/1/readme.md) — > This is the design that shipped. Router.js here is line-for-line the one > in core/Router/, and children-as-a-Map, container() and Router…
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [live](/live/) — the owner's live voice-work feed (lives at public/live/, not in this folder) - [core](./core/) — the seven clas…
- [Rules — the layout dos and don'ts, one page each, with live…](/framework/styles/rules/readme.md) — ## Use Each rule is a url — cite it in a review instead of quoting it: /framework/styles/rules/nesting/. Reading order: Cascade → Proportio…

## Sessions tagged with these words
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15
- 2026/10/15 [Page owner docs claims](/framework/ai/sessions/2026/10/15/session-57f46c1a/) — kind/owner model/sonnet task/page-system docs/readme · $0.86
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/14 [Scripts rename](/framework/ai/sessions/2026/10/14/session-6a78c3cb/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.90
- 2026/10/14 [Unreferenced census fix](/framework/ai/sessions/2026/10/14/session-009d74f3/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/readme · $0.14
- 2026/10/13 [Clarity followup daily](/framework/ai/sessions/2026/10/13/session-f5262774/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.15

## Owner asks
- 2026-10-02 Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself… (task-mastermind-one-dictation, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 17877f6ce core/Page: owner start doc, class map, Router link; readme claims verified (6 stale fixed)
- 6723b8b76 Sessions doc route: load doc/readme.md (priorities.md was archived), fixes a 404 on /framework/ai/sessions/do…
- ea4a7e6dd token-accounting: fix find_transcript() case-sensitivity (undercounted 144/145 project folders); investigate …
- c1e352aa0 sessions: real token-based cost attempt surfaces a second cost-metering symptom; tighten regex; move detail t…
- d0122f83b sessions/agents: fix env-drop on the default path, re-root the sdk.env trap, correct cost math, prove the fal…
- 6123a53c4 Sessions tab: CSS-grid data grid, master-detail side peek, Panel2 preview levels
- cf1144918 openrouter: warm the spend guard at boot, not on first spawn
- 1c2699774 openrouter: fix review findings 2-8 (cost polling, provider pass-through, guardrails)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 41,935 tokens of reading, under the 100k limit).

Question: Readmes page: fix its route, give a chosen folder a URL, re-review

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Readmes page: fix its route, give a chosen folder a URL, re-review"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
