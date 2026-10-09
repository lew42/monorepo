# The classes behind the Sessions tab

One class per file, the file named for the class. `page.js` is two lines: it creates a `SessionsPage`.

| File | Class | Job |
|---|---|---|
| [`SessionsPage.js`](../SessionsPage.js) | `SessionsPage extends Page` | The tab: header, stats, in-flight strip, filters, grid, the live stream. Its `route(id)` opens a detail page. |
| [`SessionDetail.js`](../SessionDetail.js) | `SessionDetail extends Page` | One session's page (`new SessionDetail({ home, id })`). Statics load its files. |
| [`SessionView.js`](../SessionView.js) | `SessionView extends View` | One grid row (`new SessionView({ row, url, ... })`). Statics draw the cost cell and the detail section. |
| [`SessionRows.js`](../SessionRows.js) | `SessionRows` (statics only) | The data: fetch, merge, sort, nest, totals. Draws nothing. |
| [`SessionTrace.js`](../SessionTrace.js) | `SessionTrace` (statics only) | The cost chart, the per-tool table, the waste checks, the spawn section. |
| [`Session.js`](../Session.js) | `Session` | The numbers themselves (cost, model, tokens). See [session-class](session-class.md). |

Helpers are statics (`SessionRows.merge(...)`), not loose functions. The Dashboard's Sessions tile reuses `SessionView` and `SessionRows.merge`.

## What clashed with Page and Item

Converting the old object config into a class found no clash for the names this page adds. One to avoid: `Item.root()` is a method, so `SessionDetail` calls its parent `home`, not `root`. Two details that are not name clashes but bit during the conversion:

- `View` runs `prerender()` inside its constructor, before a subclass's class fields exist, so `SessionView` sets its tag and class with getters (`get tag()`), never `tag = "a"`.
- A `Page` subclass takes its defaults in its constructor (`super({ title, width, ... }, ...args)`), so the caller's options still win.

Old exports and where they went: `row_view` is `new SessionView(...)`; `merge`, `get_json`, `sort_rows`, `role_label`, `display_name` and the rest are `SessionRows.*`; `trace_chart_svg`, `waste_flags`, `trace_table_rows` are `SessionTrace.chart_svg`, `.waste_flags`, `.table_rows`; `session_page()` is `SessionDetail`.
