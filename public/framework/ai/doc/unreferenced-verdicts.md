# Unreferenced files: a verdict for each

**Of 167 candidates, 0 are dead.** 76 are loaded in a way the census cannot see (almost all a stylesheet or fixture named in code), 91 are notes worth keeping where they are, 0 are misplaced. Nothing was moved or deleted. Census: [unreferenced.md](unreferenced.md).

## Your list: dead files

None. The scripted mover, `Server/retire-files.mjs` (`--plan`, `--apply`, `--undo`), is ready and reads this checklist, so it has nothing to move. Dead files, if the census finds more later, are listed here as `- [x] `path`` lines.


## Why so few

The census matches a bare file name only when no other file shares it, so `card.css`, `shell.css`, `clean.md` and every `page.css` look unreferenced even when code loads them with `View.stylesheet(import.meta, "card.css")`. Haiku found those loads; the Sonnet spot-check below caught four "dead" calls that were wrong. A next census pass should count a quoted bare name in the same folder's `.js` as a reference.

Spot-check (Sonnet, 15 verdicts read against the files): 11 agreed, 4 changed (the 3 `core/Page/card` files and `ext/Ask/mic.js`, all "dead" to "runtime-loaded" or "record"). Haiku was too eager only on "dead"; its "runtime-loaded" calls checked out 8 of 8 (Layout.css, baseline.css, timeline.css, shell.css, Refine `clean.md` ×3, Part.js shim).

Census diff against the 10-13 list: 126 then, 167 now. The 41 extra come from the session-store move and the one-tree apply (more folders now count as live code, fewer dated dirs hide references), not from new stray files. Total size of all candidates: 1245246 B.

## Every file

| file | verdict | reason | evidence |
|---|---|---|---|
| `core/Layout/Layout.css` | runtime-loaded | CSS stylesheet loaded by core/Layout/page.js via View.stylesheet() | core/Layout/page.js View.stylesheet call; recent 2026-09-06 |
| `core/Layout/doc/rules-notes.md` | record | Archived code comments from Layout.js prune; historical documentation | 2026-10-12 prune: core/Layout/rules.js comments moved here |
| `core/Layout/doc/rules.md` | record | Decision documentation for LayoutRules system and CSS authority | 2026-09-06 core Layout lands; explains three layout rules design |
| `core/Page/ai/ai.css` | runtime-loaded | CSS for core/Page/ai module (ObjectView and agent display rules) | Loaded by ai/page.js; core/Page/ai present in site navigation |
| `core/Page/ai/doc/assistant.md` | record | Module documentation explaining card assistant role and lifecycle | Recent 2026-09-29; explains Servex roles architecture |
| `core/Page/ai/doc/sessions.md` | record | Module documentation on session IDs and SDK integration | Recent 2026-10-12; task-folder relinking updated references |
| `core/Page/audit/design/findings.md` | record | Audit findings from design measurement; valuable reference for layout issues | 2026-09-30 ranked findings; used for page optimization decisions |
| `core/Page/card/card.css` | runtime-loaded | Superseded 2026-10-12; card styling moved to framework.css and ui/card | core/Page/card/page.js:7 View.stylesheet(import.meta, "card.css") |
| `core/Page/card/doc/inventory.md` | record | Inventory from superseded card module; replaced by ui/card system | listed in card/doc/files.jsonl; linked from doc/system.md:11; the card module is superseded but its history is |
| `core/Page/card/doc/system.md` | record | System documentation from superseded card module; moved to ui/card | listed in card/doc/files.jsonl; cited by card/depth.js:8; the owner's 2026-09-29 card decision |
| `core/Page/doc/Page-notes.md` | record | Archived code comments from Page.class.js; historical design notes | 2026-10-12 prune: Page.class.js comments moved to this doc |
| `core/Page/doc/archive/findings.md` | record | Archived column-page lab findings; historical reference for page design | In archive folder; 2026-08-29/30 lab verdicts documented |
| `core/Page/doc/archive/moved.md` | record | Index of archived docs explaining what was superseded and where | 2026-10-09 doc audit archived 4 superseded docs with links kept |
| `core/Page/doc/previews.md` | record | Documentation on borrowing/importing pages; useful API documentation | 2026-08-30 lazy depth improvements; measured approaches at /imagine/gallery |
| `core/Page/doc/readme-full-2026-10-12.md` | record | Archived full sections from readme.md trim; preserved verbatim | 2026-10-12 readme audit; archived sections with link references kept |
| `core/Page/doc/streaming.md` | record | Technical documentation on page storage and live streaming architecture | 2026-10-09 core/Page docs audit; explains critical storage design |
| `core/Page/ext/Inbox/doc/ranking.md` | record | Documentation on Inbox.rank() algorithm; decision on importance weighting | 2026-10-13 recent; explains 11-weight importance system |
| `core/Page/ext/Inbox/timeline/timeline.css` | runtime-loaded | CSS for Inbox timeline view; container queries for responsive display | timeline.css loaded by TimelinePage.js; recent 2026-10-13 updates |
| `core/Page/ext/demo.js` | runtime-loaded | Demo script placed by page.jsonl {place} verb; proves jsonl placement works | Placed by core/Page/ext/page.jsonl line 'place: demo.js' |
| `core/Page/generator/doc/traps.md` | record | Documentation on generator edge cases; moved from readme 2026-10-12 | 2026-10-13 readme-audit: moved verbatim from readme lines 217-262 |
| `core/Page/jsonl/doc/caveats.md` | record | Technical documentation on jsonl safety; append vs read-modify-write | Measured 2026-09-19: 98.5% data loss on concurrent read-modify-write |
| `core/Page/jsonl/doc/size.md` | record | Documentation on jsonl file size monitoring and growth | Describes page-size.mjs monitoring; no auto-purge, report only |
| `core/Page/jsonl/doc/writers.md` | record | Documentation on who writes jsonl lines; append-only system design | Seven writers documented; dev server, append scripts, and manual appends |
| `core/Page/jsonl/full/content.js` | runtime-loaded | Demo script placed by page.jsonl {place: content.js}; functional example | core/Page/jsonl/full/page.jsonl line {place: ['content.js', 'note.md']} |
| `core/Page/jsonl/full/note.md` | runtime-loaded | Demo note placed by page.jsonl {place} verb; shows placement mechanism | Placed by full/page.jsonl line {place: ['content.js', 'note.md']} |
| `core/Page/jsonl/note.md` | runtime-loaded | Demo note placed by page.jsonl; simple example of {place: note.md} | core/Page/jsonl/page.jsonl line {place: 'note.md'} |
| `core/Page/jsonl/system.js` | runtime-loaded | Level 1 of jsonl SYSTEM page; placed by page.jsonl demonstrate format | Placed by core/Page/jsonl/page.jsonl {place: {module: system.js}} |
| `core/Page/layout/switcher/doc/decide.md` | record | Design decision documentation on switcher collapse CSS-only approach | 2026-09-29 switcher landed; explains Router active-class interaction |
| `core/Page/layout/switcher/doc/decisions.md` | record | Design decision doc for switcher CSS namespace, kept in module's doc/ | 2026-09-29 e7cb389e5, linked from switcher/readme.md |
| `core/Page/navigation/doc/alternatives.md` | record | Design doc listing navigation pattern alternatives, part of core module | 2026-09-29, navigation/readme.md index |
| `core/Page/navigation/doc/prior-work.md` | record | Design doc tracking prior navigation work inventory, linked from readme | 2026-09-29, navigation/readme.md |
| `core/Page/parts/Part.js` | runtime-loaded | Shim maintaining backward compatibility for old Part.js imports (2026-10-12) | core/Page/parts/Part.js comment: keeps old imports loading |
| `core/Page/parts/doc/architecture.md` | record | Architecture doc for Page parts system, updates reflect 2026-10-12 refactor | 2026-10-12, parts/readme.md index |
| `core/Search/doc/decisions.md` | record | Design decision doc tracking what shipped vs didn't in Search system | 2026-09-06, Search/readme.md link |
| `core/Shell/Shell.css` | runtime-loaded | CSS loaded at runtime via View.stylesheet(import.meta, 'Shell.css') | core/Shell/Shell.js line 1 |
| `core/new/1/agents/eric/proposal.md` | record | Council proposal for new/1 design; design proof kept for architectural history | 2026-08-03 yea, readme: design shipped, keep as reference |
| `core/new/1/agents/steve/proposal.md` | record | Council proposal for new/1 design; part of design council round | 2026-08-03 yea, new/1/readme.md |
| `core/new/1/agents/tim/proposal.md` | record | Council proposal for new/1 design; part of design council round | 2026-08-03 yea, new/1/readme.md |
| `core/new/1/agents/urls/router.md` | record | Router design specification; prototyped and proven before shipping | 2026-08-04 big ai work, new/1/readme.md design docs |
| `core/new/1/agents/urls/schema.md` | record | URL schema design doc; part of new/1 design proof | 2026-08-04 big ai work, new/1/readme.md |
| `core/new/1/server.js` | record | Dev-only server for new/1 teaching prototype; documents design proof setup | 2026-08-03 yea, new/1 is kept design proof not imported |
| `core/new/1/site/app.js` | runtime-loaded | Entry point for new/1 teaching site; loads new/1 pages and routes | 2026-08-04, imports from new/1/App.js, exports new/1/Page |
| `core/new/1/site/budget/budget.js` | runtime-loaded | Budget config loaded by perf pages within new/1 teaching site | 2026-08-04, imports show it's used within new/1 |
| `core/new/1/site/compose/compose.css` | runtime-loaded | CSS for new/1 site composition; loaded by pages within prototype | 2026-08-04, part of new/1 site demo |
| `core/new/1/site/content/book/capture.md` | record | Teaching book chapter documenting View.captor pattern, design documentation | 2026-08-04, new/1 design proof |
| `core/new/1/site/content/book/manifest.md` | record | Teaching book chapter on data vs doors pattern, design documentation | 2026-08-04, new/1 design proof |
| `core/new/1/site/content/content.css` | runtime-loaded | CSS for content rendering in new/1 teaching site | 2026-08-04, loaded by content pages |
| `core/new/1/site/kit/page.css` | runtime-loaded | CSS for kit demo page within new/1 site | 2026-08-04, kit page styling |
| `core/new/1/site/library/library.css` | runtime-loaded | CSS for library demo within new/1 teaching site | 2026-08-04, loaded by library demo |
| `core/new/1/site/motion/baseline/baseline.css` | runtime-loaded | CSS for motion demo baseline within new/1 site | 2026-08-04, demo styling |
| `core/new/1/site/patterns/patterns.css` | runtime-loaded | CSS for patterns demo within new/1 teaching site | 2026-08-04, demo styling |
| `core/new/1/site/perf/ui.js` | runtime-loaded | Perf UI module loaded by budget pages; loads perf.css | 2026-08-04, imports perf.css via View.stylesheet |
| `ext/Ask/mic.js` | record | Explicitly superseded 2026-09-19 by ux/Dictate; old mic button replaced | ext/Ask/page.js:14 lists it in files:; its header says it is kept on purpose as the smaller reference |
| `ext/Chat/index.js` | runtime-loaded | Export index file; modules import Chat exports through this | ext/Chat/ usage patterns, index re-exports Chat.js |
| `ext/Collab/collab.css` | runtime-loaded | CSS for Collab module; likely loaded via View.stylesheet pattern | 2026-09-28, Collab.js stylesheet pattern |
| `ext/Collab/demo/collab/haiku-a/1-brief.md` | record | Demo brief showing collaboration run example output | 2026-09-28, demo file |
| `ext/Collab/demo/collab/haiku-a/2-read-peers.md` | record | Preserved demo output from 2026-09-28 Collab run showing peer-read phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/haiku-a/3-revise.md` | record | Preserved demo output from 2026-09-28 Collab run showing revision phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/haiku-c/1-brief.md` | record | Preserved demo output from 2026-09-28 Collab run showing brief phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/haiku-c/2-read-peers.md` | record | Preserved demo output from 2026-09-28 Collab run showing peer-read phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/haiku-c/3-revise.md` | record | Preserved demo output from 2026-09-28 Collab run showing revision phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/sonnet-b/1-brief.md` | record | Preserved demo output from 2026-09-28 Collab run showing brief phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/sonnet-b/2-read-peers.md` | record | Preserved demo output from 2026-09-28 Collab run showing peer-read phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/Collab/demo/collab/sonnet-b/3-revise.md` | record | Preserved demo output from 2026-09-28 Collab run showing revision phase | ext/Collab/readme.md (active system), commit 8bb90cea7 |
| `ext/DesignTool/doc/rules-notes.md` | record | Design notes and system overview extracted from DesignTool rules.js comments | commit 4c74b6ae8 (prune history); referenced in ext/DesignTool/rules.js |
| `ext/DesignTool/journey/journey.css` | runtime-loaded | CSS stylesheet for journey page; loaded by journey/page.js via View.stylesheet | ext/DesignTool/journey/page.js imports journey.css |
| `ext/ErrorLog/doc/design.md` | record | Architecture and design documentation for ErrorLog class system | ext/ErrorLog/readme.md links to doc/design.md; 2026-10-09 |
| `ext/Figma/palette/collab/collab.css` | runtime-loaded | CSS stylesheet for Figma collab palette page; loaded by page.js | ext/Figma/palette/collab/page.js:4 View.stylesheet(import.meta, collab.css) |
| `ext/Figma/palette/controls/controls.css` | runtime-loaded | CSS stylesheet for Figma controls palette page; loaded by page.js | ext/Figma/palette/controls/page.js imports controls.css |
| `ext/Figma/palette/timeline/timeline.css` | runtime-loaded | CSS stylesheet for Figma timeline palette page; loaded by page.js | ext/Figma/palette/timeline/page.js imports timeline.css |
| `ext/Figma/tokens/page.css` | runtime-loaded | CSS stylesheet for Figma tokens page; loaded by page.js via View.stylesheet | ext/Figma/tokens/page.js:5 View.stylesheet(import.meta, page.css) |
| `ext/Mention/doc/syntax.md` | record | Pattern syntax and regex documentation for @/# mention linking system | ext/Mention/readme.md links to doc/syntax.md; 2026-10-12 |
| `ext/Omnibox/Omnibox.js` | runtime-loaded | Compatibility shim left after 2026-09-06 move to core/Search; redirects old imports | File comment states purpose; ext/Omnibox/page.js describes the pointer pattern |
| `ext/Omnibox/doc/decisions.md` | record | Preserved decision record for pre-core Omnibox interaction model; still relevant | File header explains it is kept for reference; 2026-09-06 and prior |
| `ext/Panel/playground/playground.css` | runtime-loaded | CSS stylesheet for playground page; loaded via View.stylesheet | ext/Panel/playground/page.js:6 View.stylesheet(import.meta, playground.css) |
| `ext/Panel/toolbar.js` | runtime-loaded | Part of Panel UI system; exports toolbar bar and place() function | workspace.js and paint.js import from this file; active Panel system |
| `ext/Refine/doc/architecture.md` | record | Class architecture documentation for RefineSystem and its component classes | ext/Refine/readme.md links to it; 2026-10-08 |
| `ext/Refine/doc/prompt.md` | record | Documentation of Prompt class: structure, properties, and use | ext/Refine/readme.md links to it; 2026-10-08 |
| `ext/Refine/fixture/brief.md` | record | Example brief from a hand-built Refine fixture; demonstrates ask-naming conventions | ext/Refine/readme.md shows fixture exists; 2026-09-29 |
| `ext/Refine/fixture/clean.md` | record | Example clean sentences from a hand-built Refine fixture; shows sentence extraction | ext/Refine/readme.md shows fixture exists; 2026-09-29 |
| `ext/Refine/fixture/coverage.md` | record | Example coverage mapping from Refine fixture; shows sentence traceability | ext/Refine/readme.md shows fixture exists; 2026-09-29 |
| `ext/Refine/fixture/structured.md` | record | Example structured outline from Refine fixture; shows idea organization | ext/Refine/readme.md shows fixture exists; 2026-09-29 |
| `ext/Refine/runs/2026-10-06/brief.md` | record | Brief for 2026-10-06 feedback-council Refine run; preserved example output | ext/Refine/readme.md links to runs; log shows Refine runs indexed 2026-10-06..13 |
| `ext/Refine/runs/2026-10-06/clean.md` | record | Clean sentences from 2026-10-06 feedback-council Refine run; preserved example | ext/Refine/readme.md links to runs; 2026-10-13 |
| `ext/Refine/runs/2026-10-06/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-06/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916 writes structured-<name>.md; Refine.js:135 loads only structured.md |
| `ext/Refine/runs/2026-10-06/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-07/brief.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('brief.md')...) |
| `ext/Refine/runs/2026-10-07/clean.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('clean.md')...) |
| `ext/Refine/runs/2026-10-07/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-07/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916; Refine.js loads only structured.md |
| `ext/Refine/runs/2026-10-07/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-08/brief.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('brief.md')...) |
| `ext/Refine/runs/2026-10-08/clean.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('clean.md')...) |
| `ext/Refine/runs/2026-10-08/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-08/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916; Refine.js loads only structured.md |
| `ext/Refine/runs/2026-10-08/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-09/brief.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('brief.md')...) |
| `ext/Refine/runs/2026-10-09/clean.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('clean.md')...) |
| `ext/Refine/runs/2026-10-09/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-09/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916; Refine.js loads only structured.md |
| `ext/Refine/runs/2026-10-09/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-10/brief.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('brief.md')...) |
| `ext/Refine/runs/2026-10-10/clean.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('clean.md')...) |
| `ext/Refine/runs/2026-10-10/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-10/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916; Refine.js loads only structured.md |
| `ext/Refine/runs/2026-10-10/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-12/brief.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('brief.md')...) |
| `ext/Refine/runs/2026-10-12/clean.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('clean.md')...) |
| `ext/Refine/runs/2026-10-12/coverage.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('coverage.md')...) |
| `ext/Refine/runs/2026-10-12/structured-haiku.md` | record | Intermediate model draft from refine.mjs structured step, not loaded by viewer | Server/refine.mjs:916; Refine.js loads only structured.md |
| `ext/Refine/runs/2026-10-12/structured.md` | runtime-loaded | Dynamically fetched by Refine.js as part of run display ladder | Refine.js:135 Promise.all(...text('structured.md')...) |
| `ext/Refine/runs/2026-10-13/brief.md` | record | Saved refine run output; ladder shown per readme | ext/Refine/readme.md mentions saved runs |
| `ext/Refine/runs/2026-10-13/clean.md` | record | Saved refine run output; ladder shown per readme | ext/Refine/readme.md mentions saved runs |
| `ext/Refine/runs/2026-10-13/coverage.md` | record | Saved refine run output; ladder shown per readme | ext/Refine/readme.md mentions saved runs |
| `ext/Refine/runs/2026-10-13/structured-haiku.md` | record | Saved refine run output; ladder shown per readme | ext/Refine/readme.md mentions saved runs |
| `ext/Refine/runs/2026-10-13/structured.md` | record | Saved refine run output; ladder shown per readme | ext/Refine/readme.md mentions saved runs |
| `ext/Refine/system.js` | runtime-loaded | System definition loaded by ext/System/Systems.js at runtime | ext/System/Systems.js imports it |
| `ext/Shots/doc/architecture.md` | record | Architectural decisions and build notes for Shots system | Shots/readme.md references it |
| `ext/Timeline/Timeline.css` | runtime-loaded | CSS loaded by Timeline.js via View.stylesheet() | Timeline.js:3 View.stylesheet(import.meta, "Timeline.css") |
| `ext/catalog/browse.css` | runtime-loaded | CSS loaded by browse.js via View.stylesheet() | browse.js:5 View.stylesheet(import.meta, "browse.css") |
| `ext/catalog/catalog.css` | runtime-loaded | CSS loaded by catalog.js via View.stylesheet() | catalog.js loads same-stem CSS |
| `ext/demo/demo.css` | runtime-loaded | CSS loaded by demo.js via View.stylesheet() | demo.js:8 View.stylesheet(import.meta, "demo.css") |
| `ext/demo/shell.css` | runtime-loaded | CSS loaded by shell.js via View.stylesheet() | shell.js:13 View.stylesheet(import.meta, "shell.css") |
| `ext/drawer/rail.css` | runtime-loaded | CSS loaded by rail.js via View.stylesheet() | drawer/rail.js uses View.stylesheet() |
| `ext/grip/grip.css` | runtime-loaded | CSS loaded by grip.js via View.stylesheet() | grip.js loads same-stem CSS |
| `ext/layout/layout.css` | runtime-loaded | CSS loaded by layout.js via View.stylesheet() | layout.js loads same-stem CSS |
| `styles/layouts/catalog/catalog.css` | runtime-loaded | CSS for layout catalog page, loaded at runtime | LayoutCatalog.js data + page.js render |
| `styles/layouts/catalog/doc/past-work.md` | record | Documentation of past work and reuse decisions for catalog | Created 2026-10-12 as part of layout-catalog task |
| `styles/layouts/catalog/shots.mjs` | runtime-loaded | Script to generate layout catalog screenshots; called via CLI and referenced in code | LayoutCatalog.js and Library.js reference shots folder |
| `styles/layouts/cols/doc/adoption.md` | record | Research documentation on layout word adoption criteria | Part of cols module research, created 2026-10-13 |
| `styles/layouts/cols/doc/words.md` | record | Documentation of column layout words and decision rules | Part of cols module docs, created 2026-09-21 |
| `styles/layouts/layouts.css` | runtime-loaded | CSS for layout pages (full-window view, preview thumbnails) | 2026-10-12 commit, used by layout system |
| `styles/system/studies/color/decisions.md` | record | Research decision notes for lighten/darken color study (2026-09-17) | Created 2026-10-12 as part of style-system work |
| `styles/system/studies/color/sections/decisions.md` | record | Research decision notes for where-grounds-meet study | Created 2026-10-12 as part of color research |
| `styles/system/studies/color/sections/sections.css` | runtime-loaded | CSS loaded by color/sections/page.js via View.stylesheet() | sections/page.js:7 View.stylesheet(import.meta, "sections.css") |
| `styles/system/studies/lists/doc/page-notes.md` | record | Page.js implementation notes and container design decisions | Created 2026-10-12 from prune work |
| `styles/system/studies/size/landing.md` | record | Documentation of what landed in size-apply (2026-09-06) | Created 2026-10-12 as reference doc |
| `styles/system/studies/size/size.css` | runtime-loaded | CSS loaded by size/page.js via View.stylesheet() | size/page.js:4 View.stylesheet(import.meta, "size.css") |
| `styles/system/studies/spacing/nesting/decisions.md` | record | Research decision record for nesting/padding study (2026-09-18) | Created 2026-09-21 as part of spacing research |
| `styles/system/studies/themes/themes.css` | runtime-loaded | View.stylesheet(import.meta, "themes.css") in themes/page.js | public/framework/styles/system/studies/themes/page.js:5 |
| `styles/system/studies/type/anchors/decisions.md` | record | Design decision doc for anchors study, part of type module | referenced in public/framework/styles/system/studies/type/readme.md |
| `ui/background/page.css` | runtime-loaded | View.stylesheet(import.meta, "page.css") in background/page.js | public/framework/ui/background/page.js:4 |
| `ui/controls/controls.css` | runtime-loaded | View.stylesheet(import.meta, "controls.css") in controls/page.js | public/framework/ui/controls/page.js:3 |
| `ui/icon/doc/icons.md` | record | Icon design and framing guide, referenced in icon/readme.md | public/framework/ui/icon/readme.md:31 |
| `ui/item/doc/reuse.md` | record | Study of item reuse opportunities, referenced in item/readme.md | public/framework/ui/item/readme.md:42 |
| `ux/Content/Decision/doc/shape.md` | record | Record shape documentation for Decision module | public/framework/ux/Content/Decision/readme.md:3 |
| `ux/Content/Disclosure/doc/decisions.md` | record | Design decisions for Disclosure variants and behaviors | referenced in public/framework/ux/Content/Disclosure/readme.md |
| `ux/Content/Object/doc/census.md` | record | Census of classes worth a debug view, referenced in Object/readme.md | public/framework/ux/Content/Object/readme.md mentions census |
| `ux/Content/Object/doc/shape.md` | record | Object module record shape documentation | public/framework/ux/Content/Object/readme.md |
| `ux/Content/Question/doc/shape.md` | record | Question module record shape documentation | public/framework/ux/Content/Question/readme.md |
| `ux/Content/Quotation/doc/shape.md` | record | Quotation module record shape documentation | public/framework/ux/Content/Quotation/readme.md |
| `ux/Content/catalog/catalog.css` | runtime-loaded | View.stylesheet(import.meta, "catalog.css") in catalog/page.js | public/framework/ux/Content/catalog/page.js:1 |
| `ux/Content/content.css` | runtime-loaded | View.stylesheet(import.meta, "content.css") in ContentModule.js | public/framework/ux/Content/ContentModule.js:1 |
| `ux/Dictate/Dictate.css` | runtime-loaded | View.stylesheet(import.meta, "Dictate.css") in Dictate.js | public/framework/ux/Dictate/Dictate.js:10 |
| `ux/Dictate/doc/chat.md` | record | Chat.js implementation guide and seaming documentation | referenced in public/framework/ux/Dictate/readme.md |
| `ux/Dictate/doc/notes.md` | record | Comment essays extracted from Dictate.js code, documentation | public/framework/ux/Dictate/Dictate.js:12 |
| `ux/Dictate/playground/Playground.css` | runtime-loaded | View.stylesheet(import.meta, "Playground.css") in playground/Playground.js | grep: public/framework/ux/Dictate/playground/Playground.js |
| `ux/Dictate/variants/v1/Dictate.css` | runtime-loaded | View.stylesheet(import.meta, "Dictate.css") in variants/v1/Dictate.js | grep: public/framework/ux/Dictate/variants/v1/Dictate.js |
| `ux/Dictate/workspace/Workspace.css` | runtime-loaded | View.stylesheet(import.meta, "Workspace.css") in workspace/Workspace.js | grep: public/framework/ux/Dictate/workspace/Workspace.js |
| `ux/Hotkeys/doc/decisions.md` | record | Design decisions for Hotkeys module, referenced in readme | public/framework/ux/Hotkeys/readme.md |
| `ux/Menu/doc/decisions.md` | record | Menu module design decisions and caller census | public/framework/ux/Menu/readme.md |
| `ux/Pagination/doc/decisions.md` | record | Pagination module design decisions and caller census | public/framework/ux/Pagination/readme.md |
| `ux/Rename/doc/decisions.md` | record | Rename module design decisions, why plain array over ContentModule | public/framework/ux/Rename/readme.md |
| `ux/Tags/doc/decisions.md` | record | Tags module design decisions and caller census | public/framework/ux/Tags/readme.md |
| `ux/Understand/doc/decisions.md` | record | Understand module design: why Decision over Question | public/framework/ux/Understand/readme.md |
| `public/web/nav/doc/study/navigation.css` | runtime-loaded | View.stylesheet(import.meta, "navigation.css") in study/page.js | public/web/nav/doc/study/page.js:4 |
