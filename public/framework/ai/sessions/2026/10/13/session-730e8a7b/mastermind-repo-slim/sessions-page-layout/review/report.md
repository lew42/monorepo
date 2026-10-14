verdict: fix
1. [fix] Ask 2 "first row in the top ~25% at 1200" is not met — shots/sessions/1200.png: first row title at y≈370 of 900 (≈41%); the filter chips (routine and role, two rows each) take the band between y 130 and 340. At 1920 the first row is at y≈387 of 1080 (≈36%).
2. [fix] The status rail is still two lines at 1200 and six lines at 400 (shots/sessions/1200.png bottom, 400.png bottom ≈ 150 px). The ask was one line of small text and icons; the "show 30 more days" button and the "1 open task on this page" chip are still plain buttons, not icon chips. Only 1920 comes close to one line.
3. [fix] Ask 3 day scoping is not visible — the breadcrumb reads "2026 / October" with ‹ › and "today"; there is no day level, so /2026/10/13/ cannot be reached from it (shots/sessions/1200.png, band under the title).
4. [fix] At 1920 the Role cell clips the MASTERMIND tag under the SERVEX tag on the first row (shots/sessions/1920.png, row 1, Role/Source columns).
5. [note] The page left a status-rail CSS-only diff; there is no layout.json for shots/sessions, so tab_rows, bands and left padding were judged from the shots. The diff is mostly files.jsonl churn (unrelated gone/added lines); only sessions.css matters.
6. [note] The status rail's fixed `.ai-gauge` and `white-space: nowrap` meters make the 400 rail tall; let them stack as one chip per meter or hide the gauges below ~600px.

Widths given: 400, 1200, 1920, 3440 (page layout).

## Requirements
- 1 "Measure first: y of first row, footer height, left padding, before screenshot" — not verifiable from this diff — no before shot or numbers in the folder given
- 2a "header block shrinks so first row sits in top ~25% at 1200" — no — first row ≈41% down (shots/sessions/1200.png)
- 2b "footer becomes a one-line status rail, small text, icons/chips" — partly — one line at 1920, two at 1200, six at 400
- 2c "'inbox 1, 1 new' link gone" — yes — not present in any shot
- 2d "open-tasks expander becomes a chip" — partly — it is a small chip on the rail but still reads "1 open task on this page" with a button look
- 2e "left padding matches the gutter token" — yes — list sits inside the card with the same inset as the title (shots/sessions/1200.png)
- 3 "year / month / day breadcrumb, month default, most recent first" — partly — year and month only, no day; month default and newest first are yes
- 4 "left rail for sub-views (grid, docs, versions)" — yes — Sessions, Docs, Readme, Dashboard v2, All versions in shots/sessions/1200.png; at 400 it becomes a wrapped row of links, not a rail
- 5 "check_page at four widths, 1200 before/after pair" — partly — four shots exist, no before shot
- 6 "report with numbers" — not in this folder
## Page structure
- page 1 — yes — shots/sessions/1920.png: title "Sessions" and the grid say what it is
- page 2 — yes — the grid is the main thing, filters above it
- page 3 — no — chips and filters push the content down (finding 1)
## Navigation
- techniques: top tabs (AI), a left rail (sub-views), a sidebar, a bottom bar at 400
- rail — yes at 1200 and 1920; no at 400, where it flows as a wrapped row (shots/sessions/400.png, "All versions" on its own line)
- tabs — yes — one tab row at 1200 and 1920, two rows at 400 (tab_rows 2 on other pages)
## Layout
- grid uses the width — yes — shots/sessions/1920.png, table spans the card
- filters take too much height — no — finding 1
## Sizing
- table columns — no — Role cell too narrow at 1920 (finding 4)
- rail width — yes — narrow and steady at 1200 and 1920
## Wrapping
- wraps that should not — no — 400: status rail wraps to six lines; 1920 Role column wraps "task-/mastermind" on row 1
## Spacing and padding
- yes — row rhythm is even at 1920; chip rows are tight but readable; 400 rail has uneven gaps
## Colour and contrast
- yes — grey text on white at small size is readable; red filter summary line stands out against the grey (shots/sessions/1200.png)
## Flow
- no — the eye passes four filter rows before the first session (finding 1)
## Words
- "1 open task on this page" — yes, but "tasks" is the owner's word here, fine
- "show 30 more days" — note — unclear what it extends; a month breadcrumb already scopes the list
- "$$$" in "78 $$$" — note — jargon
