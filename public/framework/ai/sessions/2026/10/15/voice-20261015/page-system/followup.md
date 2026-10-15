# Page system: follow-up answers (2026-10-15)

Answers to the page questions in [ask-0f679acf.md](../ask-0f679acf.md), from the code and git. Haiku sub-agents did the reading; each claim below was spot-checked at the file and line given. The first check is in [report.md](report.md).

## The answers, one line each

1. **page.js, page.jsonl, page.json:** `page.js` is a page written as code and is still the main form (1,503 tracked). `page.jsonl` is a page written as a log (919 tracked, 882 of them under `ai/`). `page.json` is a static JSON tree read only by `Page.from()`; there are 12 copies, and inside `framework/` it is used by one demo (`Section.from()`, `core/Section/page.js:45`), so it is a niche form, not current practice.
2. **How a parent knows its subpages:** mostly by name, from `children:` (349 `page.js` files). A jsonl parent also links a child from a `{"file":"kid/page.jsonl"}` line. `files.jsonl` is read only when a page says `children: "… auto"` (6 pages). Anything undeclared is found by `route()` or by trying to import its `page.js`.
3. **A whole subpage inside page.jsonl:** yes. A `{"tab":{"name":"notes",…}}` line makes a child page with no folder of its own. Later lines reach it by name (`{"notes":{"content":{"add":…}}}`), and list items are reached by id, never by position, so a reorder does not break later lines.
4. **Battle-tested?** Partly. Tab subpages are used on 5 real pages, and top-level list moves are used on real pages. No test covers a tab subpage or a list change inside one.
5. **Readmes for a fresh owner:** the readme now indexes every subfolder, and 4 stale facts are fixed (merge `85f15281c`). Still missing, and too big for a one-line fix: a class map, a "you own this module" start section, and a link to [core/Router](/framework/core/Router/) (table D).
6. **Work, graded from git:** [Server/ModuleLog.mjs](/Server/ModuleLog.mjs) (the per-module log the AI-systems agent landed today) grades 216 items under `core/Page` since 09-01: 27 landed and committed, 1 committed but never closed, 11 never started, and 177 commits tied to no task. That last number is the real gap (table E).

---

## A. The three file names

| file | what it is | loaded by | tracked (all / under ai/) | status |
|---|---|---|---|---|
| `page.js` | a module whose default export is a Page | `Page.load()`: `import(url + "page.js")` (`Page.class.js:455`) | 1,503 / 262 | current, the main form |
| `page.jsonl` | a log: line 1 builds the page, each later line is one `page.set()` | `PageJsonl.load()` (`Jsonl.js:26`); written by the page tools (`Servex/pages.js`) | 919 / 882 | current; the form agents and tools write |
| `page.json` | a whole page tree as one static JSON object | `Page.from()` → `read_json(url + "page.json")` (`Page.class.js:474`) | 12 / 2 | niche: the `core/Section` demo (`Section.from()`, `core/Section/page.js:45`), `imagine/cms/json/`, `imagine/paging/made/`. `imagine/paging/make/page.js:79` explains why it does not use `Page.from()` |

`files.jsonl` is not a page. It is each folder's file list, written by the dev server (`Server/plugins/PageFiles.js:252`). On 09-29, 1,504 list-only `page.jsonl` files were renamed to it (`80a7c5cba`).

## B. How a parent learns its children

| way | example | code | how common |
|---|---|---|---|
| names in `children:` | `children: "start faq versus"` | `Page.class.js:291-317` | 349 `page.js` files |
| array or object | `children: [{name, title}]`, `children: {faq: {…}}` | `Page.class.js:291-317` | rare; data pages |
| a function (data children) | `children(){ return fetch(…) }` | `Page.class.js:281`, `355-358` | 2 pages ([doc/data-children.md](/framework/core/Page/doc/data-children.md)) |
| `auto` | `children: "… auto"` | `Page.class.js:286-288` → `Page.listing()` reads `files.jsonl` | 6 pages; the only use of `files.jsonl` for discovery |
| a jsonl parent's file line | `{"file":"kid/page.jsonl"}` | `Jsonl.js:80-86` (`child_file` → `child_kinds`) | every jsonl parent |
| `route(name)` / trying `page.js` | anything undeclared | `Page.class.js:378`, `393` | the fallback; the order is in [doc/loading.md](/framework/core/Page/doc/loading.md) |

`page.children` (a Map) and `page.pages` are still two names for the same children; the plan to retire `children` is open ([doc/content.md](/framework/core/Page/doc/content.md)).

## C. A subpage inside page.jsonl, deltas and lists

| what | line shape | code |
|---|---|---|
| make a tab subpage (no folder) | `{"tab":{"name":"notes","title":"Notes","content":"…"}}` | `Jsonl.js:100-124`: `page.add(name, data).from_tab = true` |
| change its state | `{"tab":{"name":"notes","disabled":true,"order":3}}` | repeat lines for one name merge (`Jsonl.js:105`) |
| add to its content | `{"notes":{"content":{"add":{…}}}}` | `Item.get()` walks one name per level (`Item.js:152-163`) |
| move or remove a list item | `{"content":{"move":{"id":"c1","after":"c2"}}}` | `List.find(id)`: by id, never by index (`List.js:112`) |

**Battle-tested?** Partly.

| evidence | covers |
|---|---|
| `Servex/agents/page_tools.test.mjs` | folder subpages (`pages.add`) and top-level list move and remove; **no tab subpage** |
| `core/Item/Item.test.mjs`, `core/Page/Template/Template.test.mjs` | field collisions; templates; no nested lists |
| 5 real pages with tab lines: [ai/log](/framework/ai/log/), [ai/system](/framework/ai/system/), [core/Page/tool](/framework/core/Page/tool/), [core/Page/settings](/framework/core/Page/settings/) and its `normal/` | tabs made and changed in real use |
| `ai/sessions/2026/10/03/cards/now/page.jsonl` | repeated id-based moves on one list |

**The gap:** nothing tests a list change inside a tab subpage, and no real page does one. Also, a tab's `content` is plain text unless parts are added (`Jsonl.js:115`), and a tab already open in a browser does not see a newly created folder until reload ([doc/architecture.md](/framework/core/Page/doc/architecture.md), Open).

## D. Readmes: what a fresh "you own core/Page" agent still lacks

**Fixed and merged** (`85f15281c`, docs only): five unlisted subfolders (`ai`, `card`, `ext`, `jsonl`, `old`) are now indexed; the split-plan line now says the file is 721 lines; the `page.js` count is current; a wrong line reference in `words.md`; and the type of `page.unknown` in `jsonl.md`.

**Still missing (each needs more than one line, and the readme is at its 100-line limit):**

| gap | why it matters | suggested home |
|---|---|---|
| a class map: 23 `.js` files, of which the readme names 3 | an owner can't tell `Reader`, `Jsonl`, `Listing`, `Children`, `Frame`, `PageContent` and `PageInbox` apart without reading code | one table in `doc/architecture.md`, linked from the readme |
| a "you own this module" start section: the inbox (`core/Page/inbox.jsonl`), the expert (`expert.json`), open asks ([doc/asks.md](/framework/core/Page/doc/asks.md)), the work log (`node Server/ModuleLog.mjs public/framework/core/Page`), the tests and how to run them | today these are scattered or missing | a short `doc/owner.md`, linked from the readme |
| no link to [core/Router](/framework/core/Router/) | the router and the Page loader split one job; the readme never says where that line is | the "How a page loads" line |
| `make/` and `tools/` have no readme | `make/` is a set of demos and `tools/` is scripts; neither says so | one line each in their folders |
| three separate "Notes:" lines | they could be one line, which frees space under the limit | readme |
| `api.md` links point to `/api/…`, but the files are in `doc/method/` and `doc/property/` | possibly broken links (the SPA answers 200, so a curl can't tell) | check in a browser |
| `indexing-2026-10-08.md` names `ai/2026/page.jsonl`, which does not exist | stale | the doc |

## E. core/Page work, graded from git

**Two computed views.** [Server/ModuleLog.mjs](/Server/ModuleLog.mjs) is the module log system ([output, by week](modulelog-core-Page.txt)). [ledger.md](ledger.md) is a one-off cross-check by task name and commit hash ([ledger.mjs](ledger.mjs)); use ModuleLog going forward.

| bucket | ModuleLog (since 09-01, path-based) | ledger cross-check (task names, all dates) |
|---|---|---|
| landed, and its commit is on `michael/dev` | 27 | 32 verified; 99 more landed but name no commit |
| committed, never closed | 1 (framework-home/minion-build) | 5: page-templates/build, page-ai-api/build, page-templates-merge, page-tools (landed `e756032e`, no landing line), sessions-next |
| committed but not on dev | — | 2 unclosed + 4 "landed": **`Property.of` (`494fb8735`)**, page-on-item, ai2-real-pages, page-drawer, inbox-ext |
| never started | 11 (inbox-ranking, related-sidebar, link-tracking, paging-explorer, …) | 11 (page-audit crawl and design, inventory-audit, page-files-log/readers, …) |
| commits tied to no task | 177 of 216 | — |

**What this says:** most `core/Page` work cannot be graded by task, because 82% of its commits tie to no task. ModuleLog also grades `inbox-ranking` as never started, even though commit `4bc63ad21` ("Inbox.rank: importance + recency") did that work. So ModuleLog's commit-to-task join still needs work. That is the AI-systems agent's tool; this finding is left for it.

**Never started, from the owner's asks** (open items in [doc/asks.md](/framework/core/Page/doc/asks.md), checked 10-12): the Item/List/Content class settlement (255 `.children` readers not migrated); the right-hand related-topics sidebar; a smoke gate that passes; a timer for page work; a weight log of its own for Items.
