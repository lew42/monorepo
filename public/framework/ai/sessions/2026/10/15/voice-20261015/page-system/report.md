# Page system: first check (2026-10-15)

Six questions about [core/Page](/framework/core/Page/), its router, `page.js` / `page.jsonl` and [ext/JSONL](/framework/ext/JSONL/), answered from the code, git and one headless browser run. Facts only, no edits outside this folder. Asked in [ask-c210e092.md](../ask-c210e092.md).

## The answers, one line each

1. **Are the Page docs current?** Mostly. 15 of the 54 docs were checked: the main ones are correct (loading, streaming, architecture, content, composition, storage, watch-out). The problems are 13 small ones: 6 line references point into the old 2,270-line `Page.class.js`, which is now 721 lines; `api.md`'s links go to `/api/` instead of `doc/method/`; and there are a few wrong counts (table A).
2. **Abandoned page tasks?** 9 page tasks from the last 14 days have no landing line (table B). Most of their work did land through a parent task. Two real loose ends: **`Property.of` is still not on `michael/dev`** (commit `494fb8735`, branch `michael/property-of`), and the `framework-home-grids` task was stopped by the owner and never closed. The heartbeat also keeps adding a "stopped on purpose" line to stopped tasks every few hours.
3. **Is a session's log streamed with the same code as page.jsonl?** Half of it is. The session page [already extends Page](/framework/ai/AISession/) (`AISessionDetail.js:23`), and its own `page.jsonl` (cards, words) streams through the same `live()` and server `Tail` as any page. The transcript itself does not: it lives outside `public/`, which `Tail` refuses, so it is **polled every 250 ms** with HTTP Range requests (`AISessionFollow.js:12, 28, 55`). Its lines are SDK messages, not `page.set()` lines (table C).
4. **Does the old page.js pattern still work and is it still made?** Yes to both. Every page.js page tested renders, and 1,503 `page.js` files are tracked against 919 `page.jsonl`. Outside `ai/`, new pages are still mostly `page.js` (22 vs 8 this week); inside `ai/`, `page.jsonl` dominates (241 vs 6), because session and card pages are written by tools (table D).
5. **Does the router read files.jsonl to choose between page.js and page.jsonl?** No. It imports `page.js` one level at a time and only checks a folder list that is already loaded (`Page.class.js:361-397`). A depth-8 task URL costs **about 10 requests for the router walk**, out of about 1,000 requests for the whole page load. The other ~990 come from the AI shell (612 scripts, the board, cards, `tasks.json` 5 times, and the frozen 6.8 MB `directory.json` 3 times) (table E).
6. **Is there a System class that could own framework/ai?** Yes: [ext/System](/framework/ext/System/) (`System`, with `check()`, `heal()` and `report()`), and an `AISystem` with `root = "public/framework/ai"` already exists (`ai/AISystem.js`). It is not in `Systems.modules`, though, and nothing runs `Server/systems-beat.mjs` on a schedule, so today it is idle. It checks files; it is not a Page and owns no URL (table F).

---

## A. Stale doc claims (`core/Page/doc/`, checked by three Haiku readers)

| doc | claim | what the code shows |
|---|---|---|
| readme.md | `split-plan.md`: "why the file is 2,270 lines" | `Page.class.js` is 721 lines; the split happened |
| how-a-page-renders.md | "about 1,100 files" are `page.js` | 1,503 tracked `page.js` (1,242 outside `ai/`) |
| api.md | links like `/framework/core/Page/api/child/` | pages live at `doc/method/child.md`, `doc/property/` |
| api.md | "was Page.class.js line 1122", "line 1189" | the file is now 721 lines; the comments moved 2026-10-12 (`doc/comment-plan.md:59,61`) |
| words.md | "was Page.class.js line 674", "line 777" | same; `comment-plan.md:44,47` |
| words.md | `generator/page.js:261` for `type()` | now `generator/page.js:235` |
| jsonl.md | `page.unknown` is a `Set` | an Array: `Page.class.js:193` |
| indexing-2026-10-08.md | `ai/2026/page.jsonl` holds file deltas | that file does not exist; `ai/sessions/2026/09/cards/page.jsonl` does |

Checked and current: loading.md, streaming.md, architecture.md (23 claims), composition.md, server.md, content.md (12), data-children.md (7), watch-out.md, storage.md. **Not checked** (history-heavy, 145 KB): decisions.md, columns.md, css.md, and the 30 smaller docs.

## B. Page tasks with no landing line, 2026-10-01 → 10-15

Computed by a node scan of every `task.jsonl` under `ai/sessions/2026/` (58 unlanded tasks touch pages loosely; these are the 9 whose name or agent is page work).

| task | stopped how | its work |
|---|---|---|
| [page-templates/build](../../../12/session-87bec773/page-templates/build/), past-work, merge | stopped by their mastermind | parent `page-templates` landed |
| [page-templates-merge](../../../12/session-ceb73541/page-templates-merge/) | stopped by mastermind-page-templates | parent landed |
| [page-templates-binding-merge](../../../12/session-21449a90/page-templates-binding-merge/) | stopped by mastermind-page-templates | `binding.md` is on dev; **`Property.of` (`494fb8735`) is NOT** |
| [page-ai-api/build](../../../12/session-cb7ffa45/page-ai-api/build/) | stopped by its mastermind | parent landed |
| [page-mastermind/streaming-doc](../../../09/session-060cdfff/page-mastermind/streaming-doc/) | stopped by its mastermind | parent landed |
| [page-tools](../../../02/page-tools/) | its log says "LANDED e756032e", but there is no `landed_at` line | `e756032e` is on dev; only the landing line is missing |
| [page-extends-item/item-core](../../../02/page-extends-item/page-extends-item/item-core/) | TaskLoop escalated | parent landed |
| [framework-home-grids](../../../03/framework-home-grids/framework-home-grids/) (2 subtasks) | stopped by the owner 10-03 | **parent never landed** |
| [framework-home/minion-build](../../../02/framework-home/minion-build/) | went quiet after "all fixes committed" | parent landed |

## C. Session log vs page.jsonl (Haiku trace, spot-checked)

| step | page.jsonl | session page | same code? |
|---|---|---|---|
| class | `Page` + `PageLogReader extends Item.Store` (`Reader.js:4`) | `AISessionDetail extends Page` (`AISessionDetail.js:23`) | the page: yes |
| own log reader | `Reader.for(url + "page.jsonl")` (`Jsonl.js:27`) | `SessionPageLog extends JSONL` (`AISessionDetail.js:363`) | no: a second reader |
| socket subscribe | `ext/JSONL/live.js:77` | the same (`JSONL.js:49`) | yes |
| server tail | `Server/plugins/SocketServer/Tail.js` | the same | yes |
| **transcript** | n/a | `AISessionFollow` polls `/ai-logs/<id>` every 250 ms with HTTP Range (`AISessionFollow.js:12,28,55`) | **no: a poll** |

**What would differ if the session page read its transcript as a page log:** (1) the file sits outside `public/`, and `Tail.js` only follows `.jsonl` files under `public/` (`Tail.js:8`), so the server needs a tail that is allowed outside `public/`, or a mirror inside it; (2) a transcript line is `{type, message, …}`, not a `page.set()` line, so it needs a translator (`AISession.apply_line` is already one); (3) cards would go through `Page.Reader` instead of `SessionPageLog.read()` (`AISessionDetail.js:365-375`), which removes the second reader.

## D. page.js vs page.jsonl added per week (git, every branch, first add)

| week of | page.js (site) | page.js (ai/) | page.jsonl (site) | page.jsonl (ai/) |
|---|---|---|---|---|
| 08-03 | 423 | 0 | 0 | 0 |
| 08-31 | 246 | 7 | 0 | 0 |
| 09-21 | 119 | 90 | 2 | 335 |
| 09-28 | 154 | 87 | 38* | 1,065 |
| 10-05 | 35 | 19 | 12 | 143 |
| 10-12 | 22 | 6 | 8 | 241 |

\* Git counts 1,542 that week, but 1,504 of them were per-folder file lists (`48dcd1903`), renamed to `files.jsonl` the same day (`80a7c5cba`), so they are not counted here. Tracked today: 1,503 `page.js`, 919 `page.jsonl` (only 38 outside `ai/`). Every `page.js` page in the browser run rendered with no page error.

## E. One deep URL, headless (`Server/Browser.mjs`, 4 s settle, own context)

| url | depth | all requests | router walk |
|---|---|---|---|
| `/framework/ai/` | 2 | not counted | `/page.js`, `/framework/page.js`, `/framework/ai/page.js` |
| `/framework/ai/sessions/<uuid>/` | 4 | 981 | + `sessions/page.js`; `route()` then reads `sessions.json`, `session-index.json`, `session-tree.json` |
| `…/2026/10/15/voice-20261015/page-system/` | 8 | 887 | + `task-moves.jsonl`, `task-pages.json`; per task level: `page.js` (404), `task.jsonl`, `requirements.md` (404) |
| `/framework/core/Page/jsonl/full/child/` | 6 | 1,032 | 4 × `page.js`, then `jsonl/page.jsonl` (a declared jsonl child) |

The date levels (`2026/10/15`) cost nothing: `sessions/page.js`'s `route()` claims them. The 404s are expected misses. On every AI page, the shell (not the router) fetched `tasks.json` 4-5 times, `weight.jsonl` 3-5 times, and `/directory.json` (6.8 MB, frozen since 10-09, still read by Markdown.js and the AI rail, as listed in `Server/doc/directory-off.md`) 3 times. Scripts: `ps-c57d/probe2.mjs` in the scratchpad.

## F. The System class

| class | file | root | in `Systems.modules`? |
|---|---|---|---|
| `System` (`name, icon, root, readme, rules, check(), heal(), report()`) | `ext/System/System.js` | — | base |
| `ReadmeSystem` | `ext/System/ReadmeSystem.js` | 4 `system.js` files: `ai/sessions`, `audio/Transcriber`, `servex`, `ext/Refine` | yes |
| `NavigationSystem` | `ext/System/NavigationSystem.js` | site | yes |
| `AISystem` | `ai/AISystem.js` | `public/framework/ai` | **no** |
| `Systems` (manager, `run()` → `ext/System/results.jsonl`) | `ext/System/Systems.js` | — | — |

It is run only by hand (`node Server/systems-beat.mjs`). `organization.md` says it runs hourly, but no TaskLoop or heartbeat wiring was found. `SystemPage` (a Page) shows the results. `RefineSystem` shares the name but is not a `System`.
