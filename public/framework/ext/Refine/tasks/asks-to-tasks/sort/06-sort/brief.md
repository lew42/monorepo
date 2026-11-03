# Sort 25 of the owner's asks

You are a sorter, not a builder. Do NOT edit any file. Read the repo only as much as you need (Grep/Glob first; `git log` always with `-n 5` and a path). The site serves `public/` as `/`; modules live in `public/framework/<module>/`; rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`.

Each ask below is something the owner said that nothing has tracked yet. Sort each into exactly one of four:

- **task**: still wanted and not built. Give `module` (from the list below), a `title` (an imperative, under 80 characters, plain words), and `evidence`: what is missing, and where you looked.
- **done**: it exists now. `evidence` = `path:line - the quoted line` of a file you opened. A related thing is not the thing.
- **obsolete**: no longer applies (superseded, the thing it was about is gone, a one-time question about a moment that has passed, a status check). `evidence` = one line why.
- **note**: not work but worth keeping: a rule, a preference, an idea, an observation about how something should be. Give `module` and `note`: one plain sentence that a reader of that module's readme would understand on its own.

Decide every ask; never answer "ask the owner". When unsure between task and note: if finishing it would change a file, page or setting, it is a task. Always give `module` for a task or a note: the one from the list that the ask is about; if none fits, use `ai`.

## Modules (folder under public/framework, or a top-level folder): what each is

- `ai`: AI — the folder where the AI system's records live and the pages that 
- `ai/AIDashboard`: AIDashboard `ai/AIDashboard/`
- `ai/AIDay`: AIDay `ai/AIDay/`
- `ai/AISession`: AISession — one Claude session as a class family
- `ai/AITask`: AITask — the page template for one session task, and the day and board
- `ai/archive/ai2`: ai/archive/ai2: old AI 2 page logs, kept
- `ai/asks`: Asks
- `ai/audits`: Audits — one line per audit we have run
- `ai/cards`: ai/cards: one card and what it shows
- `ai/council`
- `ai/dashboard`: Dashboard — a grid of live previews, stalled first
- `ai/health`: Page health — is it working? After every change, the pages it could ha
- `ai/local`: Local Models — talk to a model running on this machine's own GPU
- `ai/models`: Models: which agent runs on what
- `ai/now`: Now `ai/now/`
- `ai/quick-fix`: Quick fix
- `ai/rail`: ai/rail: the list on the left, and the data behind it
- `ai/readmes`: Readmes `ai/readmes/`
- `ai/review`: Review questions — every question a fresh reviewer asks, per system, r
- `ai/system`: System tab: what is here, and what is not
- `ai/talk`: Talk — press the mic, talk, see your words
- `ai/usage`: Usage pace: spend against the clock
- `ai/v/2`: AI v2 — one dense, full-width board, written to live; a second take on
- `ai/v/3`: AI v3 — a wall of idea cards, ranked by importance; a third take on th
- `ai2`: ai2: the old address of AI 2 (merged into AI on 2026-10-09)
- `audio`: audio — three building blocks for anything with a microphone
- `audio/MicStream`: MicStream — opens a microphone, hands out its stream, samples, level, 
- `audio/Recorder`: Recorder — record, play back, save
- `audio/Transcriber`: Transcriber — an audio stream in, a text stream out
- `audio/v1`: audio/v1 — the six-class version, kept for comparison
- `audio/v1/LevelMeter`: LevelMeter — a live level bar for any MicStream
- `audio/v1/mic-to-text`: Mic → Whisper → text
- `audio/v1/MicPicker`: MicPicker — the microphone chooser
- `audio/v1/push-to-talk`: Push-to-talk stream — Discord-style, local only
- `audio/v1/PushToTalk`: PushToTalk — hold to talk
- `audio/v1/sound-recorder`: Sound recorder — MicPicker + LevelMeter + Recorder
- `audio/Voice`: Voice — text to speech
- `audio/Whisper`: audio/Whisper
- `audit`: framework/audit — the 2026-08-15 doc audit: one report per module plus
- `audit/browsable`: audit/browsable — the prime objective's scorecard: how deep the site i
- `catalog`: Catalog — every page with a demo as a live preview, plus every class c
- `code`: Code — the code in this framework: HTML, CSS, JS
- `code/css`: CSS — layers, where a declaration belongs, and how to name a class
- `code/dos-and-donts`: Dos and don'ts — the traps that never throw
- `code/objects`: Objects — object-oriented design: every class ships a view of its stat
- `code/patterns`: Patterns — the shape of a module
- `code/performance`: Performance — big data on a page without freezing the machine
- `core`: Core — the eight classes under every page (listed under More): four ar
- `core/App`: App — boot, and the one container pages mount into; a site constructs 
- `core/Events`: Events — `on` / `off` / `emit`, a mixin everything else builds on
- `core/Item`: Item — an arbitrary persistent thing: an id, a data bag, one `set(delt
- `core/Layout`: core/Layout
- `core/List`: List — the ordered collection that announces every change
- `core/new`: core/new — one sketch kept for the record; two deleted 2026-08-30
- `core/new/1`: new/1 — new/0 plus a Router, lazy children, and regions
- `core/Page`: Page — a folder with a `page.js` or a `page.jsonl` is a page: a url, c
- `core/Page/ai`: core/Page/ai/ — the page-based AI system
- `core/Page/audit`: Audit — every page layout in use, most-used first
- `core/Page/card`: card — the site's card design system
- `core/Page/content-shapes`: content — every shape a page's `content` can take, one child page each
- `core/Page/dynamic`: dynamic — pages nobody saved
- `core/Page/ext`: Extensions — a page.jsonl line turns a small piece of behavior on, by 
- `core/Page/generator`: Generator — pages without the filesystem
- `core/Page/jsonl`: jsonl — the page.jsonl SYSTEM, not just the format
- `core/Page/layout`: Layout — the layout system: how pages sit among pages, how a page divi
- `core/Page/navigation`: Navigation — persistent vs switching, the levels that stack, the go-to
- `core/Page/overview`: Page overview — the palette: one card per building block, and every ca
- `core/Page/parts`: parts — a page whose body is a list of parts, stored as lines in its o
- `core/Page/settings`: Settings — tabs that manage themselves, and a page's own nav switch
- `core/Page/Template`: Template — a page that renders many times, each time from its own data
- `core/Page/weight`: Weight — one number per page, 1 by default, that says how much it matt
- `core/Property`: Property — one live value you can bind to
- `core/Router`: Router — everything between "a url changed" and "the DOM reflects it";
- `core/Search`: Search — the site's corpus and the ranking over it, plus the one searc
- `core/Section`: Section — a page you put inside a page
- `core/Session`: core/Session
- `core/Shell`: Shell — five optional regions around a CSS grid: header, left, right, 
- `core/Sidebar`: Sidebar — a brand over a TREE of links, resizable by its own edge, ove
- `core/Task`: Task — a DOM-free unit of work: id, title, a state machine, a computed
- `core/Test`: Test — node tests that run when the code they cover changes, with resu
- `core/View`: View — a chainable wrapper over one DOM element; every HTML tag is a f
- `design`: Design — everything that goes into making anything new: layout, color,
- `design/color`: Color — colour and contrast: tokens, ratios, light and dark
- `design/content`: Content — the iceberg: level of detail, what is foundational, importan
- `design/layout`: Layout — space: sizing, wrapping, spacing, flow, the approved layouts,
- `design/navigation`: Navigation — the path: how links look, persistent or switching, transi
- `design/ui`: UI — buttons, toolbars, dropdowns, icons: states and targets
- `dev`: Dev — the local-only tier: live reload, the DevBar rail, tab claims. F
- `dev/Claim`: Claim — a tab claimed by an agent: a ring around the viewport, a label
- `dev/DevBar`: DevBar — a right-docked rail of dev chrome on every page, behind `Ctrl
- `dev/DevShell`: DevShell — Ctrl + \ opens a dark shell around the whole site: page tre
- `dev/mobile`: Mobile — How to open this site on a phone, why the microphone and the 
- `dev/Socket`: Socket — one WebSocket to the dev server; the transport every dev-only
- `ext`: Ext — opt-in addons for the framework: an ext may patch core, vendor a
- `ext/AITask`: AITask — moved to [ai/AITask](../../ai/AITask/readme.md) on 2026-10-13
- `ext/Ask`: Ask — talk to a Claude Code session from the browser; for pages and to
- `ext/catalog`: catalog — two arrangements of `previews()` patched onto `Page`, for an
- `ext/Chat`: Chat — a scrolling chat log, composer, and conversation widget
- `ext/Classify`: Classify — a light overlay that shows the layout classes of any contai
- `ext/Collab`: Collab — a mastermind's members through phases to a vote, live, as one
- `ext/CSSDoc`: CSSDoc — every CSS rule that lands on one element, read out of the liv
- `ext/DataGrid`: DataGrid — one grid for every list of records: a table or a rail of ca
- `ext/demo`: demo — show the code and run it from one source; the site's one exampl
- `ext/demo/shell`: Shell
- `ext/depth`: depth — a page becomes a 3D scene; `.depth(n)` layers drift as you scr
- `ext/DesignTool`: DesignTool — measures a layout numerically: what is BROKEN, what is OF
- `ext/DesignTool/audit`: audit — the whole site measured and ranked worst-first, for whoever fi
- `ext/DesignTool/diff`: site-diff — one command that shows what changed on the site since the 
- `ext/DesignTool/journey`: Journey
- `ext/DesignTool/knowledge`: Knowledge
- `ext/DesignTool/library`: Library — eleven arrangements the site is built from, live and measure
- `ext/DesignTool/taste`: Taste — the third DesignTool tier: eleven weighted ideal ranges that r
- `ext/DesignTool/tests`: Tests — twenty-three layouts with a declared verdict, so the analyzer 
- `ext/DesignTool/vision`: vision — screenshots × a model × a prompt, one JSONL line each. The AI
- `ext/DesignTool/widths`: Widths — the meter for `styles/layouts/400/`: ten urls read at 400/128
- `ext/Doc`: Doc — a module documented as a page (Overview · API · Docs · Files), e
- `ext/Doc/overview`: Overview
- `ext/Draggable`: Draggable — grab-and-move for any View; `Sortable` reorders, crosses l
- `ext/drawer`: drawer — the right rail for context, tools, and assistance beside the 
- `ext/Dropdown`: Dropdown — one choice out of a list: a trigger showing its picture and
- `ext/editor`: editor — a drag-and-drop block builder assembled from Item, Sortable, 
- `ext/ErrorLog`: ErrorLog — a UI error becomes one log line a session can follow
- `ext/Figma`: Figma — tracks Figma files as JSONL + saved screenshots, so the site c
- `ext/files`: files — a tree of real files on disk, fetched, beside the one you clic
- `ext/filesystem`: filesystem — the DATA behind every file on the site: `FsFile` and `Dir
- `ext/grip`: grip — a rail's resize edge: a strip just inside the edge it drags, an
- `ext/highlight`: highlight — syntax highlighting on the `code` factory, for every page 
- `ext/JSONL`: JSONL — append-only `.jsonl` logs the AI blindly appends to, replayed 
- `ext/layout`: Layout — a toolbar over anything, and a right-hand drawer that *pushes
- `ext/markdown`: Markdown — `md()` for prose and `md.file()` for a whole `.md`, as a Vi
- `ext/markdown/open`: Where a link opens
- `ext/Mention`: Mention — `#Page` and `@owner` become a small icon + the word, whereve
- `ext/Omnibox`: Omnibox — moved into core on 2026-09-06; this directory is a pointer
- `ext/Panel`: Panel — chrome for arranging: divide, drag, align, fill and persist re
- `ext/Panel/playground`: playground — one document, whole-window: its viewport set, and the dra
- `ext/Panel/Workspace`: Workspace — holds a Panel root; documents as files; a bar above it
- `ext/panel2`: Panel2 — standard shipping UI container: header toolbar, main, footer,
- `ext/Query`: Query — ask node for just the rows a page shows
- `ext/Refine`: Refine — speak one prompt and watch it refine (raw → clean → cards, wi
- `ext/Refine/stages`: Refine stages — the live stages of a voice prompt
- `ext/Research`: Research — a question dug by several minions into append-only files, r
- `ext/Saver`: Saver — where a document goes: `save` / `load` / `delete` over one wri
- `ext/Session`: Session — one ✦ press is one voice session, answered by a fast and a s
- `ext/Shots`: Shots — the screenshot system: shoot, diff, judge
- `ext/sprawl`: Sprawl — a wall of big sections that balances its own columns
- `ext/System`: System — a generic container for anything we keep in order
- `ext/tabs`: Tabs — a bar of links and the panel its children mount into; `this.tab
- `ext/Timeline`: Timeline — a general h/v timeline (CSS-var positioning, greedy lanes, 
- `ext/toc`: toc — this page's own headings as a right-hand nav, current one marked
- `faq`: FAQ — short answers to the questions people hit first, code first.
- `lab`: Lab — small browser-feature experiments, each a live demo page
- `library`: Library — browse everything we built in three columns: siblings, the c
- `log`: log — how objects write down what they do (ideas, not built)
- `research`: Research — research programs shown live from their logs.
- `servex`: Servex
- `servex/lifecycle`: Lifecycle — how much is left running
- `sources`: Sources
- `start`: Start — three files, no build step, a working site.
- `start/example`: example
- `styles`: Style library — every token, ground, class and layout the CSS ships, s
- `styles/elements`: Elements — the reference for every element `framework.css` styles (and
- `styles/elements/code`: Code
- `styles/elements/forms`: Forms
- `styles/elements/lists`: Lists
- `styles/elements/media`: Media
- `styles/elements/misc`: Misc
- `styles/elements/table`: Table
- `styles/elements/text`: Text
- `styles/layers`: Layers — the four cascade layers (base, theme, site, util), declared o
- `styles/layers/base`: base
- `styles/layers/site`: site
- `styles/layers/theme`: theme
- `styles/layers/util`: util
- `styles/layouts`: Layouts — every whole-page layout as a class string, on one filterable
- `styles/layouts/400`: 400 — five class strings, one column at 400, unstacking on their own p
- `styles/layouts/anatomy`: Anatomy — seven "generic layouts" from the Figma, and the two strings 
- `styles/layouts/apidoc`: Framework
- `styles/layouts/bold-editorial`: Bold Editorial
- `styles/layouts/carousel`: Carousel
- `styles/layouts/chat`: Chat
- `styles/layouts/cols`: Columns
- `styles/layouts/dashboard`: Dashboard
- `styles/layouts/docs`: Docs
- `styles/layouts/document`: Document
- `styles/layouts/feed`: Feed
- `styles/layouts/fit`: Fit
- `styles/layouts/flex`: Flex
- `styles/layouts/gallery`: Gallery
- `styles/layouts/grid`: Grid
- `styles/layouts/hero`: Hero
- `styles/layouts/home`: Home — a real client homepage, ten bands, one class string each; for a
- `styles/layouts/landing`: Landing
- `styles/layouts/mail`: Mail
- `styles/layouts/masonry`: Masonry — a ragged wall with no gaps at the column bottoms, for anyone
- `styles/layouts/model`: The layout model
- `styles/layouts/overlay`: Overlay
- `styles/layouts/pricing`: Pricing
- `styles/layouts/screens`: Screens — seven Figma frames, four already ours, three new phone scree
- `styles/layouts/set`: Set
- `styles/layouts/shell`: App shell
- `styles/layouts/sidebar`: Sidebar
- `styles/layouts/space`: Layout space — a layout is a string: type one and see it on five scree
- `styles/layouts/spec`: Full width
- `styles/layouts/split`: List · detail
- `styles/layouts/stack`: Stack
- `styles/layouts/toc-studio`: Tabbed Toc
- `styles/layouts/wire`: Wireframes — eight generic page skeletons, each as one class string; t
- `styles/rules`: Rules — the layout dos and don'ts, one page each, with live examples t
- `styles/sections`: Sections — a layout with real content in it; fifteen bands that compos
- `styles/stacks`: Stacking
- `styles/system`: System — the one page that says what the design system is, painted at 
- `styles/system/studies`: Studies — the evidence behind the design system's numbers
- `ui`: UI — the template tier: twenty components in four bands, one page each
- `ui/accordion`: Accordion — one panel open at a time, with no JS: native `<details>` s
- `ui/alert`: alert
- `ui/avatar`: avatar
- `ui/background`: background — one div behind your content, swappable in a line
- `ui/badge`: badge
- `ui/card`: card — the one card page
- `ui/controls`: controls — one box for every control
- `ui/controls/study`: Controls — the design record
- `ui/crumbs`: Crumbs — a trail of links above a page, CSS only
- `ui/datagrid`: datagrid — the markup for a data-grid table, no JavaScript required
- `ui/decision`: decision
- `ui/dialog`: Dialog — the native `<dialog>` element as a modal; the browser does th
- `ui/field`: field
- `ui/icon`: icon — one frame, one button, one rail
- `ui/item`: item — one row: an optional icon, then a name
- `ui/kbd`: kbd
- `ui/menu`: Menu — a `<details>` dropdown template; CSS only, the behavior graduat
- `ui/pagination`: pagination
- `ui/panel`: panel
- `ui/progress`: progress
- `ui/row`: row
- `ui/scale`: scale
- `ui/section`: section — a subtle wrapper that names itself on hover
- `ui/stats`: stats
- `ui/table`: table
- `ui/tags`: tags
- `ui/timeline`: timeline
- `ui/toolbar`: toolbar
- `ui/tooltip`: Tooltip — a hover bubble; three plain spans and a stylesheet, no JS at
- `ui/tree`: Tree — icon + text rows, indented once per nesting level; a sidebar fo
- `ui/words`: Config words — `ui-contrast` and `ui-compact`, two classes that re-ski
- `util`: Util — small plain helper functions: is, source, markup.
- `util/is`: is — fifteen one-line type checks, all booleans, so `View.append()` an
- `util/markup`: markup — an element's children as readable HTML source, for anyone sho
- `util/source`: source — a function's body as readable text, for every example and met
- `ux`: UX — the behavior tier: `ui/` hands you markup, `ux/` hands you a clas
- `ux/Auth`: Auth — login, signup, reset and a social row, as one class
- `ux/Browse`: Browse — one list-and-detail view: a resizable list on the left, the r
- `ux/Card`: Card — the look of an AI card's own page: a head, an outline, a proper
- `ux/Content`: Content — cards that remember: Question, Decision, Quotation, Disclosu
- `ux/Content/catalog`: Card catalog — every kind of box, drawn live
- `ux/Content/Concepts`: Concepts — what this page is made of, as icon tiles
- `ux/Content/Decision`: Decision — an ask, options with caveats, one chosen and changeable
- `ux/Content/Disclosure`: Disclosure — a title that opens into a section
- `ux/Content/Object`: Object — show a real object instead of explaining it
- `ux/Content/plan`: Card plan — how 75 kinds of box shrink to 36
- `ux/Content/Question`: Question — an ask, a text field, the latest answer beneath
- `ux/Content/Quotation`: Quotation — one owner prompt: words, time, how, and a link
- `ux/Content/Spend`: Spend — dollars over time, in about 100 lines of SVG
- `ux/Content/structure`: Structure: words drawn as a picture
- `ux/Course`: Course — chapters of lessons: a rail, a reading column and a next-up c
- `ux/Dictate`: Dictate — a mic button that always shows what is happening
- `ux/Dictate/playground`: The dictation playground — a full-bleed, live diagram of a dictation s
- `ux/Dictate/surfaces`: Surfaces — every voice and chat surface on one page
- `ux/Dictate/variants`: Dictate variants — the same mic, a different look (or, once, a differe
- `ux/Filter`: Filter — a segment + search class that drives several regions at once
- `ux/Hotkeys`: Hotkeys — one flat list of every hotkey in the app, filterable, rebind
- `ux/Inbox`: Inbox — a rail of page previews beside the page you picked, and nothin
- `ux/Menu`: Menu — a `<details>` menu you can extend: `ui/menu`'s one line, opened
- `ux/Objects`: ux/Objects
- `ux/Pagination`: Pagination — a page row you can extend: `ui/pagination`'s number, reme
- `ux/Popover`: Popover — one popup, anchored to a trigger, that never fights a z-inde
- `ux/Rename`: Rename — tap a title, Rename it, pick from a dropdown of 5
- `ux/Revise`: Revise — text in, revised text out, at a level
- `ux/Tags`: Tags — a chip row you can extend: `ui/tags`'s × and field, wired
- `ux/Tree`: Tree — nested rows you can open, drag and drill into. One class; every
- `ux/Tree/drag`: Drag
- `ux/Understand`: Understand — a ✓ or ? after every sentence, a clarifying question righ
- `ux/Wizard`: Wizard — the generic multi-step engine, for lessons, courses and signu
- `versus`: Versus — how this framework compares with other choices.
- `Servex`: the agent system: roles, spawning, the heartbeat, merge and review
- `Server`: the dev server and its node scripts

## Answer

Your final message is ONLY a JSON array, one object per ask, same ids, nothing else:

```json
[{"id":"abc1234567","sort":"task|done|obsolete|note","module":"ext/Refine","title":"for a task","note":"for a note","evidence":"see above"}]
```

## The 25 asks

1. `83b2c033e1` (10 days old, refined, filed under ai/sessions): Consider one name for the sessions tab used consistently in the VS Code sidebar and on the phone
   an earlier check said: No single agreed name for the sessions tab found; the expected doc/ui/views.md path does not exist under public/framework/ai/doc/ui/.
2. `5ac368e087` (10 days old, refined): Investigate why the sessions page is laggy under real-time streaming and report on performance with thousands of sessions
3. `fffc8104c7` (10 days old, refined, filed under ai/sessions): Check how sessions are indexed and whether indexing is correct
   an earlier check said: Indexing code exists (public/framework/ai/AISession/AISessionIndex.mjs) and was changed in 364e8940c 'Sessions: title from the index for rows sessions.json lacks', but no check of indexing correctness was recorded.
4. `ff81c3fefe` (10 days old, refined, filed under ai/sessions): Surface stored session information that is not shown in the table, without redoing the task and session audits
   an earlier check said: no named list of stored session fields to surface; the sessions table columns are defined in AISessionsPage.WIDTHS, and no target field is named
5. `57dacfd063` (10 days old, refined, filed under ai/sessions): Look into the night mastermind session that has been running for several days
   an earlier check said: No repo record of the night mastermind's live runtime state was found; the ask needs a live check of the running session.
6. `24ec28f89d` (10 days old, refined): Clarify the unfinished question 'Are you able to...'.
7. `14749e1602` (10 days old, refined): Never cause errors or clobber a user's session while they browse the live site.
8. `63f49a7e88` (10 days old, refined): Build a layout system so the pages use the right layouts in the right places and stop looking bad.
9. `a9e07c29e8` (10 days old, refined, filed under ai/sessions): Check whether the sessions cost breakdown is current and accurate.
   an earlier check said: Cost breakdown code path not found; AISession.js:31-32 has model prices (haiku-5-5 marked verified:false), and no record of a current check against real data was found.
10. `3a72a31aa0` (10 days old, refined, filed under ai/sessions): Remove the 'All sessions' back button on the detail page; the close button already returns to the sessions page.
   an earlier check said: (claimed done, but no path in the evidence exists in the repo) rg 'All sessions' public/framework/ai/AISession: only AISessionsPage.js:113 - "One clickable trail: All sessions / 2026 / October / 13" (a comment on the grid's own trail); no back button text in AISessionDetail.js
11. `3a5903dc42` (10 days old, refined, filed under ai/sessions): Remove the top line that repeats the session ID and links to 'AI session detail.js', keeping the ID as the page title.
   an earlier check said: AISessionDetail.js title exists, but the removed top line that repeated the ID is not located; no 'AI session detail' link text remains under public/framework/ai/AISession/
12. `48a22399cb` (10 days old, refined, filed under ai/sessions): Fix the page load error that appears after refresh.
   an earlier check said: the ask names no error text or page; no error-after-refresh fix is found in public/framework/ai/sessions/
13. `6b99150116` (10 days old, refined): Give every chat area a text input, microphone, and settings gear with the same experience
14. `f93dccbe9c` (10 days old, refined): Microphone icons run through the prompt refinement system
15. `6b90867197` (10 days old, refined): Put raw transcribed text into the input for now
16. `8134e44223` (10 days old, refined): Use a plain text input rather than a growing text area, scroll behaviour to be decided
17. `db319ed23a` (10 days old, refined): Build prompt refinement into the transcribe widget everywhere, showing a rough raw reference while transcribing
18. `adf8264f20` (10 days old, refined): Decide whether raw or cleaned text is sent, and whether cleaning happens before the bubble
19. `d6e6f7b5bf` (10 days old, refined): Chat bubbles show the clean transcription, possibly paragraphed
20. `315a037c4d` (10 days old, refined): Avoid wall-of-text bubbles from raw transcription, possibly via real-time refinement
21. `d6fad801d8` (10 days old, refined): Never keep two similar but different systems with redundant data; consolidate them.
22. `50895c9f4a` (10 days old, refined, filed under ai/sessions): Consider making the right sidebar scroll independently.
   an earlier check said: public/framework/ai/sessions/sessions.css:43-47 says 'One scroller: the page column scrolls' and sets overflow visible for panel2 bodies, which is a decision against independent scrolling, not a record of it. No right-sidebar scroll rule found.
23. `afdc30ec2b` (10 days old, refined, filed under ai/sessions): Check the chat bubble link to refine haiku live; it may be malformed or still point to the old style.
   an earlier check said: No refine link found in public/framework/ai/AISession/*.js (grep haiku, case-insensitive, hits only pricing and PromptLog comments). AISessionDetail.js is not at the path the brief names, so the chat bubble link could not be checked.
24. `6cab9e0155` (10 days old, refined, filed under core/Page): Page settings must persist properly
   an earlier check said: core/Page/settings/settings.js:1-11 defines page_settings with a settings.jsonl sibling; 'persist properly' has no test
25. `aff23570a5` (10 days old, refined): Keep past-work lookups brief so context is not polluted
