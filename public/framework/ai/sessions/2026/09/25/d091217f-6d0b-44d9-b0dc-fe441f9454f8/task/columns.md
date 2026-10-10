# Do resizable columns remember their width?

**Verdict: no. Nothing is saved, per page or otherwise.** A dragged width lives only on the column's element, so a reload or a trip away and back forgets it.

## Measured (headless Playwright, 1920px wide, `/framework/core/Page/overview/columns/`)

| moment | column widths (px) |
| --- | --- |
| first load | 224, 224, 224 |
| after dragging the first seam +250px | **474**, 224, 224 |
| after reload | 224, 224, 224 |
| after leaving for `/framework/` and going Back | 224, 224, 224 |

No `localStorage` key was written by the drag. Screenshots: `cols-before.png` (first load), `cols-dragged.png` (474), `cols-after.png` (after reload: back to 224).

The code agrees: `column_grab()` and `resize_column()` in `core/Page/Page.class.js` only set three inline CSS variables (`--page-column-flex`, `-min`, `-max`) on the body. The comment above `resize_column` says "Per VISIT… where a width would be stored is open."

## Fix spec

- **Key:** `lew42:cols:<page.url>` in localStorage, one JSON object per page. The page that owns the column is the key, so each page keeps its own width even when the same page appears in different rows. Value: `{ "<column page url>": px }`.
- **Store px, not a fraction.** The owner's sizes are content-driven (500 to 2000px), not screen-driven. Clamp on read with the existing `column_floor` and the row's `clientWidth`, so a saved 2000px on a narrow window still fits.
- **Where:** reuse the existing guarded store helper near line 1091 of `Page.class.js` (private-mode safe). Write once on `lostpointercapture` in `column_grab`, not on every pointermove. Read in `column()` (or `render_column`) right after the body is built, by calling `resize_column($body, saved)`.
- **Reset:** the existing double-click on the seam already calls `resize_column($body)` with no width. Make it also delete that column's entry from the store.
- **Ignore under `even` mode** (`column_even`), where widths are computed.

## Test that proves it

Headless, at 1920px: open the columns page, record widths, drag the first seam +250px, assert width rose by about 250 and `localStorage` holds the key; reload and assert the width is still within 1px of the dragged one; navigate to `/framework/` and Back and assert the same; double-click the seam and assert it returns to 224 and the key entry is gone. Repeat on a second page and assert its width is unchanged (per-page).
