# Page — a folder with a `page.js` or a `page.jsonl` is a page: a url, content, and children

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

**Read [`core/Item/readme.md`](/framework/core/Item/readme.md) first.** This readme assumes you know it.

**One system with Item:** `Page extends Item`, so saving, replaying a log, `set(delta)` and `live()` tailing are the [Item readme](/framework/core/Item/readme.md)'s job; this readme covers what Page adds: a url, routing, parts, layout and the inbox.

`class Page extends Item` (`Page.class.js`, the small files beside it are its parts, listed in [doc/classes.md](doc/classes.md)). A page is built either from code (`page.js`) or from a log (`page.jsonl`); the Router finds it by walking the url one folder name at a time. Its demo and Docs: [/framework/core/Page/](/framework/core/Page/).

**Direction (the owner, 2026-11-07):** every page is live by default. LivePage's header, breadcrumb, settings and card-pages fold into Page or into plugins, as a plan that waits for approval: [doc/live-by-default.md](doc/live-by-default.md).

## The recipe: make a page

```js
// <parent>/hello/page.js
import { Page, h1, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Hello", content(){ h1("Hello"); p("Some text."); } });
```

Then add `"hello"` to the **parent** page's `children:`. A page nobody declares still opens by its url (`Page.child()` imports its `page.js`), but it is missing from the parent's tabs, menus and cards. Agents make pages with the `create_page` tool; load the `page` skill first.

**Then index it, twice:** link the new page from the pages that should point to it (parent, section page, framework page, readmes; be generous), and list its own contents near its top as links. Load it in a real browser before sending the link to anyone. The rule: [`doc/navigation.md`](./doc/navigation.md#when-you-add-a-page-index-it-twice-the-owner-2026-11-01). Planned: an `index.jsonl` per folder so pages can be listed, linked, searched and mentioned without loading them: [`doc/index-jsonl.md`](./doc/index-jsonl.md).

## On disk: a page is a folder, and the folder is its storage

| File | What | Written by | Read by |
|---|---|---|---|
| `page.js` | the page as code (a tiny file: import a class, instantiate it) | a person or builder agent | the browser (`Page.load()`) |
| `page.jsonl` | the page as a log: line 1 builds it, every later line is one `set()` | the page tools (below), `append_log`, `append.mjs`, a browser tab (`Item.Store` → `Append.js`) | `Page.Reader` (`Page.class.js`, `extends Item.Store`) through `PageJsonl.load()` |
| `files.jsonl` | the folder's own file list, `{"file":"x.png"}` per file that appeared or went (a jsonl page keeps its list inside its `page.jsonl`) | `Server/plugins/PageFiles.js`, automatically | `Page.listing()` (tabs, listings); `PageListing.live` → the `files/` tab (`FilesTab.js`) |
| `settings.jsonl` | the page's preferences about itself (e.g. tab weight) | the page tools, `append.mjs` | the parent's tab strip |
| `inbox.jsonl` | notes left on the page (`note`, `inbox`, `note_state` lines) | `page_note`, Servex `/api/inbox` | `PageInbox.js` → the page's Inbox tab ([Inbox](ext/Inbox/readme.md)) |
| `readme.md`, `doc/*.md` | the folder's index and its detail | a person or agent | the `md/` route of every page |
| `directory.json` | the old whole-site list; **off** since 2026-10-09, frozen on disk ([Server/doc/directory-off.md](/Server/doc/directory-off.md)) | nothing | a few old readers |

## How a url becomes a page

The Router ([core/Router](/framework/core/Router/)) calls `page = await page.child(name)` once per folder name. `child()` tries, in order: memory (`this.children`) → a declared `page.jsonl` → the built-in `md/`, `fs/` and `files/` → the page's `route(name)` → a folder's own `readme.md`, when the listing shows no `page.js` ([doc/subpages.md](doc/subpages.md)) → `page.js` → a bare `.md` file → not found (the Router falls back to a real navigation). A declared child skips `route()`. Code and the two traps: [doc/loading.md](doc/loading.md).

**Where a child opens:** a page shows its children as preview cards (`page.previews()`), and a click opens that child's full page in place of the list; the address changes, so Back returns to the list. A page with its own navigation (tabs, a rail) keeps it and the child opens inside it. A linked markdown page follows the same rule. Miller columns are opt-in code: a page that calls `columns()` itself gets them. The rule, the seven ways a page can navigate and their shots: [design/navigation](/framework/design/navigation/readme.md).

**The Files tab:** every page also answers `<url>files/`: this folder's own entries, one level, names only (page folders, folders, files; `_removed/` last, dimmed), with a `Files · N` link at the end of the page. `PageFilesTab` (`FilesTab.js`) reads the list with `PageListing.live` (`Listing.js`): it opens the folder's `files.jsonl` (a jsonl page: its `page.jsonl`) with its own reader, so on the dev server a file made in an editor appears with no reload, and on a static host it is the committed list, read once. On the dev server it also writes (phase 2): `+ Page`, drop or choose files (up to 25 MB, a name clash keeps both as `photo (2).png`), a set-aside button per row that moves a file or page into `_removed/` after an inline confirm, and (phase 3) Rename and Move per row (an inline name box, a "Move to…" folder browser, or drag a row onto a folder row on a desktop): a folder shows a dry-run plan (links that change) first, and every move offers Undo from a manifest in `Server/moves/`; each is one socket message handled by [`Server/plugins/SocketServer/Files.js`](/Server/plugins/SocketServer/readme.md), and the list updates only through the tail. A static host stays read only. A real `files/` folder or page wins, and a Doc page keeps its own Files section (its declared source files) at that url. Opt out with `no_files: true`. Design and the later phases: [doc/files.md](doc/files.md).

## How a line reaches the screen (streaming)

```
writer → appends one line to page.jsonl → dev server watcher → Server/plugins/SocketServer/Tail.js (reads the new bytes)
       → socket frame → ext/JSONL/live.js → Page.Reader → page.set(line) → changed() → the page redraws
```

Opening a page is the same road from offset 0. Off localhost there is no socket: the file is fetched once and nothing streams. Append only, whole lines, validated by `.claude/hooks/jsonl-schema.mjs`; a hand write into a `.jsonl` is blocked by `jsonl-guard.mjs`. The full trip and writers: [doc/streaming.md](doc/streaming.md).

## Who changes a page

- **Agents:** `page_set(path, delta)` is the one tool; `page_add`, `page_call`, `page_log`, `page_note` are aliases for common deltas, `page_read(path)` returns the computed state (never read the raw lines). All in `Servex/agents/page_tools.js` (`page_tools()`), which validates and appends one line; the same six also run in-process as the `local` SDK server ([ai/doc/agents/mcp.md](/framework/ai/doc/agents/mcp.md)). A delta's shape: a plain key sets a property, a method key calls it (`{"content":{"add":{…}}}`), a card id walks into that card. Reference: [doc/ai-api.md](doc/ai-api.md). Watch it work: [tool/](tool/), a page only agents edit (also a tab on this page).
- **A person or the browser:** `page.js` edits; a change made in a tab is queued by `Item.Store` and appended through `ext/filesystem/FsFile.js`.
- **Subpages** are `page.jsonl` lines, never a `page.js` edit: [doc/subpages.md](doc/subpages.md).

## Parts of a page

`content` is a list of parts (heading, text, card), one `page.jsonl` line each: [parts/](parts/readme.md). Templates (one layout, many data rows): [doc/templates.md](doc/templates.md). Binding a view to its data: [doc/binding.md](doc/binding.md). A page whose data lives in node: [doc/server.md](doc/server.md). Pick a layout from the catalog before inventing one: [layout/](layout/). A part's type may also be a registered class that is not an Item: `{"type":"View","content":"Hello world"}` draws a div, built by `Item.foreign` inside the row (`PageContent.js`; LivePage's Block and Focus do the same): [Item readme](../Item/readme.md).

A page's side inset is `--gutter-x: clamp(1em, 4%, 5em)` (`Page.css`; `ext/Doc/Doc.css` restates it, keep the two equal): about 15px at 390 and unchanged from ~700px up. The floor was `2em` until 2026-10-24, when the phone inset was halved at the source rather than with a per-page word.

## Which class

A **List** when something is ordered and watched; an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a url.

## Overlaps

`page.js` vs `page.jsonl` are two ways to make one kind of page ([doc/jsonl-pages.md](doc/jsonl-pages.md)); `AITask`/`TaskPage` are Page subclasses for tasks ([ai/AITask](/framework/ai/AITask/), [core/Task](/framework/core/Task/)); `core/Page/ai/` is the per-page AI view, `ai/` is the AI system's records.

`Page.use(Ext)` (runs `Ext.setup(page)` on every page) is the page-only plugin list; for anything that is not a page, and for anything new, use [core/Plugin](../Plugin/readme.md) (`Host.use`, `attach`/`detach`, a list you can switch off). Moving Page onto Plugin is a follow-up.

Also here: [audit/](audit/) (every page layout in use, most-used first) · [make/readme-page/](make/readme-page/) (a readme as the whole page).

## Folders here

[content-shapes](content-shapes/) · [dynamic](dynamic/) (a parent's `route()` answers a name) · [generator](generator/) (virtual tree from a spec) · [overview](overview/) · [settings](settings/) · [weight](weight/) · [ai](ai/) · [card](card/) · [ext](ext/) (turn a behavior on by name; [Inbox](ext/Inbox/readme.md)) · [jsonl](jsonl/) · [layout](layout/) · [navigation](navigation/) · [parts](parts/readme.md) · [Template](Template/) · [tool](tool/) · [old](old/)

## Map

| File | What it does |
|---|---|
| `Page.class.js` | the class: `class Page extends Item`, `child(name)` (the Router's one hop), `static use(Ext)`, the `page.jsonl` bits (`set`, `file`, `tab`, `place`) |
| `Frame.js` | `PageFrame`: how a page draws itself — rail, tabs, swaps — read with `doc/Frame-notes.md` |
| `Columns.js` | the Finder shape: `page.columns()`, `column(host)`, `render_column(host)` — opt-in Miller columns |
| `Children.js` | the deprecated `page.children` shim (`Map`-shaped view over `page.pages`); remove once the census shows 0 live callers |
| `Reader.js` | `PageLogReader extends Item.Store`: the `Item.Store` for one `page.jsonl`, one per url (`Reader.for`) |
| `Listing.js`, `Listing.test.mjs` | `PageListing`: what `listing()` answers (files, dirs, pages, is-this-a-page, the source file) |
| `Index.js` | `PageIndex`: a parent's children's title, icon and description from their listing lines (one `/api/index` request on the dev server); `Page.from_index`, `?index=0` switches it off ([doc/index-jsonl.md](doc/index-jsonl.md)) |
| `Load.js` | `PageLoad`: the loading statics, each taking the class first; `Page` keeps one-line forwarders |
| `Log.js` | a compat re-export, `PageLog` = `Page` (folded into `Page` 2026-10-03); still imported by `ai/cards/Tasks.js` and `ai/rail/groups.js` |
| `Links.js` | where a clicked link opens, and the `.md`-file helpers it uses (`doc/open.md`) |
| `Jsonl.js` | the `page.jsonl` system object: child linking, the `link_child` helper `Page.class.js:181` calls |
| `FilesTab.js`, `FilesTab.css` | `PageFilesTab`: the `files/` tab UI (list, upload, set-aside, rename/move) |
| `PageAddress.js`, `PageCode.js`, `PageParagraph.js`, `PageContentItem.js` | the three kinds a page's own code/config makes as content (address, code, paragraph), and their shared base (`doc/content.md`) |
| `PageContent.js` | `class PageContent extends List` — the page's `content` list |
| `PageInbox.js`, `PageInbox.css` | notes left on a page (`inbox.jsonl`), drawn as the page's Inbox tab |
| `PageWeight.js` | one weight for anything with a url, an object with `url`, or an object with a number `weight` (`weight/readme.md`, `doc/design.md`) |
| `Prefs.js` | `PagePrefs`: a page's own preferences, with an in-memory fallback when `localStorage` refuses a save |
| `Previews.js` | the cards a page draws for its children (`page.previews()` etc.) |
| `Related.js` | a page's pinned "Related" aside (`page.related_aside()`) |
| `Markdown.js`, `Markdown.css` | a bare `.md` file drawn as a page |
| `object.js` | `page_object(page)`: a live Page instance drawn as a `DefaultView` item tree |
| `words.js` | the six page words, as lists a reader can see (the other half of what `Page.class.js` stamps as classes) |
| `page.js` | the Page class page itself: the live demo and docs at [/framework/core/Page/](/framework/core/Page/) |
| `expert.json`, `page.jsonl`, `task.jsonl`, `failures.jsonl`, `improvements.jsonl` | this folder's own page-tool expert config, its page-as-log data, its task log, its layout-check failures and its skill-improvement notes — one row |
| `*.test.mjs` | `Page.test.mjs` (a real page.jsonl replays; an unknown part type is reported; the item tool refuses a bad line before writing), `Listing.test.mjs` (`PageListing.live` folds real `files.jsonl` lines) |
| `doc/` | 70+ notes — architecture, api, css, navigation, streaming, files, templates, binding, deprecation guides; see "Design" below for the ones that exist. `doc/archive/` holds older, superseded notes |
| `ai/`, `audit/`, `card/`, `content-shapes/`, `dynamic/`, `ext/`, `jsonl/`, `layout/`, `navigation/`, `parts/`, `Template/`, `tool/`, `old/` | linked above, "Folders here" |
| `generator/` | pages without the filesystem: a seed draws a spec string into a virtual tree (`generator/readme.md`) |
| `make/` | the page-builder demos (`make/readme-page/` — a readme as the whole page) |
| `weight/` | `weight.js`/`has-file.js`/`ai-cost.js` — how `PageWeight` computes a number, and the AI cost that rides beside it (`weight/readme.md`) |
| `screenshots/` | dated screenshot dumps from past audits (e.g. `2026-10-12-173251/`); not linked elsewhere, kept for reference |
| `tools/` | `links.mjs` — the links census: for every page on the site, who points at it (`node public/framework/core/Page/tools/links.mjs`) |
| `layout-check/` | empty; reserved for layout-check output, nothing written here yet |

**How it connects**
- `class Page extends Item` (`Page.class.js:34`) → [`Item`](../Item/Item.js), [`List`](../List/List.js) (for `pages`/`content`/`items`)
- The Router's walk, `page = await page.child(name)` (`../Router/Router.js:104`) → `Page.class.js:387`'s `child(name)`, one hop per url segment
- `Page._ext.push(Ext)` / `static use(Ext)` (`Page.class.js:39`) ← every plugin that calls `Page.use(...)` (`doc/architecture.md`)
- Agents call `page_set`/`page_add`/`page_call`/`page_log`/`page_note`/`page_read` → `Servex/agents/page_tools.js`'s `page_tools()` (`page_tools.js:1780`), which validates and appends one line
- `class PageContent extends List` (`PageContent.js:10`) → [`List`](../List/List.js); drawn by `Page.render_content_list()`

**Design:** [`doc/architecture.md`](./doc/architecture.md) (first), [`doc/api.md`](./doc/api.md), [`doc/jsonl.md`](./doc/jsonl.md) ("The store"), [`doc/streaming.md`](./doc/streaming.md) (how a line reaches the screen), [`doc/files.md`](./doc/files.md) (pages as folders, the Files tab), [`doc/navigation.md`](./doc/navigation.md), [`doc/watch-out.md`](./doc/watch-out.md) (traps), [`doc/namespaces.md`](./doc/namespaces.md) (proposal, not built), [`doc/recursive-pages.md`](./doc/recursive-pages.md) (proposal, measured, not built), [`doc/migration-children-to-pages.md`](./doc/migration-children-to-pages.md), [`doc/jsonl-pages.md`](./doc/jsonl-pages.md), [`doc/loading.md`](./doc/loading.md), [`doc/subpages.md`](./doc/subpages.md), [`doc/templates.md`](./doc/templates.md), [`doc/binding.md`](./doc/binding.md), [`doc/server.md`](./doc/server.md), [`doc/content.md`](./doc/content.md) (the three content kinds), [`doc/columns.md`](./doc/columns.md), [`doc/open.md`](./doc/open.md), [`doc/previews.md`](./doc/previews.md), [`doc/design.md`](./doc/design.md) (PageWeight), [`doc/words.md`](./doc/words.md) (the six page words), [`doc/ai-api.md`](./doc/ai-api.md), [`doc/index-jsonl.md`](./doc/index-jsonl.md) (planned, not built), [`doc/live-by-default.md`](./doc/live-by-default.md) (plan, awaits approval), [`doc/readme-before-2026-10-19.md`](./doc/readme-before-2026-10-19.md) (history), [`doc/start-here.md`](./doc/start-here.md), [`doc/storage.md`](./doc/storage.md) and [`doc/storage-slice-1.md`](./doc/storage-slice-1.md) (give `Store` a backend, zero behaviour change), [`doc/css.md`](./doc/css.md) (the arrangement tier, `Page.css`), [`doc/composition.md`](./doc/composition.md) ("a thing has a page; it is not one"), [`doc/declaring.md`](./doc/declaring.md) (the three jobs a parent needs, and the CMS question), [`doc/data-children.md`](./doc/data-children.md), [`doc/class-block.md`](./doc/class-block.md), [`doc/how-a-page-renders.md`](./doc/how-a-page-renders.md), [`doc/labels.md`](./doc/labels.md) (titles, labels, icons), [`doc/markdown.md`](./doc/markdown.md) (every page's `md/`), [`doc/panels.md`](./doc/panels.md) (splitting the height), [`doc/inbox-tab.md`](./doc/inbox-tab.md), [`doc/roles.md`](./doc/roles.md) (how nested pages reference their parent), [`doc/query.md`](./doc/query.md) (finding past work), [`doc/page-tool-2026-10-09.md`](./doc/page-tool-2026-10-09.md) and [`doc/page-js-notes.md`](./doc/page-js-notes.md) and [`doc/Page-notes.md`](./doc/Page-notes.md) (pruned comments, verbatim), [`doc/server-instance.md`](./doc/server-instance.md) (design, nothing built), [`doc/indexing-2026-10-08.md`](./doc/indexing-2026-10-08.md) and [`doc/asks.md`](./doc/asks.md) and [`doc/refined-asks.md`](./doc/refined-asks.md) (the owner's own asks, merged or generated), [`doc/content-list-step-1.md`](./doc/content-list-step-1.md) (step 1 of `content.md`'s design, as built), [`doc/vision.md`](./doc/vision.md), [`doc/readme-full-2026-10-12.md`](./doc/readme-full-2026-10-12.md) and [`doc/readme-moved-2026-10-17.md`](./doc/readme-moved-2026-10-17.md) (earlier readme text, moved out, history only).

## Search terms

The words that find this module's past work (counts: `sessions N files · M commits`, from `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` and `git log --oneline -S '<term>' | wc -l`; raw output in [terms.txt](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps/terms.txt)):

- `page.jsonl` (sessions 1671 files · 1456 commits)
- `page_set` (sessions 451 files · 235 commits)
- `Page.child` (sessions 228 files · 137 commits)
- `Page.use` (sessions 174 files · 30 commits)
- `Router.js` (sessions 138 files · 102 commits)
- `columns()` (sessions 129 files · 141 commits) — the Finder/Miller-columns shape
- `Files tab` (sessions 129 files · 75 commits)
- `create_page` (sessions 106 files · 90 commits)
- `page.pages` (sessions 66 files · 68 commits) — the `page.children` replacement (2026-10-28)
- `PageContent` (sessions 53 files · 68 commits)
- `six page words` (sessions 34 files · 44 commits) — the owner's own phrase for Page's layout vocabulary

## More

Reference: [doc/files.md](doc/files.md) (design: pages as folders, the Files tab, create/drop/move from the UI), [doc/words.md](doc/words.md) (the six page words) · [doc/api.md](doc/api.md) · [doc/jsonl.md](doc/jsonl.md) · [doc/watch-out.md](doc/watch-out.md) (traps) · [doc/migration-children-to-pages.md](doc/migration-children-to-pages.md) (the deprecated `page.children`, and how to move to `page.pages`) · [doc/architecture.md](doc/architecture.md) · [doc/namespaces.md](doc/namespaces.md) (proposal: Page's ~150 methods in groups, not built) · [doc/recursive-pages.md](doc/recursive-pages.md) (every card a page you can open: one address, embedded or own folder, Ref stitches; when a card becomes a folder (proposal) and what a parent loads today, measured) · [doc/start-here.md](doc/start-here.md) (working on this module: inbox, log, tests). The readme as it stood before this rewrite, with the split-out sections and dated notes: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).

## Notes from your asks

- Each page puts its most important content above the fold, at the top, as on the web. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p4776), 2026-10-13)
