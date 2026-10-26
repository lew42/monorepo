<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Fix the  framework ai  dashboard layout  compact header  no giant sticky toolbar  no scroll in scroll  link to the tasks view" (words: fix, framework, dashboard, layout, compact, header, giant, sticky, toolbar, scroll, link, task, view)

## Tasks (8, best first)
- 2026-10-19 [Fix the /framework/ai/ dashboard layout: compact header, no giant sti…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/tasks-layout/) — (no outcome logged)
- 2026-10-13 [Sessions page: compact header, scope filters, left rail](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sessions-page-layout/) — Sessions page layout landed. first row higher: y 464 → 270–370 at 1200, shot shots/sessions/1200.png footer a status line: ~125 px → ~50 px, same shot left padding + inbox link: gutter matched, link gone year/month/day scope, month default, newest first: ?sco…
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-09-24 [Every dashboard ask on one page, two layout breaks fixed](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-dashboard/) — Every dashboard ask you made this week is on one page, and the two layout breaks it found are fixed on AI 2. - The record: [What you asked of the AI dashboards](/framework/ai2/doc/owner-asks.md). It holds 92 asks from 17–24 Sep, word for word, grouped by topi… · paths 4/4 exist
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-12 [Page: part-link cards, promote script, #id scroll](/framework/ai/sessions/2026/10/12/session-78a7b293/part-link/) — A page block can now become its own page, and the parent keeps a link card. Merged into michael/dev (56d44968f). a part-link content kind: [demo](/framework/core/Page/jsonl/part-link-demo/), doc [part-link.md](/framework/core/Page/doc/part-link.md) and the ai… · paths 2/2 exist
- 2026-10-04 [Doc header: mobile tab row scrolls instead of wrapping](/framework/ai/sessions/2026/10/05/mobile-doc-header/mobile-doc-header/) — Under ~600px the Doc page header is ~30% shorter. The tab row now scrolls sideways on one line instead of wrapping to a 2nd/3rd row below the title. title stacks above a full-width, one-line, side-scrolling tab row — CSS only, same markup: public/framework/ex… · paths 4/4 exist
- 2026-10-03 [Drawer: a [hidden] bug, not a missing cap — scroll and footer fixed](/framework/ai/sessions/2026/10/03/f5df03b9-e98c-45a5-9fb2-5b593b8bdefd/drawer-cleanup/) — Fixed. Root cause: the closed session-switcher list rendered at ~940px because its .flex class beat [hidden] — it pushed the composer off-screen and forced the whole body to scroll. header hugs, body is the ONLY scroll box, footer stays put via flex-grow: pro… · paths 1/2 exist, gone: framework/ext/drawer/doc/decisions/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [core/View](/framework/core/View/) — used by 300 files
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [Panel2 — standard shipping UI container: header toolbar, ma…](/framework/ext/panel2/readme.md) — A production layout container for shipping interfaces (unlike ext/Panel which is for wireframing). Header acts as a toolbar, main holds con…
- [dashboard.js — history and design notes](/framework/ai/AITask/doc/dashboard-notes.md) — ## File overview The day dashboard and the ai index rail, over the same rows. A task directory speaks through its files: requirements.md al…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…
- [Dashboard — a grid of live previews, stalled first](/framework/ai/dashboard/readme.md) — The owner's own words: "/framework/ai's default tab could show a grid-like dashboard that includes the inbox, but also the log next to it, …
- [Layout — a toolbar over anything, and a right-hand drawer t…](/framework/ext/layout/readme.md) — ## Use js import layout from "/framework/ext/layout/layout.js"; import { knob } from "/framework/ext/layout/controls.js"; layout(() => { bo…
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [Layout architecture — one toolbar steers anything, and the …](/framework/ext/layout/doc/architecture.md) — Layout is a toolbar and a right-hand drawer for demo and guide pages that let the reader arrange things. Entry: [layout.js](../layout.js) (…
- [Dashboard](/framework/styles/layouts/dashboard/readme.md) — Number strip over a wall of panels. Code: styles/layouts/dashboard/page.js _Stub — more to come._

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)

## Commits
- 0cbdd790f ai dashboard: task rows tolerate a dir stored with the public/framework/ai/ prefix
- 27a54a543 agents/sessions: real per-reply $ from the result event's modelUsage, cross-checked live
- 6123a53c4 Sessions tab: CSS-grid data grid, master-detail side peek, Panel2 preview levels
- 410077363 panel2-sessions Part 1: ext/panel2 (new standard UI chrome) + Inbox restructure

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,038 tokens of reading, under the 100k limit).

Question: Fix the /framework/ai/ dashboard layout: compact header, no giant sticky toolbar, no scroll-in-scroll, link to the tasks view

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Fix the /framework/ai/ dashboard layout: compact header, no giant sticky toolbar, no scroll-in-scroll, link to the tasks view"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
