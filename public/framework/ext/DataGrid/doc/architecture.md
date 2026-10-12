# DataGrid — the class architecture

**One grid for every list of records on the site. It draws the same rows two ways, a table or a rail of cards, and which one is a setting, not a new class. The page around it owns the click from a row to its detail.**

Written 2026-10-12, before the build, from the owner's ask in [the brief](/framework/ai/2026-10-12/data-grid/requirements.md): "we don't want to have to create a new class every time we want a little bit different layout."

## The classes

```
class DataGrid extends View          ext/DataGrid/DataGrid.js       the one grid: columns, rows, sort, filter, resize, the view setting
  static Table = DataGridTable       ext/DataGrid/DataGridTable.js  draws rows as a table (a header, one cell per column)
  static Rail  = DataGridRail        ext/DataGrid/DataGridRail.js   draws rows as a stack of cards (one card per row)
  static head(), body(), template()                                 the plain markup (was ui/datagrid)
  static table(head, rows)                                          a small static <table> for prose (was ui/table)

class Page                           core/Page/                     owns the route from a row to its detail, the layout, and the settings
class AISessionsPage extends Page    ai/AISession/                  the Sessions page: its data feeds and route(id); draws a DataGrid
class AISessionView extends View     ai/AISession/                  one session drawn: its table cells, and (new) its card
```

- **DataGrid** is the system. It holds the columns, the rows, the sort and the filters, and it picks a drawer from its `view` setting.
- **DataGridTable** and **DataGridRail** are drawers. Each one has one job: given the rows, draw them. A third look (a board, a gallery) is a third drawer, never a second grid.
- A drawer asks the grid's own hooks what to draw for one row: `cells(row)` in a table, `card(row)` on the rail. A page that needs its own look for a row passes those two hooks (Sessions passes `AISessionView`), so it never subclasses DataGrid for a layout.
- Every row is a link: `href(row)`. The grid knows nothing more about the detail.

## Is preview → detail part of DataGrid, or of Page?

**Page.** The grid only makes each row a link to `<page url>/<row id>/`. The page's `route(id)` builds the detail, and `columns()` opens it beside the list (`core/Page/doc/columns.md`). This is already how the AI inbox works ([ux/Inbox](/framework/ux/Inbox/): "the selection is the URL"), so Back, reload and a pasted link all work, and the same click works from a table row, a rail card, a search result or a mention.

A data grid is just another kind of page content. A page can change its layout, background and colour scheme with its own words (`width`, `background`, `surface`), and a page can be drawn as a card inside another page (`preview_card`). DataGrid adds nothing to that list.

## The view setting: where it lives, how it persists

`view` is `"table"` or `"rail"`. The most specific answer wins:

1. **The url** — `?view=rail`. A view a click reaches has its own address, so a reload or a shared link lands in the same place.
2. **The reader's last toggle** — saved by `PagePrefs` (`core/Page/Prefs.js`, localStorage, keyed by the page's url). Personal, never committed.
3. **The page's own default** — a `{"settings":{"view":"rail"}}` line in the page's `settings.jsonl` (or `page.jsonl`). Committed, so it is the same for everyone. **The owner's drawing picks this line**; the toggle stays either way.
4. **The code's default** — `view: "table"`.

Column widths are a reader preference too: a drag saves to `PagePrefs`, a double-click on the grip resets.

The view also changes the page's arrangement. In table view the list page is `width: "fill"` (the table takes the row until a detail opens). In rail view it is `width: "small"`, flush with the left nav and full height, so the detail fills the rest. The page sets its own width from the view and calls `reshape()`; the grid only draws.

## A new Page subclass, or a setting?

- **A setting** when the data, the routes and the detail stay the same and only the drawing or the arrangement changes: table or rail, a width, a background, a colour scheme. This is the common case.
- **A subclass** when the page brings something new to do: its own data feeds, its own lifecycle (`activated()` opens a stream), its own `route(id)`. `AISessionsPage extends Page` for exactly that reason.
- A layout is never a subclass.

## One grid, not three

Before this, the site had three: `ext/DataGrid` (behaviour), `ui/datagrid` (its markup) and `ui/table` (a plain table), and the Sessions page used none of them. Now:

- **`ext/DataGrid` is the base.** It already has the behaviour (one resize listener, sort, filters, windowing) and is the only one with state.
- **`ui/datagrid`'s markup moves in** as `DataGrid.head()`, `body()` and `template()`. The old file re-exports them, so `import { datagrid } from "/app.js"` keeps working.
- **`ui/table` moves in** as `DataGrid.table(head, rows)`, still a native `<table>`: a five-row table in a doc page is prose, not a data grid, and it keeps its look on every page that uses it. The old file re-exports it.
- Nothing is deleted.

## Fast with thousands of rows

- A fixed-height row (`row_height`) gets true windowing: only the rows on screen exist.
- A variable-height row (a session's name can wrap a prompt line under it) renders the first page of rows, and the next page arrives by itself when a sentinel at the bottom scrolls into view. "Show more" stays as the keyboard fallback.
- A live change redraws one row (`AISessionView` already subscribes to its session), never the grid.

## Alternatives weighed

- **`view` as a seventh Page word.** Rejected for now: the six words are layout for every page; `view` only means something to a page whose content is a list. It sits in `settings`, which already merges any key.
- **A `RailGrid extends DataGrid`.** Rejected: exactly the "new class for a little bit different layout" the owner named.
- **`ui/datagrid` as the base.** Rejected: it is stateless markup; the behaviour, which is most of the work, is in `ext/DataGrid`.

## Built (2026-10-12)

- The fold, the two drawers, the hooks and the view setting landed as designed; the demo on [the Overview page](/framework/ext/DataGrid/) shows the toggle beside a live view of the instance.
- [Sessions](/framework/ai/sessions/) draws its list with one DataGrid: its row is `AISessionView`, its card is `AISessionView.render_card()`, its order and nesting are `AISessionsPage.arrange()` (the `sort_rows` hook, now always called, so a page supplies its default order too).
- Measured with the same script before and after ([perf-sessions.mjs](/framework/ai/2026-10-12/data-grid/sessions-perf/perf-sessions.mjs), three runs each, four widths): long tasks ~430–680 ms → ~50–130 ms, DOM nodes ~5,900 → ~2,700 (50 rows drawn first instead of 200, the rest load as you scroll), first row about the same (0.9–1.8 s, noisy).
- One small change to Page: `page_settings()` now also reads a `view` key, so the default can sit in `settings.jsonl`.
