# Site study — every module and program on the site, in one table

Eight scouts (Haiku) read every section's readme, page.js and doc/ file names and scored it; this assembler pass (Sonnet) validated their 8 files, fixed a coverage gap in ext-b, and built the table below. 68 things studied, sorted worst-first: least clear, then least demoed. `should_cap` is each scout's one-line view on whether a demo here would spread too wide at 3440 (the owner's concern: content that should cap around 1000px stretched to 3000px and looking wrong).

**68 rows · mean clarity 3.88/5 · mean coverage 62.3/100**

## The table

| url | blurb | clarity | coverage | stage kind | should_cap |
|---|---|---|---|---|---|
| /framework/core/new/ | Design proof archive; do not import. Read only. | 1 | 0 | measure | Content at measure width. |
| /framework/ext/Omnibox/ | Moved to core/Search; this is a deprecated pointer. | 1 | 0 | none | - |
| /framework/core/Search/ | The site corpus and its search box, press / to open. | 2 | 20 | measure | Content at measure width, appropriate. |
| /imagine/generated/ | Export a tree, edit it. One seed exported so far. | 2 | 40 | column | - |
| /framework/ext/JSONL/ | Append-only logs the AI blindly appends to; replayed into object state. | 2 | 65 | measure | - |
| /framework/core/List/ | The ordered collection behind item.items, an Item detail. | 2 | 80 | measure | Buttons and tree output stay in measure. |
| /framework/core/App/ | Boot and the one container pages mount into. | 3 | 0 | measure | Content is at prose measure width. |
| /layouts/doc/ | Naming rules, wire spec, and settlement record for the standard. | 3 | 0 | measure | - |
| /imagine/gallery/ | Framework pages borrowed and previewed, explained in Answers child. | 3 | 30 | measure | - |
| /framework/ext/Research/ | Questions dug by minions into append-only files, rendered live. | 3 | 40 | measure | - |
| /framework/ext/DesignTool/ | Measures layouts numerically — broken, off, or good with no AI. | 3 | 50 | wide | - |
| /framework/ext/Doc/ | A module as a page: files and members, each backed by markdown | 3 | 60 | measure | - |
| /framework/ext/Timeline/ | H/V timeline for dated items — CSS-vars, zoom, greedy lanes. | 3 | 60 | measure | - |
| /imagine/importance/ | Which matters more? Rank by comparison. | 3 | 60 | column | - |
| /imagine/research/ | Four topics, streamed live, rated by confidence. | 3 | 60 | column | - |
| /framework/core/Item/ | A persistent tree node with data, items, and events. | 3 | 70 | measure | Assertion output stays within measure. |
| /framework/ext/Panel/ | Chrome for arranging regions — divide, drag, align, fill and persist. | 3 | 70 | wide | - |
| /imagine/platform/ | Topics as worlds. One working demo included. | 3 | 70 | column | - |
| /framework/core/ | Ten core classes every site uses, one mental model. | 4 | 30 | column | The layout looks fine, centered well on 3440. |
| /framework/ext/toc/ | This page's own headings, as a nav, with the current one marked. | 4 | 35 | - | - |
| /imagine/feeds/ | YouTube picker, multi-view dataset, and live API in one column. | 4 | 35 | measure | - |
| /framework/core/Page/ | A URL with content and children; every page.js creates one. | 4 | 40 | wide | The overview browse() uses a 60-cap that looks right; cards fit well at any width. |
| /framework/core/Router/ | Everything between a URL change and the DOM reflecting it. | 4 | 40 | measure | Measure width appropriate for doc content. |
| /framework/ext/grip/ | A rail's resize edge — a strip inside the edge it drags | 4 | 50 | - | - |
| /framework/ext/layout/ | A toolbar over anything, and a drawer that pushes the page over | 4 | 50 | full bleed | - |
| /framework/ext/tabs/ | A bar of links and the panel its children mount into | 4 | 50 | - | - |
| /framework/ui/ | Twenty components in four bands, three functions, seventeen copy-paste markup | 4 | 50 | full bleed | - |
| /framework/ux/ | The behavior tier: ui/ hands you markup, ux/ hands you a class | 4 | 50 | - | - |
| /framework/styles/ | Four layers, six type levels, and as little else as possible. | 4 | 50 | - | - |
| /framework/ext/catalog/ | Same preview cards, two views: a sticky rail or a filterable wall | 4 | 55 | wide | the two sample demos are tiny (16-24em tall) inside a wide-class box, harmless now, but a real catalog (Layouts, UI) genuinely wants the ... |
| /framework/core/Sidebar/ | A brand over links and a resizable edge; includes theme toggle. | 4 | 60 | wide | Sidebars display at full width, no capping needed. |
| /framework/ext/Draggable/ | Grab-and-move for any view; Sortable crosses lists and nests. | 4 | 60 | measure | - |
| /layouts/tag/ | Click any tag to see every layout that carries it. | 4 | 65 | measure | Tag row and layout wall stay within measure |
| /layouts/labs/ | Six shape experiments moved from /imagine/, arrangements earning ids. | 4 | 68 | full | Experiments use full width, may spread at 3440 |
| /framework/ext/AITask/ | The AI log displayed as task pages, day dashboards and board. | 4 | 70 | wide | - |
| /imagine/ | Column host with grouped rail, one row, four categories. | 4 | 70 | column | - |
| /framework/core/Layout/ | Thirty arrangements proven at seven widths; click to see one. | 4 | 75 | measure | Browse uses 60-cap for cards which displays well at any width. |
| /framework/ext/editor/ | A drag-and-drop block builder: a page you visit, not a module | 4 | 75 | full bleed | no, a page-builder workspace is the deliberate exception that should fill the viewport, same as ext/Panel |
| /websites/ | Real sites tagged by layout, shown at four widths. | 4 | 75 | wide | strip scrolls but fits content at 3440 |
| /framework/core/Section/ | A page inside a page; pick a layout to define slots. | 4 | 80 | measure | Content at prose measure, looks appropriate. |
| /framework/ext/Ask/ | Talk to Claude from the browser; ask questions, pick elements, get feedback. | 4 | 80 | wide | - |
| /imagine/stream/ | Edit in one tab, live in every other, no reload. | 4 | 80 | wide | No, wide layout suits the hero card with two windows. |
| /imagine/youtube/ | Six API labs: panel, course, yield, split, chat, marks. | 4 | 80 | wide | No, wide layout suits the video and control panels. |
| /imagine/paging/ | Configure pages with six words. See them live. | 4 | 85 | none | The realm is an app, not a column; middle takes full remaining width after rail |
| /framework/ext/Saver/ | JSON persistence — save, load, delete over one write queue. | 4 | 90 | measure | - |
| /imagine/scenes/ | 3D pager: page tree is scene graph, click objects to navigate. | 4 | 90 | full bleed | No, full bleed is correct for 3D canvas. |
| /imagine/vary/ | Four labs: scroll, tone, place, four column looks. | 4 | 90 | wide | No, wide layout fits all four preview cards in one row at 3440. |
| /framework/ext/highlight/ | Syntax highlighting for the code() factory, on every page that shows code | 4 | 100 | wide | - |
| /framework/ext/markdown/ | md() renders prose; md.file() loads a whole markdown file into a View | 4 | 100 | - | - |
| /notes/ | Photographed notebook pages, transcribed and linked. | 4 | 100 | bleed | no spreading past 1600px photo width |
| /imagine/design/ | Screenshot-based design analysis of the site with ten focused study pages. | 5 | 35 | full bleed | width: full spreads thumbnails wide at 3440, could constrain with measure |
| /imagine/codrops/ | Twelve effects ported from Codrops, grouped by animation mechanism type. | 5 | 40 | measure | - |
| /framework/core/View/ | Every HTML tag is a function; pass a function for content. | 5 | 50 | measure | The measure looks appropriate for documentation. |
| /imagine/cms/ | Markdown and dev socket seams become a full CMS without a backend. | 5 | 50 | measure | - |
| /blog/ | Magazine front and blog with reading-width layout. | 5 | 50 | column | sidebar stays 19em, magazine fits measure |
| /framework/ext/demo/ | Show the code, then run it: the site one demo mechanism | 5 | 60 | wide | this module sets the site default demo width; a demo() box carries the wide class by default (readme: a demo is something you look at), w... |
| /framework/ext/files/ | A tree of real files, fetched, beside the one you clicked | 5 | 80 | wide | the two-or-three-panel browser genuinely benefits from width at 3440, similar to catalog |
| /imagine/review/ | What strangers said. What it meant. The gap. | 5 | 80 | column | - |
| /layouts/shell/ | Resizable sidebar and tree of homepage designs varying one change at a time. | 5 | 80 | full bleed | Fills viewport edge-to-edge for sidebar and design view |
| /framework/ext/Dropdown/ | One choice from a list — picture and name, never clipped. | 5 | 85 | measure | - |
| /framework/ext/drawer/ | The right rail anything can open, closed only by its own X | 5 | 85 | none | no, width is user-set in rem and remembered, not content that stretches with the viewport |
| /layouts/browse/ | Every layout on the site in three tiers, approve or improve each. | 5 | 85 | wide | Card wall stretches but no individual card spreads past measure |
| /layouts/practice/ | Three layouts built big, filled with site content and decisions. | 5 | 88 | full bleed | These pages are designed for 3440 and spread to that width intentionally |
| /web/ | Live guide to web patterns and layout principles. | 5 | 88 | wide | no visible spreading at 3440 |
| /framework/ext/depth/ | A page becomes a 3D scene, layers drift as you scroll | 5 | 90 | none | no, a scene explicitly cannot be .page.fill (preserve-3d flattens on overflow/opacity/filter), so this one is structurally not a bleed risk |
| /imagine/game/ | Text adventure using navigation, persistence, and a trading system. | 5 | 90 | column | - |
| /imagine/team/ | Roster, boards, draggable tasks remembered by URL. | 5 | 100 | measure | No, measured columns are appropriate here. |
| /layouts/ | Every layout named, defined and drawn at three widths. | 5 | 100 | measure | Layout drawings are scaled/zoomed, no full-bleed spreading |

## The ten least clear things

A stranger cannot say what these are for in ten seconds from the page's first screen. Gaps are what a reader still cannot see after using every demo on the page.

- **/framework/core/new/** (clarity 1) — Design proof archive; do not import. Read only.
  - gaps: No live code demonstrations; Prior design tiers not explained interactively; Comparison to current code not shown
- **/framework/ext/Omnibox/** (clarity 1) — Moved to core/Search; this is a deprecated pointer.
  - gaps: all functionality moved to core/Search; this is a redirect only
- **/framework/core/Search/** (clarity 2) — The site corpus and its search box, press / to open.
  - gaps: Search box interface not shown in demos; Ranking results not visible; Filter chips not demonstrated; Corpus build details not shown; Tag system not illustrated
- **/imagine/generated/** (clarity 2) — Export a tree, edit it. One seed exported so far.
  - gaps: Cannot see what a full multi-branch tree looks like; No demo of editing an exported tree; Does not show generator itself
- **/framework/ext/JSONL/** (clarity 2) — Append-only logs the AI blindly appends to; replayed into object state.
  - gaps: full ask/decision/verdict schema; rank verb behavior; complete streaming flow
- **/framework/core/List/** (clarity 2) — The ordered collection behind item.items, an Item detail.
  - gaps: Reactive lists intentionally cut, not shown; Direct list mutation (not via Item) shown but discouraged
- **/framework/core/App/** (clarity 3) — Boot and the one container pages mount into.
  - gaps: No live bootstrap demo; Lifecycle steps shown as text only; Custom chrome customization not demonstrated; Error page handling not shown
- **/layouts/doc/** (clarity 3) — Naming rules, wire spec, and settlement record for the standard.
  - gaps: No interactive demonstrations; No visual examples of naming or wires in docs; Heavy on reference, light on tutorial; Cannot experiment with naming rules
- **/imagine/gallery/** (clarity 3) — Framework pages borrowed and previewed, explained in Answers child.
  - gaps: Index does not explain what borrowing means; Must read Answers child to understand the architecture; Collections themselves are not shown, only three category cards
- **/framework/ext/Research/** (clarity 3) — Questions dug by minions into append-only files, rendered live.
  - gaps: no live demo of research process on this page; minion workflow not shown; verdict approval flow

## Every stage flagged as spreading at 3440

Scouts flagged a stage's `kind` as `full bleed` or `wide` when the code marks it that way; `cap` is what the code already gives it (often none — see the demo-stage verdict below).

**23 flagged of 68 total.**

| url | stage kind | cap the code gives it | should_cap (scout view) |
|---|---|---|---|
| /framework/core/Page/ | wide | 60 | The overview browse() uses a 60-cap that looks right; cards fit well at any width. |
| /framework/core/Sidebar/ | wide | none | Sidebars display at full width, no capping needed. |
| /framework/ext/AITask/ | wide | none | - |
| /framework/ext/Ask/ | wide | none | - |
| /framework/ext/DesignTool/ | wide | none | - |
| /framework/ext/Panel/ | wide | none | - |
| /framework/ext/highlight/ | wide | none | - |
| /framework/ext/layout/ | full bleed | none | - |
| /framework/ui/ | full bleed | none | - |
| /framework/ext/catalog/ | wide | none | the two sample demos are tiny (16-24em tall) inside a wide-class box, harmless now, but a real ca... |
| /framework/ext/demo/ | wide | none | this module sets the site default demo width; a demo() box carries the wide class by default (rea... |
| /framework/ext/editor/ | full bleed | none | no, a page-builder workspace is the deliberate exception that should fill the viewport, same as e... |
| /framework/ext/files/ | wide | none | the two-or-three-panel browser genuinely benefits from width at 3440, similar to catalog |
| /imagine/design/ | full bleed | none | width: full spreads thumbnails wide at 3440, could constrain with measure |
| /imagine/scenes/ | full bleed | none | No, full bleed is correct for 3D canvas. |
| /imagine/stream/ | wide | none | No, wide layout suits the hero card with two windows. |
| /imagine/vary/ | wide | none | No, wide layout fits all four preview cards in one row at 3440. |
| /imagine/youtube/ | wide | none | No, wide layout suits the video and control panels. |
| /layouts/browse/ | wide | none | Card wall stretches but no individual card spreads past measure |
| /layouts/practice/ | full bleed | 3440px | These pages are designed for 3440 and spread to that width intentionally |
| /layouts/shell/ | full bleed | none | Fills viewport edge-to-edge for sidebar and design view |
| /web/ | wide | none | no visible spreading at 3440 |
| /websites/ | wide | none | strip scrolls but fits content at 3440 |

## Things with no demo at all

**11 of 68** have zero entries in `demos` — a reader can only learn what these are from reading prose, never by clicking something and watching it work.

- **/framework/core/App/** — Boot and the one container pages mount into. (clarity 3, coverage 0)
- **/framework/core/new/** — Design proof archive; do not import. Read only. (clarity 1, coverage 0)
- **/framework/ext/Omnibox/** — Moved to core/Search; this is a deprecated pointer. (clarity 1, coverage 0)
- **/framework/ext/grip/** — A rail's resize edge — a strip inside the edge it drags (clarity 4, coverage 50)
- **/framework/ext/highlight/** — Syntax highlighting for the code() factory, on every page that shows code (clarity 4, coverage 100)
- **/framework/ext/layout/** — A toolbar over anything, and a drawer that pushes the page over (clarity 4, coverage 50)
- **/framework/ext/markdown/** — md() renders prose; md.file() loads a whole markdown file into a View (clarity 4, coverage 100)
- **/framework/ext/tabs/** — A bar of links and the panel its children mount into (clarity 4, coverage 50)
- **/framework/ext/toc/** — This page's own headings, as a nav, with the current one marked. (clarity 4, coverage 35)
- **/framework/ui/** — Twenty components in four bands, three functions, seventeen copy-paste markup (clarity 4, coverage 50)
- **/layouts/doc/** — Naming rules, wire spec, and settlement record for the standard. (clarity 3, coverage 0)

## The demo-stage verdict

Measured headless on a private server (`PORT=8126`), viewport 3440×1200, ten of the 23 flagged stages: `/framework/core/Page/`, `/framework/ext/highlight/`, `/framework/ext/layout/`, `/framework/ext/catalog/`, `/framework/ext/demo/`, `/framework/ext/files/`, `/imagine/vary/`, `/imagine/youtube/`, `/layouts/browse/`, `/web/`. For each, found the widest real content element (a card wall, a demo stage, a rail-plus-region shell — never the outer `.app`/`.page` chrome, which is full-width by design on every page) and, for the wall pages, measured the individual card widths too, since a wide *container* with narrow *cards* inside is not the same problem as one thing stretched wide.

| url | widest element | width | what it actually is |
|---|---|---|---|
| /web/ | .page-previews.bleed (wall) | container 3440px, but its 2 real cards measured 257px each | a short wall — confirmed NOT stretching; auto-fill leaves empty gutter tracks |
| /imagine/vary/ | .page-previews.bleed (wall) | container 1054px, 4 cards at 325px each | narrow wall, cards compact |
| /imagine/youtube/ | .page-previews.bleed (wall) | container 730px, 5 cards at 345px each | narrow wall, cards compact |
| /layouts/browse/ | .wide.flow (browse band wrapper) | 3260px outer, cards stay near the --column size inside | see the browse.css finding below — this is the one real risk |
| /framework/core/Page/ | .page-previews (wall) | container 2713px, cards 255-437px depending on the band | multi-card walls, cards compact |
| /framework/ext/highlight/, layout/, catalog/, demo/, files/ | .page-catalog.wide (rail + region shell) | 2972px, identical on all five | the shared ext/Doc Overview shell (rail + routed region) — structural, and the prose inside still caps at the 40em reading measure |

**Five sentences.**

1. `ext/demo`'s own stage CSS gives no numeric cap at all — `.demo-stage { max-width: 100% }` — so a demo's width is entirely decided by the page's own grid column, and Page.css's `.wide` column is deliberately uncapped too ("`wide` takes `minmax(0, 1fr)` — ALL the leftover, not a capped `--breakout`", a decision made 2026-08-17 after the old cap wasted 53% of a 3440 screen).
2. Two different, already-documented tradeoffs sit under almost everything flagged as wide: `previews()`/`wall()` uses `auto-fill`, so a short wall leaves empty gutter instead of growing its cards — confirmed live on `/web/`'s two-card wall, each card measured 257px, not stretched — while `browse()`'s per-band grid deliberately uses `auto-fit` with `1fr` as the max, and its own code comment in `ext/catalog/browse.css` admits the cost in almost the owner's own words: *"a band of three on a 2750px wall draws three cards a thousand pixels wide."*
3. None of the ten measured pages showed a single demo-render or stage box blown up on its own — every genuinely wide element found was either a multi-card wall reflowing into more columns (good — more cards per row, not stretched pixels) or the five ext/Doc module pages' shared rail-plus-region shell (`.page-catalog.wide`, identically 2972px on all five), which is structural — the prose inside it still caps at the 40em reading measure, so the shell being wide is not the owner's complaint pattern.
4. The one real, currently-uncapped risk is exactly what `browse.css` already names: a short band (2-3 cards) inside a `browse()` wall stretches those cards to fill the row instead of staying compact, and — unlike `wall()`'s already-fixed `auto-fill` behavior — nothing caps it today.
5. Proposed default: give `.browse-band > .page-previews` a real maximum card width (e.g. `minmax(min(var(--column, 14em), 100%), min(28em, 1fr))` in place of the bare `1fr` ceiling) so a short band stops stretching past a sensible card size and leaves gutter instead, the same way `wall()` already does; the one alternative — capping the band's own outer width instead of each card — should stay opt-in per band rather than becoming the default, because it only wins when a band is guaranteed a near-full row of cards, where per-card capping would waste width rather than save it.

Full measurement script and raw JSON: `ai/2026-09-18/site-study/` scratch (session-only, not in the repo — rerun with Playwright against the private server to reproduce).

