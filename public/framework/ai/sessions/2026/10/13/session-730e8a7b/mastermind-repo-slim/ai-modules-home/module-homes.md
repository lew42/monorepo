# Module homes — census (computed by `Server/ModuleHomes.mjs`)

125 modules, 18 record/data dirs. Strictly AI: 15 · uses AI: 6 · not AI: 4 · not a candidate (not in judgments.json, so not AI): 100.

## The AI candidates

| module | AI? | importers | mentions | size | scope line | readme says |
|---|---|---|---|---|---|---|
| `ext/Ask` | strict | 40 | 195 | 199 KB | no | Ask — talk to a Claude Code session from the browser; for pages and tools on the dev server (localhost only) |
| `ext/Chat` | uses | 12 | 160 | 944 KB | no | Chat — a scrolling chat log, composer, and conversation widget |
| `ext/Collab` | strict | 0 | 34 | 56 KB | no | Collab — a mastermind's members through phases to a vote, live, as one object |
| `ext/DesignTool` | uses | 6 | 226 | 3.5 MB | no | DesignTool — measures a layout numerically: what is BROKEN, what is OFF, what is GOOD. For pages, the layout generator, and the site audit — |
| `ext/ErrorLog` | uses | 1 | 8 | 7 KB | no | ErrorLog — a UI error becomes one log line a session can follow |
| `ext/Refine` | strict | 25 | 178 | 2.8 MB | no | Refine — speak one prompt and watch it refine (raw → clean → cards, with flags); plus a saved run shown as a ladder |
| `ext/Research` | strict | 14 | 97 | 109 KB | no | Research — a question dug by several minions into append-only files, rendered live: conclusions first, every claim a card that opens forever |
| `ext/Session` | strict | 5 | 78 | 50 KB | no | Session — one ✦ press is one voice session, answered by a fast and a smart assistant |
| `ext/Shots` | uses | 2 | 22 | 88 KB | no | Shots — the screenshot system: shoot, diff, judge |
| `ux/Card` | strict | 0 | 33 | 65 KB | no | Card — the look of an AI card's own page: a head, an outline, a properties sidebar |
| `ux/Dictate` | strict | 32 | 429 | 3.5 MB | no | Dictate — a mic button that always shows what is happening |
| `ux/Rename` | uses | 1 | 18 | 16 KB | no | Rename — tap a title, Rename it, pick from a dropdown of 5 |
| `ux/Revise` | strict | 0 | 20 | 19 KB | no | Revise — text in, revised text out, at a level |
| `ux/Understand` | strict | 1 | 17 | 18 KB | no | Understand — a ✓ or ? after every sentence, a clarifying question right in the flow |
| `ai/AISession` | strict | 21 | 114 | 256 KB | no |  |
| `ai/AITask` | strict | 52 | 152 | 806 KB | no | AITask — the AI working log, rendered: one task's page, a day's dashboard, the highlights wall the front opens with, and the board over ever |
| `ai/cards` | strict | 18 | 90 | 138 KB | no | ai/cards: one card and what it shows |
| `ai/rail` | strict | 9 | 62 | 315 KB | no | ai/rail: the list on the left, and the data behind it |
| `ai/sessions` | strict | 3 | 821 | 1478.0 MB | yes | Sessions — a data grid of every Claude session, newest activity first |
| `ai/talk` | strict | 0 | 35 | 26 KB | no | Talk — press the mic, talk, see your words |
| `core/Session` | uses | 1 | 17 | 6 KB | no | core/Session |

## Every module

| module | AI? | importers | mentions | size | scope line | readme says |
|---|---|---|---|---|---|---|
| `ext/AITask` | ? | 2 | 171 | 9 KB | no | AITask — moved to [ai/AITask](../../ai/AITask/readme.md) on 2026-10-13 |
| `ext/Ask` | strict | 40 | 195 | 199 KB | no | Ask — talk to a Claude Code session from the browser; for pages and tools on the dev server (localhost only) |
| `ext/catalog` | ? | 1 | 141 | 95 KB | yes | catalog — two arrangements of `previews()` patched onto `Page`, for any index page: `catalog()` pins a rail beside the routed child (read in |
| `ext/Chat` | uses | 12 | 160 | 944 KB | no | Chat — a scrolling chat log, composer, and conversation widget |
| `ext/Classify` | ? | 1 | 11 | 9 KB | no | Classify — a light overlay that shows the layout classes of any container, outlined |
| `ext/Collab` | strict | 0 | 34 | 56 KB | no | Collab — a mastermind's members through phases to a vote, live, as one object |
| `ext/CSSDoc` | ? | 1 | 25 | 14 KB | no | CSSDoc — every CSS rule that lands on one element, read out of the live CSSOM |
| `ext/DataGrid` | ? | 6 | 45 | 3.3 MB | no | DataGrid — one grid for every list of records: a table or a rail of cards, a setting not a class |
| `ext/demo` | ? | 43 | 269 | 259 KB | no | demo — show the code and run it from one source; the site's one example mechanism, for any page that shows a thing |
| `ext/depth` | ? | 1 | 28 | 48 KB | no | depth — a page becomes a 3D scene; `.depth(n)` layers drift as you scroll and lean with the pointer |
| `ext/DesignTool` | uses | 6 | 226 | 3.5 MB | no | DesignTool — measures a layout numerically: what is BROKEN, what is OFF, what is GOOD. For pages, the layout generator, and the site audit — |
| `ext/Doc` | ? | 1 | 229 | 98 KB | no | Doc — a module documented as a page (Overview · API · Docs · Files), each member a real url backed by a `.md` beside it; for anyone writing  |
| `ext/Draggable` | ? | 10 | 88 | 48 KB | no | Draggable — grab-and-move for any View; `Sortable` reorders, crosses lists and nests on one code path |
| `ext/drawer` | ? | 6 | 283 | 2.7 MB | no | drawer — the right rail for context, tools, and assistance beside the page |
| `ext/Dropdown` | ? | 3 | 43 | 23 KB | no | Dropdown — one choice out of a list: a trigger showing its picture and its name, and a list that opens in the top layer, so nothing can clip |
| `ext/editor` | ? | 0 | 105 | 49 KB | no | editor — a drag-and-drop block builder assembled from Item, Sortable, Saver, ext/layout and Panel; a page you visit, not a module you import |
| `ext/ErrorLog` | uses | 1 | 8 | 7 KB | no | ErrorLog — a UI error becomes one log line a session can follow |
| `ext/Figma` | no | 1 | 93 | 10.0 MB | no | Figma — tracks Figma files as JSONL + saved screenshots, so the site can browse every page and rebuild designs without Figma |
| `ext/files` | ? | 9 | 142 | 95 KB | no | files — a tree of real files on disk, fetched, beside the one you clicked; for pages that teach a directory |
| `ext/filesystem` | ? | 28 | 62 | 38 KB | no | filesystem — the DATA behind every file on the site: `FsFile` and `Dir`, plus a link to any of them |
| `ext/grip` | ? | 11 | 87 | 51 KB | no | grip — a rail's resize edge: a strip just inside the edge it drags, and a pill that rides your pointer. No permanent handle. Shared by [`ext |
| `ext/highlight` | ? | 11 | 76 | 120 KB | no | highlight — syntax highlighting on the `code` factory, for every page that shows code |
| `ext/JSONL` | no | 30 | 217 | 106 KB | no | JSONL — append-only `.jsonl` logs the AI blindly appends to, replayed back into object state; the task and day logs under `ai/`, for the das |
| `ext/layout` | ? | 13 | 125 | 78 KB | no | Layout — a toolbar over anything, and a right-hand drawer that *pushes* the page over; for demo and guide pages that let the reader arrange  |
| `ext/markdown` | ? | 44 | 142 | 100 KB | no | Markdown — `md()` for prose and `md.file()` for a whole `.md`, as a View addon; already re-exported from `/app.js` for every page |
| `ext/Mention` | no | 10 | 52 | 55 KB | no | Mention — `#Page` and `@owner` become a small icon + the word, wherever the site renders written content |
| `ext/Omnibox` | ? | 0 | 26 | 7 KB | no | Omnibox — moved into core on 2026-09-06; this directory is a pointer |
| `ext/Panel` | ? | 8 | 343 | 760 KB | no | Panel — chrome for arranging: divide, drag, align, fill and persist regions |
| `ext/panel2` | ? | 2 | 21 | 28 KB | no | Panel2 — standard shipping UI container: header toolbar, main, footer, and side drawers |
| `ext/Query` | no | 7 | 28 | 19 KB | no | Query — ask node for just the rows a page shows |
| `ext/Refine` | strict | 25 | 178 | 2.8 MB | no | Refine — speak one prompt and watch it refine (raw → clean → cards, with flags); plus a saved run shown as a ladder |
| `ext/Research` | strict | 14 | 97 | 109 KB | no | Research — a question dug by several minions into append-only files, rendered live: conclusions first, every claim a card that opens forever |
| `ext/Saver` | ? | 11 | 102 | 41 KB | no | Saver — where a document goes: `save` / `load` / `delete` over one write queue, for anything that persists JSON |
| `ext/Session` | strict | 5 | 78 | 50 KB | no | Session — one ✦ press is one voice session, answered by a fast and a smart assistant |
| `ext/Shots` | uses | 2 | 22 | 88 KB | no | Shots — the screenshot system: shoot, diff, judge |
| `ext/sprawl` | ? | 1 | 19 | 17 KB | no | Sprawl — a wall of big sections that balances its own columns |
| `ext/System` | ? | 9 | 22 | 27 KB | no | System — a generic container for anything we keep in order |
| `ext/tabs` | ? | 8 | 166 | 72 KB | no | Tabs — a bar of links and the panel its children mount into; `this.tabs()` on every `Page`, for pages that flip *between* children |
| `ext/Timeline` | ? | 0 | 57 | 47 KB | no | Timeline — a general h/v timeline (CSS-var positioning, greedy lanes, window bands) for anyone plotting dated items |
| `ext/toc` | ? | 2 | 58 | 44 KB | no | toc — this page's own headings as a right-hand nav, current one marked; for any plain reading page |
| `ui/accordion` | ? | 2 | 39 | 5 KB | no | Accordion — one panel open at a time, with no JS: native `<details>` sharing a `name` attribute |
| `ui/alert` | ? | 0 | 33 | 4 KB | no | alert |
| `ui/avatar` | ? | 5 | 41 | 5 KB | no | avatar |
| `ui/background` | ? | 0 | 25 | 35 KB | no | background — one div behind your content, swappable in a line |
| `ui/badge` | ? | 1 | 40 | 5 KB | no | badge |
| `ui/card` | ? | 0 | 67 | 11 KB | no | card — the one card page |
| `ui/controls` | ? | 0 | 38 | 485 KB | no | controls — one box for every control |
| `ui/crumbs` | ? | 2 | 37 | 5 KB | no | Crumbs — a trail of links above a page, CSS only |
| `ui/datagrid` | ? | 0 | 22 | 7 KB | no | datagrid — the markup for a data-grid table, no JavaScript required |
| `ui/decision` | ? | 2 | 31 | 9 KB | no | decision |
| `ui/dialog` | ? | 0 | 33 | 7 KB | no | Dialog — the native `<dialog>` element as a modal; the browser does the work, this module fixes three CSS traps |
| `ui/field` | ? | 0 | 33 | 4 KB | no | field |
| `ui/icon` | ? | 0 | 14 | 22 KB | no | icon — one frame, one button, one rail |
| `ui/item` | ? | 10 | 37 | 23 KB | no | item — one row: an optional icon, then a name |
| `ui/kbd` | ? | 0 | 38 | 5 KB | no | kbd |
| `ui/menu` | ? | 1 | 39 | 8 KB | no | Menu — a `<details>` dropdown template; CSS only, the behavior graduated to `ux/Menu` |
| `ui/pagination` | ? | 0 | 32 | 5 KB | no | pagination |
| `ui/panel` | ? | 1 | 39 | 4 KB | no | panel |
| `ui/progress` | ? | 0 | 32 | 4 KB | no | progress |
| `ui/scale` | ? | 6 | 15 | 5 KB | no | scale |
| `ui/section` | ? | 1 | 16 | 9 KB | no | section — a subtle wrapper that names itself on hover |
| `ui/stats` | ? | 1 | 41 | 3 KB | no | stats |
| `ui/table` | ? | 5 | 49 | 5 KB | no | table |
| `ui/tags` | ? | 0 | 36 | 4 KB | no | tags |
| `ui/timeline` | ? | 1 | 46 | 6 KB | no | timeline |
| `ui/toolbar` | ? | 0 | 39 | 6 KB | no | toolbar |
| `ui/tooltip` | ? | 0 | 38 | 8 KB | no | Tooltip — a hover bubble; three plain spans and a stylesheet, no JS at all |
| `ui/tree` | ? | 1 | 52 | 23 KB | no | Tree — icon + text rows, indented once per nesting level; a sidebar for layers, navigation, anything with children |
| `ui/words` | ? | 0 | 41 | 17 KB | no | Config words — `ui-contrast` and `ui-compact`, two classes that re-skin everything under them |
| `ux/Auth` | ? | 1 | 45 | 17 KB | no | Auth — login, signup, reset and a social row, as one class |
| `ux/Card` | strict | 0 | 33 | 65 KB | no | Card — the look of an AI card's own page: a head, an outline, a properties sidebar |
| `ux/Content` | ? | 23 | 213 | 322 KB | no | Content — cards that remember: Question, Decision, Quotation, Disclosure |
| `ux/Course` | ? | 0 | 29 | 24 KB | no | Course — chapters of lessons: a rail, a reading column and a next-up card that coordinate |
| `ux/Dictate` | strict | 32 | 429 | 3.5 MB | no | Dictate — a mic button that always shows what is happening |
| `ux/Filter` | ? | 1 | 41 | 27 KB | no | Filter — a segment + search class that drives several regions at once |
| `ux/Hotkeys` | ? | 1 | 22 | 28 KB | yes | Hotkeys — one flat list of every hotkey in the app, filterable, rebindable |
| `ux/Inbox` | ? | 0 | 53 | 30 KB | no | Inbox — a rail of page previews beside the page you picked, and nothing jumps |
| `ux/Menu` | ? | 1 | 42 | 13 KB | no | Menu — a `<details>` menu you can extend: `ui/menu`'s one line, opened up |
| `ux/Objects` | ? | 1 | 8 | 8 KB | no | ux/Objects |
| `ux/Pagination` | ? | 1 | 33 | 11 KB | no | Pagination — a page row you can extend: `ui/pagination`'s number, remembered |
| `ux/Popover` | ? | 2 | 30 | 30 KB | no | Popover — one popup, anchored to a trigger, that never fights a z-index |
| `ux/Rename` | uses | 1 | 18 | 16 KB | no | Rename — tap a title, Rename it, pick from a dropdown of 5 |
| `ux/Revise` | strict | 0 | 20 | 19 KB | no | Revise — text in, revised text out, at a level |
| `ux/Tags` | ? | 1 | 34 | 12 KB | no | Tags — a chip row you can extend: `ui/tags`'s × and field, wired |
| `ux/Tree` | ? | 9 | 108 | 75 KB | no | Tree — nested rows you can open, drag and drill into. One class; everything else is a switch |
| `ux/Understand` | strict | 1 | 17 | 18 KB | no | Understand — a ✓ or ? after every sentence, a clarifying question right in the flow |
| `ux/Wizard` | ? | 9 | 43 | 20 KB | no | Wizard — the generic multi-step engine, for lessons, courses and signup to extend |
| `ai/AISession` | strict | 21 | 114 | 256 KB | no |  |
| `ai/AITask` | strict | 52 | 152 | 806 KB | no | AITask — the AI working log, rendered: one task's page, a day's dashboard, the highlights wall the front opens with, and the board over ever |
| `ai/cards` | strict | 18 | 90 | 138 KB | no | ai/cards: one card and what it shows |
| `ai/classes` | ? | 0 | 18 | 4 KB | no |  |
| `ai/council` | ? | 0 | 39 | 67 KB | no | ``` |
| `ai/dashboard` | ? | 0 | 38 | 23 KB | no | Dashboard — a grid of live previews, stalled first |
| `ai/doc` | ? | 0 | 198 | 2.1 MB | no | AI system docs: the index |
| `ai/local` | ? | 0 | 22 | 27 KB | no | Local Models — talk to a model running on this machine's own GPU |
| `ai/models` | ? | 0 | 5 | 21 KB | no | Models: which agent runs on what |
| `ai/process` | ? | 0 | 14 | 4 KB | no |  |
| `ai/quick-fix` | ? | 0 | 22 | 13 KB | no | Quick fix |
| `ai/rail` | strict | 9 | 62 | 315 KB | no | ai/rail: the list on the left, and the data behind it |
| `ai/review` | ? | 0 | 29 | 36 KB | no | Review questions — every question a fresh reviewer asks, per system, read live from the skills' own rules |
| `ai/sessions` | strict | 3 | 821 | 1478.0 MB | yes | Sessions — a data grid of every Claude session, newest activity first |
| `ai/system` | ? | 0 | 66 | 35 KB | no | System tab: what is here, and what is not |
| `ai/systems` | ? | 0 | 8 | 1 KB | no |  |
| `ai/talk` | strict | 0 | 35 | 26 KB | no | Talk — press the mic, talk, see your words |
| `ai/tests` | ? | 0 | 32 | 149 KB | no |  |
| `ai/v` | ? | 5 | 198 | 660 KB | no |  |
| `core/App` | ? | 6 | 134 | 72 KB | no | App — boot, and the one container pages mount into; a site constructs it once, in `/app.js` |
| `core/Events` | ? | 2 | 11 | 4 KB | no | Events — `on` / `off` / `emit`, a mixin everything else builds on |
| `core/Item` | ? | 10 | 144 | 94 KB | no | Item — an arbitrary persistent thing: an id, a data bag, one `set(delta)`, a place to save, a place to be seen. No children of its own. |
| `core/Layout` | ? | 0 | 120 | 122 KB | no | core/Layout |
| `core/List` | ? | 6 | 82 | 43 KB | no | List — the ordered collection that announces every change |
| `core/new` | ? | 0 | 136 | 1.6 MB | no | core/new — one sketch kept for the record; two deleted 2026-08-30 |
| `core/Page` | ? | 50 | 1230 | 10.4 MB | no | Page — a folder with a `page.js` or `page.jsonl` is a page: a url, some content, and children. |
| `core/Property` | ? | 2 | 16 | 13 KB | no | Property — one live value you can bind to |
| `core/Router` | ? | 0 | 125 | 65 KB | no | Router — everything between "a url changed" and "the DOM reflects it"; for anyone building a page or a link |
| `core/Search` | ? | 0 | 50 | 58 KB | no | Search — the site's corpus and the ranking over it, plus the one search box that fronts it |
| `core/Section` | ? | 1 | 38 | 45 KB | no | Section — a page you put inside a page |
| `core/Session` | uses | 1 | 17 | 6 KB | no | core/Session |
| `core/Shell` | ? | 1 | 30 | 31 KB | no | Shell — five optional regions around a CSS grid: header, left, right, footer, main; put a Shell inside a Shell's main and they nest |
| `core/Sidebar` | ? | 1 | 145 | 149 KB | no | Sidebar — a brand over a TREE of links, resizable by its own edge, over a footer that stays put; the one component `core/` ships, for any pa |
| `core/Task` | ? | 0 | 23 | 16 KB | no | Task — a DOM-free unit of work: id, title, a state machine, a computed duration and progress, a List of subtasks |
| `core/track` | ? | 7 | 19 | 2 KB | no |  |
| `core/View` | ? | 226 | 410 | 94 KB | no | View — a chainable wrapper over one DOM element; every HTML tag is a function that makes one, and a function child fills it (capturing) |
| `web/layout` | ? | 0 | 67 | 20 KB | no |  |
| `web/nav` | ? | 1 | 103 | 1.1 MB | no | /web/nav/ — design record |
