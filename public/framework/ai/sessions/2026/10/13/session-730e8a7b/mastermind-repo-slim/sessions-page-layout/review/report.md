verdict: fix
1. [fix] Requirements 3 and 4 (year/month/day scoping routes, left rail for sub-views) have no change in the diff — the only code change is `sessions.css`, a status-line tweak (diff.patch).
2. [fix] The shots do not show the Sessions grid. They are the day inbox, a data-grid task page and two task pages, so requirements 1, 2 and 5 (first-row y, rows visible, before/after) cannot be judged. Widths given: all four (400, 1200, 1920, 3440).
3. [fix] In the day-inbox shots the "6 open tasks on this page, 1 on pages inside it" expander and the "inbox 1, 1 new" link are still at the bottom (`shots/…-framework-ai-2026-10-13/sheet.png`, bottom band, all widths). If that page is meant to be in scope, requirement 2 is unmet. If it is out of scope, the wrong pages were shot.
4. [note] Most of the diff is `files.jsonl` / `page.jsonl` churn unrelated to the task.

## Requirements
- 1 "Measure first (first-row y, footer height, left padding)" — not measured — no numbers in the shots' layout.json for the Sessions grid
- 2 "Compact: first row in the top ~25%; footer becomes a status rail; inbox link gone; expander becomes a chip" — partly — the CSS flows the counts into one status line and hides the dollars line (sessions.css), but the grid is not shown and the inbox link / expander remain on the shot pages
- 3 "Year / month / day scoping as routes, month default" — no — nothing in the diff
- 4 "Left rail for sub-views" — no — nothing in the diff
- 5 "check_page at four widths, before/after pair" — no — the shots are of other pages, with no before shots
- 6 "Report on the card with numbers" — not measured — no numbers

## Page structure
- title says what the page is — yes — day page "Tuesday, October 13", `shots/…-ai-2026-10-13/1200.png`
- one clear takeaway above the fold on the Sessions page — not measured — page not shot

## Navigation
- techniques used — tabs (AI top tabs), a sidebar; no left sub-view rail
- tab rows — 2 at 400, 1 at 1200 (layout.json `tab_rows`) — yes at 1200, note at 400
- left rail for sub-views — no — not built

## Layout
- the grid uses the screen — not measured — Sessions page not shot
- day page at 3440 — no — empty 0.61, content sits in a narrow column (`shots/…-ai-2026-10-13/3440.png`)

## Sizing
- bands — n/a for the Sessions page; day page bands are title 8%, index 53% at 400 (layout.json)

## Wrapping
- h1 "Tuesday, October 13" wraps to 2 lines at 400 (layout.json wraps) — no, a note
- rail buttons ✦AI and ⋯More show lines 3.2 at 400 — no

## Spacing and padding
- left padding matches the gutter token — not measured — h1 `doc-well` 14px at 400 and 19px at 1200 on the shot pages; the Sessions grid was not measured

## Colour and contrast
- n/a — the diff changes no colours

## Flow
- status rail reads as one line — not measured — not shown in any shot

## Words
- status chips and counts — n/a — no new words in the diff
