# The classes behind the Sessions tab

All of them live in [`ai/AISession/`](../../AISession/) (renamed from `Session*` on 2026-10-08, manifest in `AISession/rename-manifest.json`). One class per file, the file named for the class. `page.js` is two lines: it creates a `AISessionsPage`.

| File | Class | Job |
|---|---|---|
| [`AISession.js`](../../AISession/AISession.js) | `AISession` | The ONE class for a session's data (extends [`core/Session`](../../../core/Session/), which owns the dated folder: `locate`, `scan`, `dir_url`): load, sum costs, process. Same logic on server and client (node:fs is imported lazily). `AISession.View = AISessionView` is attached after the class. See [session-class](session-class.md). |
| [`AISessionsPage.js`](../../AISession/AISessionsPage.js) | `AISessionsPage extends Page` | The tab: header, stats, in-flight strip, filters, grid, the live stream. `route(id)` opens a detail page. |
| [`AISessionDetail.js`](../../AISession/AISessionDetail.js) | `AISessionDetail extends Page` | One session's page (`new AISessionDetail({ home, id })`). Statics load its files. |
| [`SessionStats.js`](../../AISession/SessionStats.js) | `SessionStats extends View` | The sticky stats bar: cost, model, running for, done X of Y; one line on a phone. |
| [`SessionTimeline.js`](../../AISession/SessionTimeline.js), [`SessionTimelineRows.js`](../../AISession/SessionTimelineRows.js) | `SessionTimeline`, `SessionTimelineRows (statics)` | The Timeline tab (rows built with no DOM by `SessionTimelineRows`); its `Tail` also feeds Coverage. |
| [`SessionOutlineView.js`](../../AISession/SessionOutlineView.js), [`SessionOverview.js`](../../AISession/SessionOverview.js), [`SessionWork.js`](../../AISession/SessionWork.js), [`SessionPopover.js`](../../AISession/SessionPopover.js) | the Overview, Board and Tasks tabs, and the one popover | Overview groups by child session; Board is four cards; Tasks is a grid ([`SessionTasksGrid.js`](../../AISession/SessionTasksGrid.js): DataGrid + Filters ▾ + a Nested chip for `SessionWork`); every menu uses `SessionPopover.open`. |
| [`AISessionView.js`](../../AISession/AISessionView.js) | `AISessionView extends View` | One grid row. Statics draw the cost cell and the detail section. |
| [`AISessionRows.js`](../../AISession/AISessionRows.js) | `AISessionRows (statics only)` | The data: fetch, merge, sort, nest, totals. Draws nothing. |
| [`AISessionTrace.js`](../../AISession/AISessionTrace.js) | `AISessionTrace (statics only)` | The cost chart, the per-tool table, the waste checks, the spawn section. |
| [`AISessionLive.js / AISessionFollow.js`](../../AISession/AISessionLive.js) | `AISessionLive, AISessionFollow` | The socket feed for today's rows, and one session's live tail. |
| [`AISessionIndex.mjs`](../../AISession/AISessionIndex.mjs) | `AISessionIndex` | Server only. The single in-memory writer: snapshots, day composites, month and year totals. |
| [`AISessionTailer.mjs`](../../AISession/AISessionTailer.mjs) | `AISessionTailer, AISessionSub` | Server only. Starts the index in the dev server and pushes changed snapshots to subscribed pages. |
| [`AISessionAudit.mjs`](../../AISession/AISessionAudit.mjs) | `(functions)` | Server only. The independent recompute path: its own parser on purpose, so it can check AISession's rolling totals. |

Helpers are statics (`AISessionRows.merge(...)`), not loose functions. The Dashboard's Sessions tile reuses `AISessionView` and `AISessionRows.merge`.

## What clashed with Page and Item

Converting the old object config into a class found no clash for the names this page adds. One to avoid: `Item.root()` is a method, so `AISessionDetail` calls its parent `home`, not `root`. Two details that are not name clashes but bit during the conversion:

- `View` runs `prerender()` inside its constructor, before a subclass's class fields exist, so `AISessionView` sets its tag and class with getters (`get tag()`), never `tag = "a"`.
- A `Page` subclass takes its defaults in its constructor (`super({ title, width, ... }, ...args)`), so the caller's options still win.

Old exports and where they went: `row_view` is `new AISessionView(...)`; `merge`, `get_json`, `sort_rows`, `role_label`, `display_name` and the rest are `AISessionRows.*`; `trace_chart_svg`, `waste_flags`, `trace_table_rows` are `AISessionTrace.chart_svg`, `.waste_flags`, `.table_rows`; `session_page()` is `AISessionDetail`.

## Names considered and rejected (2026-10-08)

- **`Session`**: ambiguous. `ext/Session` is the voice/chat session; this is the AI work session record.
- **`SessionRecord`, `SessionStore`**: the class also sums, audits and draws; a record or a store names only one of those.
- **`ServerSession` / `ClientSession`**: two copies. There is one class that runs in both places.
- **`AISessionTail`**: `Tailer` says what it is.

Old import paths (`sessions/Session*.js`, `Server/SessionIndex.mjs`, `Server/session-cost.mjs`, `Server/plugins/SessionTail.js`) are one-line shims for one release, then deleted.
