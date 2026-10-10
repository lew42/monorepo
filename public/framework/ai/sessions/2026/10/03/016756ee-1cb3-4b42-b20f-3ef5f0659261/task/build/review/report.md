verdict: fix
1. [fix] At 400 the Created date filter runs off the right edge: the "to" input is cut in half (wrapping 1). The date and number filter rows are `flex` without `wrap`; the chip row has `wrap` and fits. Evidence: shots/…ext-DataGrid/400.png, filter band. layout.json says `overflow_x false` only because the overflow is clipped, not because it fits.
2. [fix] The listener count is wrong in three places (requirements, "say how many listeners"). DataGrid.js's header comment, doc/perf.md and the readme all say "exactly 4 listeners, ever". The class also adds a `click` listener (sort) on the header and a `scroll` listener on the grid, so the real count is 6, plus a `change` listener on each filter input. Still 0 on `document`, so the fix itself holds; only the number is wrong.
3. [note] On a wide screen the grid is boxed into the ~600px text measure. At 3440 the page is 77% empty, and the Note column still clips its text ("Row 0 — filtered by status" wraps inside the cell). A data grid is a wide thing and should be allowed past the reading measure (sizing 1). Evidence: shots/…ext-DataGrid/3440.png, sheet.png; layout.json empty 0.774 at 3440.
4. [note] The page tells before it shows (page 2). A dense paragraph and a code block come before the live grid, so at 400 only the header row of the grid is above the fold. Putting the live grid first and the code after it would show the takeaway straight away. Evidence: shots/…ext-DataGrid/400.png, 1200.png.
5. [note] The readme's advice to set `--datagrid-height` to `"none"` breaks a windowed grid. DataGrid.css sets `block-size: var(--datagrid-height)`, and `block-size: none` is invalid there. The height falls back to `auto`, the grid grows to its full spacer height, and `clientHeight` then renders every row, so windowing turns off without any error.
6. [note] `ui/datagrid` has no `readme.md` and no `doc/`, and CLAUDE.md asks every module for both. Its Index line in ui/readme.md also opens with "a resizable, sortable, filterable table", but this folder is the markup only and does none of that.
7. [note] The brief says the resize writes "one CSS property per frame", but it actually writes one per `pointermove` event, with no rAF throttle. The measured 6.9ms/frame shows this is harmless today, so it is a note only.

Widths given: 400, 1200, 1920, 3440 for all three pages (ext/DataGrid, ui, ui/datagrid).

## Requirements
- 1 "ui/datagrid/datagrid.js — `datagrid(columns, rows)`, a plain function, markup + CSS only, one `--col-<key>` per column defaulted inline" — yes — diff: `component(...)`, no listeners; `--col-*` set inline; shots/…ui-datagrid/1200.png renders it
- 2 "wire it into ui.js's export list and ui/page.js's wall the same way table is" — yes — ui.js exports `datagrid`; ui/page.js `children` + `methods` + `files`
- 3 "its one line to ui/readme.md's Index (alphabetical)" — yes — between crumbs and decision; wording overclaims (finding 6)
- 4 "UI = HTML + CSS only… behaviour lives in ux/; an ext/ may bundle both" one-liner — yes — ui/readme.md, under the No-listeners paragraph
- 5 "ext/DataGrid/DataGrid.js — class built ON TOP of datagrid()'s markup (import it, don't duplicate it)" — yes — imports `grid_template, datagrid_head, datagrid_body, to_len`
- 6 "rows: a plain array OR an async function" — yes — `load()` awaits a function source
- 7 "Resize — ONE pointer-event listener pair on the header row, delegated… one CSS custom property per frame" — yes — delegated `closest(".datagrid-grip")`, writes only `--col-<key>` (per event, finding 7)
- 8 "say in your log how many listeners your version mounts total" — no — it is stated, but the number is wrong: 4 claimed, 6 real (finding 2)
- 9 "Handle visibility — a full-height hit strip, visible on :hover via plain CSS" — yes — `.datagrid-grip:hover::after`, `inset-block: 0`
- 10 "Sort — click a sortable header… re-renders only the body" — yes — `wire_sort` → `apply()` → body `empty()`; header untouched
- 11 "Filter — date → from/to; small sets → chips (say your threshold); number → min/max" — yes — SMALL_SET_MAX 12 / SAMPLE_SIZE 300 commented; all three filters visible in shots/…ext-DataGrid/1200.png
- 12 "Windowing — fixed row height, one scroll listener, spacers sized to the rows not rendered; no library" — yes — ROW_H 36 matched in CSS, two spacer divs, passive scroll listener
- 13 "perf.mjs via Server/browser.mjs… 300px drag on 2,000 rows… avg frame time and CPU%, one line" — yes — perf.mjs; 6.95ms/frame, 10.0% CPU
- 14 "paste the real numbers into task.jsonl and doc/perf.md" — yes — task.jsonl has "6.95ms and 6.94ms/frame… 10.0% CPU"; doc/perf.md has the line
- 15 "ext/DataGrid/page.js — live DataGrid, 2,000 rows, date / small-set / number / text; takeaway at the top" — yes — shots/…ext-DataGrid/1200.png: bold first sentence matches the brief; "2000 rows" count
- 16 "Never sessions/page.js, never sessions.css" — yes — neither file is in the diff
## Page structure
- page 1 (says what it is) — yes — shots/…ext-DataGrid/1200.png top band: title + bold takeaway sentence
- page 2 (shown, not told; level 1 mostly above the fold) — no — prose + code before the grid; at 400 only the grid header shows above the fold (finding 4)
- page 3 (one takeaway) — yes — "a table that resizes, sorts and filters itself, and stays fast"
- page 4 (detail nested one click down) — yes — perf numbers in doc/perf.md, readme in a details block
- page 5 (index/wall preview) — yes — ui/page.js wall gets a `datagrid` child with `preview()` (zoom-50 card)
## Navigation
- navigation 1 — tabs (Overview · Docs; UI's Overview · API · Docs), the site sidebar
- tabs fit one row — yes — layout.json tab_rows 1 at every width, all three pages
- routed — yes — /framework/ext/DataGrid/ and /framework/ui/datagrid/ each have their own URL
## Layout
- layout 1 (right layout for the content) — yes — the doc layout, layout.json `layout: doc`
- layout 2 (no horizontal page overflow) — yes — overflow_x false everywhere; but the date filter is clipped at 400 (finding 1)
- layout 3 (wide content gets width) — no — the grid is held to the text measure at 1920/3440 (finding 3)
## Sizing
- sizing 1 (box sized to its content type) — no — the grid is capped at ~600px while 77% of 3440 is empty; Note column wraps (finding 3)
- sizing 2 (deliberate scroll area has a fixed height) — yes — `block-size: 28rem` on the windowed grid, documented in the CSS
- sizing 3 (no squeezed inputs) — no — at 400 the "to" date input is cut off (finding 1)
## Wrapping
- wrapping 1 (controls wrap instead of overflowing) — no — the date filter row has no `wrap` (finding 1); the chip row wraps correctly (400.png: WORKING drops to a second line)
- wrapping 2 (headings wrap acceptably) — yes — layout.json at 400: "Columns are data, not code" 2 lines, "Data grid (markup)" 2 lines, "Why a column is { key, label, …" 3 lines; long code-styled heading, acceptable
- wrapping 3 (code blocks) — yes — they scroll horizontally inside the block; widest_text 424 at 400 is the code block
## Spacing and padding
- spacing 1 (left edges line up) — yes — left_stack h1 = p at every width (28/38/67)
- spacing 2 (even rhythm between filter rows, count, grid) — yes — `gap-50` column on `.datagrid-ext`; 1200.png filter band
- spacing 3 (cell padding) — yes — `padding-block: gap-50`, `column-gap` between columns; header cells read as separate white tabs over the gray page (1200.png), a style choice
## Colour and contrast
- colour 1 (tokens, not raw colours) — yes — `--line`, `--surface`, `--prim`, `--subtle`
- colour 2 (contrast readable) — yes — body text and the muted labels are readable on gray in 1200.png; grip glow is `--prim` at 0.6 opacity on hover only
- colour 3 (dark mode) — not measured — no dark shot; all colours are tokens
## Flow
- flow 1 (reading order = importance) — no — the code comes before the live grid (finding 4)
- flow 2 (controls next to what they control) — yes — filters directly above the grid, row count between them
## Words
- content 1 (plain sentences a newcomer follows) — yes — page and readme read in full sentences
- content 2 (no internal noise on a demo page) — no (note) — "Adopting it on real pages" names a sibling task and its @handle on a public demo page; that belongs on the task card
- content 3 (claims are true) — no — "exactly 4 listeners" (finding 2); `--datagrid-height: none` advice (finding 5); Index line overclaims (finding 6)
- content 4 (names consistent) — yes — "DataGrid" for the ext and "datagrid" for the ui are used the same way throughout
