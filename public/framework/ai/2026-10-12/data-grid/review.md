verdict: pass
1. [note] The fix works where it was reported: `sessions-perf/scroll-3440-after.png` shows the grid's rows filling the 3440 screen under a solid sticky header, where `scroll-3440-before.png` gave them about a third of it, with rows showing through the header's column gaps. Only the 3440 and 1920 shots are committed; the probe also measures 1200 and 400, but those shots and the probe's JSON output are not in the task folder, so narrow widths are unproven.
2. [note] `sessions.css:43` sets `--datagrid-height: none` on a grid that pages rows in as you scroll, so drawn rows only ever grow during one visit. The ext/DataGrid readme says past 300 rows windowing needs a real height. That is fine today (the buckets cut it to about 347 rows and this page pages instead of windowing), but it is worth one line in `doc/perf.md` so a later change to windowing doesn't trip on it.
3. [note] `sessions.css:44` unclips `.panel2-body`, whose `overflow: hidden` exists to hide a closed side drawer's shadow (`panel2.css:49`). Sessions' Panel2 has no sides today (`AISessionsPage.js:57`), so nothing shows, but adding a side later would expose a closed drawer at narrow widths.
4. [note] The header change in `DataGrid.css:62-68` (one sticky subgrid row in place of a sticky cell each) applies to every DataGrid, including AIOverview and windowed grids. It is the right single fix (one header, opaque across the gaps), but only the Sessions page was shot afterward. `layout-check/…ext-DataGrid` predates this commit.
5. [note] `DataGridTable.js:32` now pages against the viewport (`root: null`). IntersectionObserver still accounts for every clipping ancestor, so grids that scroll inside themselves keep working; this is simpler than passing a scroller, and Rail could do the same (`DataGridRail.js:16`).

## Requirements
- 1 "One grid" — yes — not touched by this diff; STATE.md says ui/datagrid and ui/table re-export ext/DataGrid.
- 2 "Sessions on it without regression" — yes — this diff fixes the 3440 scroll regression (scroll-3440-before/after.png); the rail view is excluded by `:not(:has(.datagrid-view-rail))`, and paging still loads more rows.
- 3 "Architecture page first" — n/a
- 4 "Two views as a setting" — yes — the rail is untouched; the table-only rules are scoped with `:not(.datagrid-rail)` / `:has(.datagrid-view-rail)`.
- 5 "Coordinate" — n/a
- 6 "Smoke clean; commit each step" — yes — one commit, 9746e95cc, with a probe script and before/after shots.
## Words
- The new comments and the readme line each name the bug and its date in one line, in plain words — yes.
- The readme bullet (ext/DataGrid/readme.md:34) says when a page must unclip its boxes and links Sessions as the example — yes.

Widths given: none in review/shots; judged from the task's own `sessions-perf/scroll-3440-*.png` and `scroll-1920-after.png`.
